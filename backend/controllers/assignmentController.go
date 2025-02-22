package controllers

import (
	"net/http"
	"encoding/json"
	"fmt"
	"backend/models"
	"backend/db"
	"context"
	"time"
	"strconv"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// AddAssignment assigns questions in a given range to a user (UserID is an int)
func AddAssignment(w http.ResponseWriter, r *http.Request) {
	collection := db.GetCollection("assignments")
	questionCollection := db.GetCollection("questions")

	userIDStr := r.URL.Query().Get("user_id")
	if userIDStr == "" {
		http.Error(w, "Missing user_id parameter", http.StatusBadRequest)
		return
	}

	userID, err := strconv.Atoi(userIDStr) // Convert string to int
	if err != nil {
		http.Error(w, "Invalid user_id format", http.StatusBadRequest)
		return
	}

	// Parse request body for `start` and `end`
	var requestData struct {
		Start int `json:"start"`
		End   int `json:"end"`
	}
	err = json.NewDecoder(r.Body).Decode(&requestData)
	if err != nil {
		http.Error(w, "Invalid JSON Format", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"question_id": bson.M{"$gte": requestData.Start, "$lte": requestData.End}}
	cursor, err := questionCollection.Find(ctx, filter)
	if err != nil {
		http.Error(w, "Error fetching questions", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var questions []models.Question
	if err := cursor.All(ctx, &questions); err != nil {
		http.Error(w, "Error decoding questions", http.StatusInternalServerError)
		return
	}

	// Extract QuestionIDs from fetched questions
	var questionIDs []primitive.ObjectID
	for _, question := range questions {
		questionIDs = append(questionIDs, question.ID)
	}

	// **Check for duplicate assignments**
	assignedFilter := bson.M{
		"user_id": userID,
		"question_ids": bson.M{
			"$in": questionIDs, // Check if any of these questions are already assigned
		},
	}
	existingAssignments, err := collection.CountDocuments(ctx, assignedFilter)
	if err != nil {
		http.Error(w, "Error checking existing assignments", http.StatusInternalServerError)
		return
	}

	if existingAssignments > 0 {
		http.Error(w, "Some or all of these questions are already assigned to this user", http.StatusConflict)
		return
	}

	// Create assignment record
	assignment := models.AnnotationAssignment{
		ID:          primitive.NewObjectID(),
		UserID:      userID,  // ✅ Now an int, not ObjectID
		QuestionIDs: questionIDs,
		AssignedAt:  time.Now().Unix(),
	}

	_, err = collection.InsertOne(ctx, assignment)
	if err != nil {
		http.Error(w, "Error inserting assignment", http.StatusInternalServerError)
		return
	}

	// Return success response
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":       "Assignment created successfully",
		"user_id":       userID,
		"assigned_ids":  questionIDs,
	})
	fmt.Println("Assigned questions:", questionIDs, "to user:", userID)
}
