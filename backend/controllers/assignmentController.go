package controllers

import (
	"backend/db"
	"backend/models"
	"context"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// AddAssignment assigns questions in a given range to a user (UserID is an int)
// If the assignment already exists, it updates the question list instead of creating a new entry.
func AddAssignment(w http.ResponseWriter, r *http.Request) {
	assignmentsCollection := db.GetCollection("assignments")
	questionCollection := db.GetCollection("questions")
	usersCollection := db.GetCollection("users")

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

	var requestData struct {
		Count int `json:"count"` // Number of questions to randomly assign
	}
	err = json.NewDecoder(r.Body).Decode(&requestData)
	if err != nil {
		http.Error(w, "Invalid JSON Format", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Step 1: Fetch already assigned question IDs
	var existingAssignment struct {
		QuestionIDs []int `bson:"question_ids"`
	}
	err = assignmentsCollection.FindOne(ctx, bson.M{"user_id": userID}).Decode(&existingAssignment)
	if err != nil && err != mongo.ErrNoDocuments {
		http.Error(w, "Error checking existing assignment", http.StatusInternalServerError)
		return
	}
	assignedMap := make(map[int]bool)
	for _, id := range existingAssignment.QuestionIDs {
		assignedMap[id] = true
	}

	// get username by userid
	var user models.User
	err = usersCollection.FindOne(ctx, bson.M{"userid": userID}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Error fetching user", http.StatusInternalServerError)
		return
	}

	// Step 2: Fetch all questions
	cursor, err := questionCollection.Find(ctx, bson.M{})
	if err != nil {
		http.Error(w, "Error fetching questions", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var availableQuestions []models.Question
	if err := cursor.All(ctx, &availableQuestions); err != nil {
		http.Error(w, "Error decoding questions", http.StatusInternalServerError)
		return
	}

	// Step 3: Filter out already assigned
	var newQuestionIDs []int
	for _, q := range availableQuestions {
		if !assignedMap[q.QuestionID] {
			newQuestionIDs = append(newQuestionIDs, q.QuestionID)
		}
	}

	// Step 4: Randomly select questions
	if len(newQuestionIDs) == 0 {
		http.Error(w, "No new questions available to assign", http.StatusConflict)
		return
	}
	rand.Shuffle(len(newQuestionIDs), func(i, j int) {
		newQuestionIDs[i], newQuestionIDs[j] = newQuestionIDs[j], newQuestionIDs[i]
	})

	selectedCount := requestData.Count
	if selectedCount <= 0 || selectedCount > len(newQuestionIDs) {
		selectedCount = len(newQuestionIDs) // Assign all if count is invalid or exceeds
	}
	selectedIDs := newQuestionIDs[:selectedCount]

	// Query to check if an assignment exists for this user
	updateFilter := bson.M{"user_id": userID}

	// Update document:
	update := bson.M{
		"$addToSet": bson.M{"question_ids": bson.M{"$each": selectedIDs}}, // Merge new question IDs
		"$set": bson.M{
			"assigned_at": time.Now(), // Always update timestamp
			"username":    user.Username,
		},
	}

	// Ensure upsert works correctly
	opts := options.Update().SetUpsert(true)

	// Perform update
	updateResult, err := assignmentsCollection.UpdateOne(ctx, updateFilter, update, opts)
	if err != nil {
		http.Error(w, "Error updating assignment", http.StatusInternalServerError)
		return
	}

	// Return success response
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":       "Assignment updated successfully",
		"user_id":       userID,
		"assigned_ids":  selectedIDs,
		"modifiedCount": updateResult.ModifiedCount,
		"upsertedCount": updateResult.UpsertedCount,
	})
	fmt.Println("Updated assignment for user:", userID, "with questions:", selectedIDs)
}
