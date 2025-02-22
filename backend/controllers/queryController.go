package controllers

import (
	"encoding/json"
	"fmt"
	"backend/models"
	"backend/db"
	"context"
	"time"
	// "strconv"
	"net/http"
	"go.mongodb.org/mongo-driver/bson"
	// "go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func GetQuestions(w http.ResponseWriter, r *http.Request){
	collection := db.GetCollection("questions")

	// page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	// limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	filter_question := r.URL.Query().Get("search")
	fmt.Println("searching for", filter_question)
	// if page < 1{
	// 	page = 1
	// }

	// if limit < 1 {
	// 	limit = 10
	// }
	// skip := (page - 1) * limit

	filter := bson.M{}

	if filter_question != "" {
		// Use more robust regex matching
		filter["question"] = bson.M{
			"$regex": primitive.Regex{
				Pattern: filter_question, 
				Options: "i",
			},
		}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// findOptions := options.Find()
	// findOptions.SetSkip(int64(skip))
	// findOptions.SetLimit(int64(limit))

	cursor, err := collection.Find(ctx, filter)

	if err != nil {
		http.Error(w, "Error getting data"+err.Error(), http.StatusInternalServerError)
		return
	}

	defer cursor.Close(ctx)

	var results[] models.Question
	if err:= cursor.All(ctx, &results); err != nil {
		http.Error(w, "Error getting data"+err.Error(), http.StatusInternalServerError)
		return
	}	

	fmt.Printf("Found %d results\n", len(results))

	if len(results) == 0 {
		// Optional: Return empty array instead of null
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]models.Question{})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
	fmt.Println("Data sent successfully")
}

func UpdateQuestion(w http.ResponseWriter, r *http.Request){

	collection := db.GetCollection("questions")

	id := r.URL.Query().Get("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}
	var updatedData models.Question
	err = json.NewDecoder(r.Body).Decode(&updatedData)

	if err != nil{
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)

	defer cancel()

	update := bson.M{"$set" : updatedData}
	_, err = collection.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		http.Error(w, "Error updating data"+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Data updated successfully"})
	fmt.Println("Data updated successfully", id)

}

func DeleteQuestion(w http.ResponseWriter, r *http.Request){
	collection := db.GetCollection("questions")

	id := r.URL.Query().Get("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)

	defer cancel()	
	_, err = collection.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		http.Error(w, "Error deleting data"+err.Error(), http.StatusInternalServerError)
		return
	}	

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Data deleted successfully"})
	fmt.Println("Data deleted successfully", id)
}