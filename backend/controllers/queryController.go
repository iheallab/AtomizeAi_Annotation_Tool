package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	// "strconv"
	"net/http"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"

	// "go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func GetQuestions(w http.ResponseWriter, r *http.Request) {
	collection := db.GetCollection("questions")

	// page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	// limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	filter_question := r.URL.Query().Get("search")
	fmt.Println("searching for", filter_question)
	// if page < 1{
	// 	page = 1
	// }

	// if limit < 1 {
	// 	limit = 10
	// }
	// skip := (page - 1) * limit

	filter := bson.M{}

	if filter_question != "" {
		// Use more robust regex matching
		filter["question"] = bson.M{
			"$regex": primitive.Regex{
				Pattern: filter_question,
				Options: "i",
			},
		}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// findOptions := options.Find()
	// findOptions.SetSkip(int64(skip))
	// findOptions.SetLimit(int64(limit))

	cursor, err := collection.Find(ctx, filter)

	if err != nil {
		http.Error(w, "Error getting data"+err.Error(), http.StatusInternalServerError)
		return
	}

	defer cursor.Close(ctx)

	var results []models.Question
	if err := cursor.All(ctx, &results); err != nil {
		http.Error(w, "Error getting data"+err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Printf("Found %d results\n", len(results))

	if len(results) == 0 {
		// Optional: Return empty array instead of null
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]models.Question{})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
	fmt.Println("Data sent successfully")
}

// func UpdateQuestion(w http.ResponseWriter, r *http.Request){

// 	collection := db.GetCollection("questions")

// 	id := r.URL.Query().Get("id")
// 	objID, err := primitive.ObjectIDFromHex(id)
// 	if err != nil {
// 		http.Error(w, "Invalid ID format", http.StatusBadRequest)
// 		return
// 	}
// 	var updatedData models.Question
// 	err = json.NewDecoder(r.Body).Decode(&updatedData)

// 	if err != nil{
// 		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
// 		return
// 	}

// 	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)

// 	defer cancel()

// 	update := bson.M{"$set" : updatedData}
// 	_, err = collection.UpdateOne(ctx, bson.M{"_id": objID}, update)
// 	if err != nil {
// 		http.Error(w, "Error updating data"+err.Error(), http.StatusInternalServerError)
// 		return
// 	}

// 	w.WriteHeader(http.StatusOK)
// 	json.NewEncoder(w).Encode(map[string]string{"message": "Data updated successfully"})
// 	fmt.Println("Data updated successfully", id)

// }

func UpdateQuestion(w http.ResponseWriter, r *http.Request) {
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

	annotationsCollection := db.GetCollection("questions")
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
				"question_valid":  annotationReq.QuestionValid,
				"tasks_complete":  annotationReq.TasksComplete,
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

func DeleteQuestion(w http.ResponseWriter, r *http.Request) {
	collection := db.GetCollection("questions")

	id := r.URL.Query().Get("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)

	defer cancel()
	_, err = collection.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		http.Error(w, "Error deleting data"+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Data deleted successfully"})
	fmt.Println("Data deleted successfully", id)
}
