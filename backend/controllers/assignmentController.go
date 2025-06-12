package controllers

import (
	"backend/db"
	"backend/models"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// AddAssignment assigns questions in a given range to a user (UserID is an int)
// If the assignment already exists, it updates the question list instead of creating a new entry.
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

	// Fetch questions in the given range
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

	// Extract QuestionIDs
	var questionIDs []int
	for _, question := range questions {
		questionIDs = append(questionIDs, question.QuestionID)
	}
	// Sort the slice in ascending order
	sort.Ints(questionIDs)

	// Query to check if an assignment exists for this user
	updateFilter := bson.M{"user_id": userID}

	// Update document:
	update := bson.M{
		"$addToSet": bson.M{"question_ids": bson.M{"$each": questionIDs}}, // Merge new question IDs
		"$set":      bson.M{"assigned_at": time.Now().Unix()},             // Always update timestamp
	}

	// Ensure upsert works correctly
	opts := options.Update().SetUpsert(true)

	// Perform update
	updateResult, err := collection.UpdateOne(ctx, updateFilter, update, opts)
	if err != nil {
		http.Error(w, "Error updating assignment", http.StatusInternalServerError)
		return
	}

	// Return success response
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":       "Assignment updated successfully",
		"user_id":       userID,
		"assigned_ids":  questionIDs,
		"modifiedCount": updateResult.ModifiedCount,
		"upsertedCount": updateResult.UpsertedCount,
	})
	fmt.Println("Updated assignment for user:", userID, "with questions:", questionIDs)
}
