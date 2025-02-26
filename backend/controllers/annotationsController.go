package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)
func GetQuestionsToAnnotate(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		fmt.Println("Authorization header missing")
		http.Error(w, "Authorization header missing", http.StatusUnauthorized)
		return
	}

	tokenParts := strings.Split(authHeader, " ")
	if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
		fmt.Println("Invalid token format:", authHeader)
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	tokenString := tokenParts[1]
	fmt.Println("Trying to authenticate token:", tokenString) // ✅ Debugging log

	token, err := utils.ValidateJWT(tokenString)
	if err != nil || !token.Valid {
		fmt.Println("Token validation failed:", err)
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	fmt.Println("Token authenticated successfully")

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		fmt.Println("Invalid token claims")
		http.Error(w, "Invalid token claims", http.StatusUnauthorized)
		return
	}

	userID, ok := claims["user_id"].(float64) // Ensure user_id exists in token
	if !ok {
		fmt.Println("User ID not found in token")
		http.Error(w, "Invalid user ID in token", http.StatusUnauthorized)
		return
	}

	fmt.Println("User authenticated:", userID)

	assignmentCollection := db.GetCollection("assignments")
	questionsCollection := db.GetCollection("questions")
	annotationsCollection := db.GetCollection("annotations") // Add annotations collection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	fmt.Println("Fetching assigned questions for user:", userID)

	// Find assignment by user_id
	var assignment struct {
		QuestionIDs []primitive.ObjectID `bson:"question_ids"`
	}
	err = assignmentCollection.FindOne(ctx, bson.M{"user_id": userID}).Decode(&assignment)
	if err != nil {
		http.Error(w, "Assignment not found", http.StatusNotFound)
		return
	}

	// Fetch all questions using the retrieved question_ids
	var questions []bson.M
	cursor, err := questionsCollection.Find(ctx, bson.M{"_id": bson.M{"$in": assignment.QuestionIDs}})
	if err != nil {
		http.Error(w, "Error retrieving questions", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &questions); err != nil {
		http.Error(w, "Error decoding questions", http.StatusInternalServerError)
		return
	}

	// Fetch annotations for assigned questions
	var annotations []bson.M
	annotationCursor, err := annotationsCollection.Find(ctx, bson.M{"_id": bson.M{"$in": assignment.QuestionIDs}})
	if err != nil {
		http.Error(w, "Error retrieving annotations", http.StatusInternalServerError)
		return
	}
	defer annotationCursor.Close(ctx)

	if err = annotationCursor.All(ctx, &annotations); err != nil {
		http.Error(w, "Error decoding annotations", http.StatusInternalServerError)
		return
	}

	// Create a map for quick lookup of annotations by question ID
	annotationMap := make(map[primitive.ObjectID]bson.M)
	for _, annotation := range annotations {
		id, _ := annotation["_id"].(primitive.ObjectID)
		annotationMap[id] = annotation
	}

	// Merge annotations with questions
	var finalQuestions []bson.M
	for _, question := range questions {
		qID, _ := question["_id"].(primitive.ObjectID)
		if annotatedData, exists := annotationMap[qID]; exists {
			annotatedData["annotated"]=true
			finalQuestions = append(finalQuestions, annotatedData) // Return annotated version
		} else {
			question["annotated"]=false
			finalQuestions = append(finalQuestions, question) // Return original question
		}
	}

	// Create JSON response
	response := map[string]interface{}{
		"user_id":     userID,
		"assigned_at": time.Now().Unix(),
		"questions":   finalQuestions,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)

	fmt.Println("Returned assigned questions for user:", userID)
}


func AnnotateQuestion(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		fmt.Println("Authorization header missing")
		http.Error(w, "Authorization header missing", http.StatusUnauthorized)
		return
	}

	tokenParts := strings.Split(authHeader, " ")
	if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
		fmt.Println("Invalid token format:", authHeader)
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	tokenString := tokenParts[1]
	fmt.Println("Trying to authenticate token:", tokenString)

	token, err := utils.ValidateJWT(tokenString)
	if err != nil || !token.Valid {
		fmt.Println("Token validation failed:", err)
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	fmt.Println("Token authenticated successfully")

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		fmt.Println("Invalid token claims")
		http.Error(w, "Invalid token claims", http.StatusUnauthorized)
		return
	}

	userID, ok := claims["user_id"].(float64)
	if !ok {
		fmt.Println("User ID not found in token")
		http.Error(w, "Invalid user ID in token", http.StatusUnauthorized)
		return
	}

	fmt.Println("User authenticated:", userID)

	// Parse the request body
	var annotationReq models.Question
	fmt.Print("Annotation Request: ", r.Body)
	annotationReq.AnnotatedBy = int(userID)
	err = json.NewDecoder(r.Body).Decode(&annotationReq)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Ensure the question ID is valid
	if annotationReq.ID.IsZero() {
		http.Error(w, "Missing or invalid question_id", http.StatusBadRequest)
		return
	}

	annotationsCollection := db.GetCollection("annotations")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Check if annotation already exists for the given question
	filter := bson.M{"_id": annotationReq.ID}
	var existingAnnotation models.Question
	err = annotationsCollection.FindOne(ctx, filter).Decode(&existingAnnotation)

	if err == nil {
		// Annotation exists, update it
		update := bson.M{
			"$set": bson.M{
				"question_id":     annotationReq.QuestionID,
				"question":        annotationReq.Question,
				"category":        annotationReq.Category,
				"retrieval_tasks": annotationReq.RetrievalTasks,
				"annotated_by":    annotationReq.AnnotatedBy,
				"main_feedback":   annotationReq.MainFeedback,
			},
		}
		_, err = annotationsCollection.UpdateOne(ctx, filter, update)
		if err != nil {
			http.Error(w, "Error updating annotation", http.StatusInternalServerError)
			return
		}
		fmt.Println("Updated annotation for question:", annotationReq.ID)
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"message": "Annotation updated successfully"}`))
		return
	}

	// Annotation does not exist, create a new one
	_, err = annotationsCollection.InsertOne(ctx, annotationReq)
	if err != nil {
		http.Error(w, "Error inserting annotation", http.StatusInternalServerError)
		return
	}

	fmt.Println("Inserted new annotation for question:", annotationReq.ID)
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(`{"message": "Annotation created successfully"}`))
}