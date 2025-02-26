package controllers

import (
	"fmt"
	"net/http"
	"time"

	"backend/db"
	// "backend/models"
	"backend/utils"
	"context"
	"encoding/json"

	// "go.mongodb.org/mongo-driver/bson"
	// "go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func UploadFile(w http.ResponseWriter, r *http.Request){

	file, _, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Error getting file"+err.Error(), http.StatusBadRequest)
		return
	}
	defer file.Close()

	questions, err := utils.ParseJSONFile(file)

	if err != nil {
		http.Error(w, "Error parsing file"+err.Error(), http.StatusBadRequest)
		return
	}

	collection := db.GetCollection("questions")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)

	defer cancel()

	var insertDocs []interface{}

	for _, data := range questions {
		data.ID = primitive.NewObjectID()
		for _, task := range data.RetrievalTasks {
			task.IsValid = true
		}
		insertDocs = append(insertDocs, data)
	}

	_, err = collection.InsertMany(ctx, insertDocs)
	if err != nil {
		http.Error(w, "Error inserting data"+err.Error(), http.StatusInternalServerError)
		return
	}	

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "File Parsed and inserted successfully"})
	fmt.Println("File Parsed and inserted successfully")
}