package controllers

import (
	"backend/db"
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
	fmt.Println("Trying to authenticate token:", tokenString) // ✅ Print token for debugging

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
	fmt.Println("Token claims:", claims)

	userID, ok := claims["user_id"].(float64) // Ensure user_id exists in token
	if !ok {
		fmt.Println("User ID not found in token")
		http.Error(w, "Invalid user ID in token", http.StatusUnauthorized)
		return
	}

	fmt.Println("User authenticated:", userID)

	assignmentCollection := db.GetCollection("assignments")
	questionsCollection := db.GetCollection("questions")
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

	// Create JSON response
	response := map[string]interface{}{
		"user_id":     userID,
		"assigned_at": time.Now().Unix(),
		"questions":   questions,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)

	fmt.Println("Returned assigned questions for user:", userID)



}