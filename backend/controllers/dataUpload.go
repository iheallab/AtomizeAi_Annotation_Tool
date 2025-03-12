package controllers

import (
	"backend/db"
	"backend/models"
	"backend/utils"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

func InsertQuestions(w http.ResponseWriter, r *http.Request) {
    defer r.Body.Close()

    // Temporary struct matching JSON input format
    var requestData struct {
        Questions []struct {
            Question      string    `json:"question"`
            Context       string    `json:"context"`  // Added context field
            Category      []string  `json:"category"` // Changed to slice
            ICUType       []string  `json:"icu_type"` // Changed to slice
            RetrievalTasks []struct {
                Task     string   `json:"task"`
                Variables []string `json:"variables"`
            } `json:"retrieval_tasks"`
            Reasoning string `json:"reasoning"`
        } `json:"questions"`
    }

    decoder := json.NewDecoder(r.Body)
    decoder.DisallowUnknownFields() // Strict parsing
    err := decoder.Decode(&requestData)
    if err != nil {
        http.Error(w, "Invalid JSON Format: " + err.Error(), http.StatusBadRequest)
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

        // Convert array fields to comma-separated strings
        // category := strings.Join(data.Category, ", ")
        // icuType := strings.Join(data.ICUType, ", ")
        category := data.Category
        icuType := data.ICUType

        // Create proper Question model
        question := models.Question{
            ID:            primitive.NewObjectID(),
            QuestionID:    questionID,
            Question:      data.Question,
            Category:      category,
            ICUType:       icuType,
            Reasoning:     data.Reasoning,
            QuestionValid: nil,
            ResoningValid: nil,
            MainFeedback:  "",
            RetrievalTasks: []models.RetrievalTask{},
            Context: data.Context,
            TasksComplete: true,
        }

        // Convert retrieval tasks
        for taskIdx, task := range data.RetrievalTasks {
            var taskVars []models.RetrievalTaskVariable
            for _, v := range task.Variables {
                taskVars = append(taskVars, models.RetrievalTaskVariable{
                    Variable: strings.TrimSpace(v),
                    IsValid:  true, // Set default value instead of nil
                })
            }

            rt := models.RetrievalTask{
                ID:       taskIdx + 1,
                Task:     task.Task,
                Variables: taskVars,
            }

            question.RetrievalTasks = append(question.RetrievalTasks, rt)
        }

        fmt.Printf("Processed Question #%d → QuestionID: %d\n", i+1, questionID)
        insertDocs = append(insertDocs, question)
    }

    // Insert into MongoDB
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
}