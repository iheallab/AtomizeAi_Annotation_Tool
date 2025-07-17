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
	annotationsCollection := db.GetCollection("annotations")

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

	if userID <= 10 {
		annotationsCollection = db.GetCollection("annotations_dev")
	}

	// Step 1a: Fetch already assigned question IDs from annotations collection
	cursor, err := annotationsCollection.Find(ctx, bson.M{"annotated_by": userID})
	if err != nil {
		http.Error(w, "Error fetching annotations", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	assignedMap := make(map[int]bool)
	for cursor.Next(ctx) {
		var annotation struct {
			QuestionID int `bson:"question_id"`
		}
		if err := cursor.Decode(&annotation); err != nil {
			http.Error(w, "Error decoding annotation", http.StatusInternalServerError)
			return
		}
		assignedMap[annotation.QuestionID] = true
	}

	if err := cursor.Err(); err != nil {
		http.Error(w, "Cursor error", http.StatusInternalServerError)
		return
	}

	// Step 1b: Fetch skipped_question_ids from assignments collection and add to assignedMap
	var assignment struct {
		Skipped []int `bson:"skipped_question_ids"`
	}
	err = assignmentsCollection.FindOne(ctx, bson.M{"user_id": userID}).Decode(&assignment)
	if err != nil && err != mongo.ErrNoDocuments {
		http.Error(w, "Error fetching skipped questions", http.StatusInternalServerError)
		return
	}

	// Add skipped questions to assignedMap
	for _, qid := range assignment.Skipped {
		assignedMap[qid] = true
	}

	println("add assignment for user:", userID)
	// get username by user_id
	var user models.User
	err = usersCollection.FindOne(ctx, bson.M{"user_id": userID}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Error fetching user", http.StatusInternalServerError)
		return
	}

	// Step 2: Fetch all questions
	cursor, err = questionCollection.Find(ctx, bson.M{})
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

	// Step 3: Filter out already assigned & skipped
	var newQuestionIDs []int
	for _, q := range availableQuestions {
		if !assignedMap[q.QuestionID] {
			newQuestionIDs = append(newQuestionIDs, q.QuestionID)
		}
	}

	selectedCount := requestData.Count
	if selectedCount <= 0 || selectedCount > len(newQuestionIDs) {
		selectedCount = len(newQuestionIDs) // Assign all if count is invalid or exceeds
	}
	selectedIDs := []int{}
	// Step 4a: Filter questions based on priority (not annotated by more than 2 annotators)
	highPriorityQuestions := []int{}
	lowPriorityQuestions := []int{}
	for _, q := range newQuestionIDs {
		annotationCount, err := annotationsCollection.CountDocuments(ctx, bson.M{"question_id": q})
		if err != nil {
			http.Error(w, "Error counting annotations", http.StatusInternalServerError)
			return
		}
		if annotationCount < 2 {
			highPriorityQuestions = append(highPriorityQuestions, q)
		} else {
			lowPriorityQuestions = append(lowPriorityQuestions, q)
		}
	}

	// Step 4b: Shuffle priority questions and fallback to other questions if needed
	rand.Shuffle(len(highPriorityQuestions), func(i, j int) {
		highPriorityQuestions[i], highPriorityQuestions[j] = highPriorityQuestions[j], highPriorityQuestions[i]
	})

	println("priority questions:", highPriorityQuestions)

	if len(highPriorityQuestions) >= selectedCount {
		selectedIDs = highPriorityQuestions[:selectedCount]
	} else {
		remainingCount := selectedCount - len(highPriorityQuestions)

		println("not enough priority questions, filling with random questions", remainingCount)
		for _, id := range lowPriorityQuestions {
			fmt.Println("Low Priority Question IDs:", id)
		}
		rand.Shuffle(len(lowPriorityQuestions), func(i, j int) {
			lowPriorityQuestions[i], lowPriorityQuestions[j] = lowPriorityQuestions[j], lowPriorityQuestions[i]
		})
		selectedIDs = append(highPriorityQuestions, lowPriorityQuestions[:remainingCount]...)
	}

	// Query to check if an assignment exists for this user
	updateFilter := bson.M{"user_id": userID}

	// Update document:
	update := bson.M{
		// "$addToSet": bson.M{"question_ids": bson.M{"$each": selectedIDs}}, // Merge new question IDs
		"$set": bson.M{
			"question_ids": selectedIDs,
			"assigned_at":  time.Now(), // Always update timestamp
			"username":     user.Username,
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

func ReplaceQuestionByID(w http.ResponseWriter, r *http.Request) {
	assignmentsCollection := db.GetCollection("assignments")
	questionCollection := db.GetCollection("questions")
	usersCollection := db.GetCollection("users")
	annotationsCollection := db.GetCollection("annotations")

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

	if userID <= 10 {
		annotationsCollection = db.GetCollection("annotations_dev")
	}

	var requestData struct {
		QuestionID int `json:"question_id"` // Number of questions to randomly assign
	}
	err = json.NewDecoder(r.Body).Decode(&requestData)
	if err != nil {
		http.Error(w, "Invalid JSON Format", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	assignedMap := make(map[int]bool)
	// Initialize the map with the question ID to be replaced
	assignedMap[requestData.QuestionID] = true // Include the question ID to be replaced

	// Step 1a: Fetch assigned question IDs from annotations collection
	cursor, err := annotationsCollection.Find(ctx, bson.M{"annotated_by": userID})
	if err != nil {
		http.Error(w, "Error fetching annotations", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var annotation struct {
			QuestionID int `bson:"question_id"`
		}
		if err := cursor.Decode(&annotation); err != nil {
			http.Error(w, "Error decoding annotation", http.StatusInternalServerError)
			return
		}
		assignedMap[annotation.QuestionID] = true
	}

	if err := cursor.Err(); err != nil {
		http.Error(w, "Cursor error", http.StatusInternalServerError)
		return
	}

	// Step 1b: Fetch assigned question IDs from assignments collection
	var existingAssignment struct {
		QuestionIDs []int `bson:"question_ids"`
	}
	err = assignmentsCollection.FindOne(ctx, bson.M{"user_id": userID}).Decode(&existingAssignment)
	if err != nil && err != mongo.ErrNoDocuments {
		http.Error(w, "Error fetching assignment", http.StatusInternalServerError)
		return
	}

	for _, id := range existingAssignment.QuestionIDs {
		assignedMap[id] = true
	}

	// Step 1c: Fetch skipped_question_ids from assignments collection and add to assignedMap
	var assignment struct {
		Skipped []int `bson:"skipped_question_ids"`
	}
	err = assignmentsCollection.FindOne(ctx, bson.M{"user_id": userID}).Decode(&assignment)
	if err != nil && err != mongo.ErrNoDocuments {
		http.Error(w, "Error fetching skipped questions", http.StatusInternalServerError)
		return
	}

	// Add skipped questions to assignedMap
	for _, qid := range assignment.Skipped {
		assignedMap[qid] = true
	}

	// get username by user_id
	var user models.User
	err = usersCollection.FindOne(ctx, bson.M{"user_id": userID}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Error fetching user", http.StatusInternalServerError)
		return
	}

	// Step 2: Fetch all questions
	cursor, err = questionCollection.Find(ctx, bson.M{})
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

	selectedIDs := newQuestionIDs[:1]

	// Query to check if an assignment exists for this user
	updateFilter := bson.M{"user_id": userID}

	// Update document:
	update := bson.M{
		"$pull": bson.M{
			"question_ids": requestData.QuestionID, // Remove this question ID
		},
	}

	// Ensure upsert works correctly
	opts := options.Update().SetUpsert(true)

	// Perform update
	updateResult, err := assignmentsCollection.UpdateOne(ctx, updateFilter, update, opts)
	if err != nil {
		http.Error(w, "Error removing question id from the list", http.StatusInternalServerError)
		return
	}

	// Update document:
	update = bson.M{
		"$addToSet": bson.M{"question_ids": bson.M{"$each": selectedIDs}}, // Merge new question IDs
		"$set": bson.M{
			"assigned_at": time.Now(), // Always update timestamp
			"username":    user.Username,
		},
	}

	// Ensure upsert works correctly
	opts = options.Update().SetUpsert(true)

	// Perform update
	updateResult, err = assignmentsCollection.UpdateOne(ctx, updateFilter, update, opts)
	if err != nil {
		http.Error(w, "Error updating assignment", http.StatusInternalServerError)
		return
	}

	// Return success response
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":       "Question Id " + strconv.Itoa(requestData.QuestionID) + " replaced by " + strconv.Itoa(selectedIDs[0]) + " successfully",
		"user_id":       userID,
		"assigned_ids":  selectedIDs,
		"modifiedCount": updateResult.ModifiedCount,
		"upsertedCount": updateResult.UpsertedCount,
	})
	fmt.Println("Replaced question ID", requestData.QuestionID, "with", selectedIDs[0], "for user:", userID)
}

func SkipQuestionByID(w http.ResponseWriter, r *http.Request) {
	assignmentsCollection := db.GetCollection("assignments")

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
		QuestionID int `json:"question_id"` // Number of questions to randomly assign
	}
	err = json.NewDecoder(r.Body).Decode(&requestData)
	if err != nil {
		http.Error(w, "Invalid JSON Format", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Query to check if an assignment exists for this user
	updateFilter := bson.M{"user_id": userID}

	// Update document:
	update := bson.M{
		"$pull": bson.M{
			"question_ids": requestData.QuestionID, // Remove this question ID
		},
		"$addToSet": bson.M{"skipped_question_ids": bson.M{"$each": []int{requestData.QuestionID}}},
	}

	// Ensure upsert works correctly
	opts := options.Update().SetUpsert(true)

	// Perform update
	updateResult, err := assignmentsCollection.UpdateOne(ctx, updateFilter, update, opts)
	if err != nil {
		http.Error(w, "Error removing question id from the list", http.StatusInternalServerError)
		return
	}

	// Return success response
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":       "Question Id " + strconv.Itoa(requestData.QuestionID) + " has been skipped",
		"user_id":       userID,
		"question_id":   requestData.QuestionID,
		"modifiedCount": updateResult.ModifiedCount,
		"upsertedCount": updateResult.UpsertedCount,
	})
}
