package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

func InsertQuestions(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	var requestData struct {
		Questions []models.Question `json:"questions"`
	}

	err := json.NewDecoder(r.Body).Decode(&requestData)
	if err != nil {
		http.Error(w, "Invalid JSON Format", http.StatusBadRequest)
		return
	}

	collection := db.GetCollection("questions")
	var insertDocs []interface{}

	for i, data := range requestData.Questions {
		questionID, err := utils.GetNextQuestionID()
		if err != nil {
			http.Error(w, "Error generating QuestionID", http.StatusInternalServerError)
			return
		}

		// Assign unique MongoDB ObjectID and Question ID
		data.ID = primitive.NewObjectID()
		data.QuestionID = questionID
		data.QuestionValid = nil
		data.MainFeedback = "" // Default empty feedback
		data.ResoningValid = nil

		// Ensure retrieval tasks and their variables are properly initialized
		for taskIdx := range data.RetrievalTasks {
			if data.RetrievalTasks[taskIdx].ID == 0 {
				data.RetrievalTasks[taskIdx].ID = taskIdx + 1 // Ensure unique task IDs
			}

			// Initialize each variable with `IsValid`
			for varIdx := range data.RetrievalTasks[taskIdx].Variables {
				data.RetrievalTasks[taskIdx].Variables[varIdx].IsValid = true
			}
		}

		fmt.Printf("Prepared Question #%d → QuestionID: %d\n", i+1, questionID)
		fmt.Println("Final Data:", data)

		insertDocs = append(insertDocs, data)
	}

	// Insert into MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := collection.InsertMany(ctx, insertDocs)
	if err != nil {
		http.Error(w, "Error inserting data: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Success Response
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":      "Data inserted successfully",
		"inserted_ids": result.InsertedIDs,
	})
	fmt.Println("Data inserted successfully:", result.InsertedIDs)
}
