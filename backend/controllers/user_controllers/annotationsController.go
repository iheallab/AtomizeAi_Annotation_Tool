package controllers

import (
	"encoding/json"
	"net/http"
	"fmt"
	"backend/db"
)


func GetQuestionsToAnnotate(w http.ResponseWriter, r *http.Request) {
	assignment_collection := db.GetCollection("assignments")
	collection := db.GetCollection("questions")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)

	fmt.Println("GetQuestionsToAnnotate")
}