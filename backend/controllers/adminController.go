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
