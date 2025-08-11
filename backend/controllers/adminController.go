package controllers

import (
	"backend/db"
	"backend/models"
	"context"
	"encoding/json"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
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

func GetUserStats(w http.ResponseWriter, r *http.Request) {
	// Check if user is admin
	userID := r.Context().Value("user_id").(int)
	usersCollection := db.GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var adminUser models.User
	err := usersCollection.FindOne(ctx, bson.M{"user_id": userID}).Decode(&adminUser)
	if err != nil || adminUser.Role != "admin" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get all users
	var users []models.User
	cursor, err := usersCollection.Find(ctx, bson.M{})
	if err != nil {
		http.Error(w, "Error fetching users", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &users); err != nil {
		http.Error(w, "Error parsing users", http.StatusInternalServerError)
		return
	}

	// Get annotations collection
	annotationsCollection := db.GetCollection("annotations")

	// Prepare response
	var userStats []UserStats
	var summary AnnotationSummary

	// Calculate stats for each user
	for _, user := range users {
		// Get user's annotations
		annotationCount, err := annotationsCollection.CountDocuments(ctx, bson.M{"annotated_by": user.UserId})
		if err != nil {
			continue
		}

		validCount, err := annotationsCollection.CountDocuments(ctx, bson.M{
			"annotated_by":   user.UserId,
			"question_valid": true,
		})
		if err != nil {
			continue
		}

		invalidCount, err := annotationsCollection.CountDocuments(ctx, bson.M{
			"annotated_by":   user.UserId,
			"question_valid": false,
		})
		if err != nil {
			continue
		}

		// Get last active time from the most recent annotation
		var lastAnnotation models.Annotation
		opts := options.FindOne().SetSort(bson.M{"updated_at": -1})
		err = annotationsCollection.FindOne(ctx,
			bson.M{"annotated_by": user.UserId},
			opts,
		).Decode(&lastAnnotation)

		lastActive := user.CreatedAt
		if err == nil {
			lastActive = lastAnnotation.UpdatedAt
		}

		stats := UserStats{
			UserId:           user.UserId,
			Username:         user.Username,
			FirstName:        user.FirstName,
			LastName:         user.LastName,
			Email:            user.Email,
			TotalAnnotations: int(annotationCount),
			ValidQuestions:   int(validCount),
			InvalidQuestions: int(invalidCount),
			LastActive:       lastActive,
		}

		userStats = append(userStats, stats)

		// Update summary
		summary.TotalQuestions += int(annotationCount)
		summary.ValidQuestions += int(validCount)
		summary.InvalidQuestions += int(invalidCount)
		summary.CompletedQuestions += int(validCount + invalidCount)
	}

	// Get skipped questions from assignments
	assignmentsCollection := db.GetCollection("annotation_assignments")
	pipeline := mongo.Pipeline{
		{{"$group", bson.D{
			{"_id", nil},
			{"totalSkipped", bson.D{{"$sum", bson.D{{"$size", "$skipped_question_ids"}}}}},
		}}},
	}

	cursor, err = assignmentsCollection.Aggregate(ctx, pipeline)
	if err == nil {
		var result []bson.M
		if err = cursor.All(ctx, &result); err == nil && len(result) > 0 {
			summary.SkippedQuestions = int(result[0]["totalSkipped"].(int64))
		}
	}

	response := AdminStatsResponse{
		Users:   userStats,
		Summary: summary,
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
