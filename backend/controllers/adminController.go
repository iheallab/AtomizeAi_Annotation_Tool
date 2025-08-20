package controllers

import (
	"backend/db"
	"context"
	"encoding/json"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type UserStats struct {
	UserId           int       `json:"userId"`
	Username         string    `json:"username"`
	FirstName        string    `json:"firstName"`
	LastName         string    `json:"lastName"`
	Email            string    `json:"email"`
	TotalAnnotations int       `json:"totalAnnotations"`
	ValidQuestions   int       `json:"validQuestions"`
	InvalidQuestions int       `json:"invalidQuestions"`
	SkippedQuestions int       `json:"skippedQuestions"`
	LastActive       time.Time `json:"lastActive"`
}

type AnnotationSummary struct {
	TotalQuestions     int `json:"totalQuestions"`
	CompletedQuestions int `json:"completedQuestions"`
	ValidQuestions     int `json:"validQuestions"`
	InvalidQuestions   int `json:"invalidQuestions"`
	SkippedQuestions   int `json:"skippedQuestions"`
}

type AdminStatsResponse struct {
	Users   []UserStats       `json:"users"`
	Summary AnnotationSummary `json:"summary"`
}

type AnnotatorProgress struct {
	UserId             int       `json:"userId"`
	Username           string    `json:"username"`
	FirstName          string    `json:"firstName"`
	LastName           string    `json:"lastName"`
	Email              string    `json:"email"`
	TotalAssigned      int       `json:"totalAssigned"`
	Completed          int       `json:"completed"`
	Skipped            int       `json:"skipped"`
	CompletionRate     float64   `json:"completionRate"`
	IsFinished         bool      `json:"isFinished"`
	LastActive         time.Time `json:"lastActive"`
	AssignedQuestions  []int     `json:"assignedQuestions"`
	CompletedQuestions []int     `json:"completedQuestions"`
	SkippedQuestions   []int     `json:"skippedQuestions"`
}

type AnnotatorProgressResponse struct {
	Annotators []AnnotatorProgress `json:"annotators"`
	Summary    struct {
		TotalAnnotators    int     `json:"totalAnnotators"`
		FinishedAnnotators int     `json:"finishedAnnotators"`
		AverageCompletion  float64 `json:"averageCompletion"`
	} `json:"summary"`
}

func GetAnnotatorProgress(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get collections
	usersCollection := db.GetCollection("users")
	assignmentsCollection := db.GetCollection("assignments")
	annotationsCollection := db.GetCollection("annotations")

	// Get all users (annotators)
	cursor, err := usersCollection.Find(ctx, bson.M{})
	if err != nil {
		http.Error(w, "Error fetching users", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var users []struct {
		UserId    int    `bson:"user_id"`
		Username  string `bson:"username"`
		FirstName string `bson:"firstname"`
		LastName  string `bson:"lastname"`
		Email     string `bson:"email"`
	}

	if err = cursor.All(ctx, &users); err != nil {
		http.Error(w, "Error parsing users", http.StatusInternalServerError)
		return
	}

	var annotators []AnnotatorProgress
	totalCompletion := 0.0
	finishedCount := 0

	for _, user := range users {
		// Skip admin users (assuming user_id <= 10 are admins)
		if user.UserId <= 10 {
			continue
		}

		// Get user's current assignments (current batch)
		var assignment struct {
			QuestionIDs        []int `bson:"question_ids"`
			SkippedQuestionIDs []int `bson:"skipped_question_ids"`
		}

		err := assignmentsCollection.FindOne(ctx, bson.M{"user_id": user.UserId}).Decode(&assignment)
		if err != nil && err != mongo.ErrNoDocuments {
			continue // Skip if error (not just no documents)
		}

		// Get user's annotations (all historical annotations)
		annotationCollection := annotationsCollection
		if user.UserId <= 10 {
			annotationCollection = db.GetCollection("annotations_dev")
		}

		annotationCursor, err := annotationCollection.Find(ctx, bson.M{"annotated_by": user.UserId})
		if err != nil {
			continue
		}
		defer annotationCursor.Close(ctx)

		var annotations []struct {
			QuestionID int       `bson:"question_id"`
			CreatedAt  time.Time `bson:"created_at"`
		}

		if err = annotationCursor.All(ctx, &annotations); err != nil {
			continue
		}

		// Create a map of all completed questions (historical)
		allCompletedQuestions := make(map[int]bool)
		var lastActive time.Time

		// Find the most recent annotation timestamp
		for _, annotation := range annotations {
			allCompletedQuestions[annotation.QuestionID] = true
			if annotation.CreatedAt.After(lastActive) {
				lastActive = annotation.CreatedAt
			}
		}

		// If no annotations found, use a default time (or skip this user)
		if lastActive.IsZero() {
			lastActive = time.Date(1970, 1, 1, 0, 0, 0, 0, time.UTC) // Unix epoch start
		}

		// Calculate current assigned questions (excluding skipped)
		currentAssignedQuestions := make([]int, 0)
		skippedQuestions := assignment.SkippedQuestionIDs
		skippedMap := make(map[int]bool)
		for _, skipped := range skippedQuestions {
			skippedMap[skipped] = true
		}

		for _, questionID := range assignment.QuestionIDs {
			if !skippedMap[questionID] {
				currentAssignedQuestions = append(currentAssignedQuestions, questionID)
			}
		}

		// Calculate completion of current batch
		currentCompletedQuestions := make([]int, 0)
		currentSkippedQuestions := make([]int, 0)

		for _, questionID := range currentAssignedQuestions {
			if allCompletedQuestions[questionID] {
				currentCompletedQuestions = append(currentCompletedQuestions, questionID)
			}
		}

		// Add skipped questions from current batch
		for _, skippedID := range skippedQuestions {
			if !skippedMap[skippedID] { // This shouldn't happen, but just in case
				currentSkippedQuestions = append(currentSkippedQuestions, skippedID)
			}
		}

		// Calculate historical completed questions (not in current batch)
		historicalCompletedQuestions := make([]int, 0)
		currentAssignedMap := make(map[int]bool)
		for _, qid := range currentAssignedQuestions {
			currentAssignedMap[qid] = true
		}
		for _, qid := range skippedQuestions {
			currentAssignedMap[qid] = true
		}

		for questionID := range allCompletedQuestions {
			if !currentAssignedMap[questionID] {
				historicalCompletedQuestions = append(historicalCompletedQuestions, questionID)
			}
		}

		// Calculate completion rate based on current batch only
		completionRate := 0.0
		totalCurrentAssigned := len(currentAssignedQuestions)
		if totalCurrentAssigned > 0 {
			completionRate = float64(len(currentCompletedQuestions)) / float64(totalCurrentAssigned) * 100
		}

		// Check if finished current batch
		isFinished := totalCurrentAssigned > 0 && len(currentCompletedQuestions) >= totalCurrentAssigned

		if isFinished {
			finishedCount++
		}
		totalCompletion += completionRate

		// Get last active time (use current time as placeholder, you might want to track this separately)
		// lastActive is already calculated above from the most recent annotation

		annotator := AnnotatorProgress{
			UserId:             user.UserId,
			Username:           user.Username,
			FirstName:          user.FirstName,
			LastName:           user.LastName,
			Email:              user.Email,
			TotalAssigned:      totalCurrentAssigned,           // Only current batch
			Completed:          len(currentCompletedQuestions), // Only current batch completed
			Skipped:            len(currentSkippedQuestions),   // Only current batch skipped
			CompletionRate:     completionRate,                 // Based on current batch
			IsFinished:         isFinished,                     // Based on current batch
			LastActive:         lastActive,
			AssignedQuestions:  currentAssignedQuestions,                                           // Current batch only
			CompletedQuestions: append(currentCompletedQuestions, historicalCompletedQuestions...), // All completed (for reference)
			SkippedQuestions:   currentSkippedQuestions,                                            // Current batch only
		}

		annotators = append(annotators, annotator)
	}

	// Calculate summary
	averageCompletion := 0.0
	if len(annotators) > 0 {
		averageCompletion = totalCompletion / float64(len(annotators))
	}

	response := AnnotatorProgressResponse{
		Annotators: annotators,
		Summary: struct {
			TotalAnnotators    int     `json:"totalAnnotators"`
			FinishedAnnotators int     `json:"finishedAnnotators"`
			AverageCompletion  float64 `json:"averageCompletion"`
		}{
			TotalAnnotators:    len(annotators),
			FinishedAnnotators: finishedCount,
			AverageCompletion:  averageCompletion,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func GetQuestionAssignmentSummary(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get collections
	annotationsCollection := db.GetCollection("annotations")
	assignmentsCollection := db.GetCollection("assignments")
	questionsCollection := db.GetCollection("questions")

	// Step 1: Get all question IDs from annotations with user details
	annotationPipeline := mongo.Pipeline{
		{{"$project", bson.D{
			{"question_id", 1},
			{"annotated_by", 1},
			{"_id", 0},
		}}},
	}

	annotationCursor, err := annotationsCollection.Aggregate(ctx, annotationPipeline)
	if err != nil {
		http.Error(w, "Error fetching annotation data", http.StatusInternalServerError)
		return
	}
	defer annotationCursor.Close(ctx)

	var annotationResults []struct {
		QuestionID  int `bson:"question_id"`
		AnnotatedBy int `bson:"annotated_by"`
	}

	if err = annotationCursor.All(ctx, &annotationResults); err != nil {
		http.Error(w, "Error parsing annotation data", http.StatusInternalServerError)
		return
	}

	// Step 2: Get all question IDs from assignments with user details
	assignmentPipeline := mongo.Pipeline{
		{{"$match", bson.D{
			{"user_id", bson.D{{"$gt", 10}}},
		}}},
		{{"$project", bson.D{
			{"question_ids", 1},
			{"user_id", 1},
			{"_id", 0},
		}}},
		{{"$unwind", "$question_ids"}},
	}

	assignmentCursor, err := assignmentsCollection.Aggregate(ctx, assignmentPipeline)
	if err != nil {
		http.Error(w, "Error fetching assignment data", http.StatusInternalServerError)
		return
	}
	defer assignmentCursor.Close(ctx)

	var assignmentResults []struct {
		QuestionID int `bson:"question_ids"`
		UserID     int `bson:"user_id"`
	}

	if err = assignmentCursor.All(ctx, &assignmentResults); err != nil {
		http.Error(w, "Error parsing assignment data", http.StatusInternalServerError)
		return
	}

	// Step 3: Get all question IDs from questions collection
	questionsPipeline := mongo.Pipeline{
		{{"$project", bson.D{
			{"question_id", 1},
			{"_id", 0},
		}}},
	}

	questionsCursor, err := questionsCollection.Aggregate(ctx, questionsPipeline)
	if err != nil {
		http.Error(w, "Error fetching questions data", http.StatusInternalServerError)
		return
	}
	defer questionsCursor.Close(ctx)

	var questionsResults []struct {
		QuestionID int `bson:"question_id"`
	}

	if err = questionsCursor.All(ctx, &questionsResults); err != nil {
		http.Error(w, "Error parsing questions data", http.StatusInternalServerError)
		return
	}

	// Step 4: Calculate assignment counts and user details
	questionAssignmentCounts := make(map[int]int)
	questionUserDetails := make(map[int]map[int]bool) // question_id -> map[user_id]bool for deduplication

	// Count annotations
	for _, result := range annotationResults {
		if questionUserDetails[result.QuestionID] == nil {
			questionUserDetails[result.QuestionID] = make(map[int]bool)
		}
		// Only count if this user hasn't been counted for this question before
		if !questionUserDetails[result.QuestionID][result.AnnotatedBy] {
			questionAssignmentCounts[result.QuestionID]++
			questionUserDetails[result.QuestionID][result.AnnotatedBy] = true
		}
	}

	// Count assignments
	for _, result := range assignmentResults {
		if questionUserDetails[result.QuestionID] == nil {
			questionUserDetails[result.QuestionID] = make(map[int]bool)
		}
		// Only count if this user hasn't been counted for this question before
		if !questionUserDetails[result.QuestionID][result.UserID] {
			questionAssignmentCounts[result.QuestionID]++
			questionUserDetails[result.QuestionID][result.UserID] = true
		}
	}

	// Step 5: Categorize questions
	type QuestionDetail struct {
		QuestionID int   `json:"question_id"`
		UserIDs    []int `json:"user_ids"`
		Count      int   `json:"count"`
	}

	var lessThanTwice []QuestionDetail
	var moreThanTwice []QuestionDetail
	var exactlyTwice []QuestionDetail

	for _, qResult := range questionsResults {
		qid := qResult.QuestionID
		count := questionAssignmentCounts[qid]

		// Convert map keys to slice for user IDs
		userIDs := []int{}
		if userMap, exists := questionUserDetails[qid]; exists {
			for userID := range userMap {
				userIDs = append(userIDs, userID)
			}
		}

		detail := QuestionDetail{
			QuestionID: qid,
			UserIDs:    userIDs,
			Count:      count,
		}

		if count < 2 {
			lessThanTwice = append(lessThanTwice, detail)
		} else if count > 2 {
			moreThanTwice = append(moreThanTwice, detail)
		} else {
			exactlyTwice = append(exactlyTwice, detail)
		}
	}

	// Step 6: Prepare response
	response := map[string]interface{}{
		"summary": map[string]interface{}{
			"total_questions": len(questionsResults),
			"less_than_twice": map[string]interface{}{
				"count":     len(lessThanTwice),
				"questions": lessThanTwice,
			},
			"exactly_twice": map[string]interface{}{
				"count":     len(exactlyTwice),
				"questions": exactlyTwice,
			},
			"more_than_twice": map[string]interface{}{
				"count":     len(moreThanTwice),
				"questions": moreThanTwice,
			},
		},
		"detailed_counts": questionAssignmentCounts,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
