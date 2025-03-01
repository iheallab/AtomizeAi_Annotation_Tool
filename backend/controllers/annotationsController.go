package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"context"
	"encoding/json"

	// "fmt"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// =======================
// 📌 GET QUESTIONS TO ANNOTATE
// =======================
func GetQuestionsToAnnotate(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, "Authorization header missing", http.StatusUnauthorized)
		return
	}

	tokenParts := strings.Split(authHeader, " ")
	if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
		http.Error(w, "Invalid token format", http.StatusUnauthorized)
		return
	}

	tokenString := tokenParts[1]
	token, err := utils.ValidateJWT(tokenString)
	if err != nil || !token.Valid {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		http.Error(w, "Invalid token claims", http.StatusUnauthorized)
		return
	}

	userID, ok := claims["user_id"].(float64)
	if !ok {
		http.Error(w, "Invalid user ID in token", http.StatusUnauthorized)
		return
	}

	assignmentCollection := db.GetCollection("assignments")
	questionsCollection := db.GetCollection("questions")
	annotationsCollection := db.GetCollection("annotations")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Find assigned questions for the user
	var assignment struct {
		QuestionIDs []primitive.ObjectID `bson:"question_ids"`
	}
	err = assignmentCollection.FindOne(ctx, bson.M{"user_id": userID}).Decode(&assignment)
	if err != nil {
		http.Error(w, "Assignment not found", http.StatusNotFound)
		return
	}

	// Fetch assigned questions
	var questions []models.Question
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
	var annotations []models.Question
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

	// Create a map for quick annotation lookup
	annotationMap := make(map[primitive.ObjectID]models.Question)
	for _, annotation := range annotations {
		annotationMap[annotation.ID] = annotation
	}

	// Merge annotations with questions
	var finalQuestions []models.Question
	for _, question := range questions {
		if annotatedData, exists := annotationMap[question.ID]; exists {
			annotatedData.QuestionValid = true // Mark as annotated
			finalQuestions = append(finalQuestions, annotatedData)
		} else {
			question.QuestionValid = false // Mark as not annotated
			finalQuestions = append(finalQuestions, question)
		}
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"user_id":     userID,
		"assigned_at": time.Now().Unix(),
		"questions":   finalQuestions,
	})
}

// =======================
// 📌 ANNOTATE QUESTION
// =======================
func AnnotateQuestion(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, "Authorization header missing", http.StatusUnauthorized)
		return
	}

	tokenParts := strings.Split(authHeader, " ")
	if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
		http.Error(w, "Invalid token format", http.StatusUnauthorized)
		return
	}

	tokenString := tokenParts[1]
	token, err := utils.ValidateJWT(tokenString)
	if err != nil || !token.Valid {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		http.Error(w, "Invalid token claims", http.StatusUnauthorized)
		return
	}

	userID, ok := claims["user_id"].(float64)
	if !ok {
		http.Error(w, "Invalid user ID in token", http.StatusUnauthorized)
		return
	}

	// Parse the request body
	var annotationReq models.Question
	err = json.NewDecoder(r.Body).Decode(&annotationReq)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	annotationReq.AnnotatedBy = int(userID) // Assign user ID

	// Ensure the question ID is valid
	if annotationReq.ID.IsZero() {
		http.Error(w, "Missing or invalid question_id", http.StatusBadRequest)
		return
	}

	annotationsCollection := db.GetCollection("annotations")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Check if annotation already exists
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
				"question_valid":  true, // Mark as annotated
			},
		}
		_, err = annotationsCollection.UpdateOne(ctx, filter, update)
		if err != nil {
			http.Error(w, "Error updating annotation", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"message": "Annotation updated successfully"}`))
		return
	}

	// Insert new annotation
	_, err = annotationsCollection.InsertOne(ctx, annotationReq)
	if err != nil {
		http.Error(w, "Error inserting annotation", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(`{"message": "Annotation created successfully"}`))
}
