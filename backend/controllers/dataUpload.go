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

	// fmt.Println("Parsed JSON:", requestData)
	for i, data := range requestData.Questions {
		questionID, err := utils.GetNextQuestionID()
		if err != nil {
			http.Error(w, "Error generating QuestionID", http.StatusInternalServerError)
			return
		}

		data.ID = primitive.NewObjectID() // Generate MongoDB ObjectID
		data.QuestionID = questionID      // Assign unique QuestionID

		for idx := range data.RetrievalTasks {
			fmt.Println("current id ", idx)
			if data.RetrievalTasks[idx].ID == 0 {
				data.RetrievalTasks[idx].ID = idx
			}
			fmt.Println("task id ", data.RetrievalTasks[idx].ID)
			data.RetrievalTasks[idx].IsValid = true
		}


		data.MainFeedback = ""

		fmt.Println("final data : ", data)

		insertDocs = append(insertDocs, data)
		fmt.Printf("Prepared Question #%d → QuestionID: %d\n", i+1, questionID)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := collection.InsertMany(ctx, insertDocs)

	if err != nil {
		http.Error(w, "Error inserting data: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":      "Data inserted successfully",
		"inserted_ids": result.InsertedIDs,
	})
	fmt.Println("Data inserted successfully:", result.InsertedIDs)
}
