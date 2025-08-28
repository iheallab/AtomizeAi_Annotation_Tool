package main

import (
	"backend/db"
	"context"
	"fmt"
	"log"
	"strconv"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

func main() {
	// Initialize database connection
	db.ConnectDB()

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Collections to migrate
	collections := []string{"questions", "annotations", "annotations_dev"}

	for _, collectionName := range collections {
		fmt.Printf("Migrating collection: %s\n", collectionName)
		collection := db.GetCollection(collectionName)

		// Find all documents with string batch_id
		cursor, err := collection.Find(ctx, bson.M{
			"batch_id": bson.M{"$type": "string"},
		})
		if err != nil {
			log.Printf("Error finding documents in %s: %v\n", collectionName, err)
			continue
		}
		defer cursor.Close(ctx)

		var documents []bson.M
		if err = cursor.All(ctx, &documents); err != nil {
			log.Printf("Error decoding documents from %s: %v\n", collectionName, err)
			continue
		}

		fmt.Printf("Found %d documents with string batch_id in %s\n", len(documents), collectionName)

		// Update each document
		for _, doc := range documents {
			batchIDStr, ok := doc["batch_id"].(string)
			if !ok {
				continue
			}

			// Try to convert string to int
			batchIDInt, err := strconv.Atoi(batchIDStr)
			if err != nil {
				log.Printf("Error converting batch_id '%s' to int in %s: %v\n", batchIDStr, collectionName, err)
				continue
			}

			// Update the document
			filter := bson.M{"_id": doc["_id"]}
			update := bson.M{"$set": bson.M{"batch_id": batchIDInt}}

			result, err := collection.UpdateOne(ctx, filter, update)
			if err != nil {
				log.Printf("Error updating document in %s: %v\n", collectionName, err)
				continue
			}

			if result.ModifiedCount > 0 {
				fmt.Printf("Updated document in %s: batch_id '%s' -> %d\n", collectionName, batchIDStr, batchIDInt)
			}
		}
	}

	fmt.Println("Migration completed!")
}
