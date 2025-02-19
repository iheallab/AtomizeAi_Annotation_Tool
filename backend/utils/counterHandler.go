package utils


import (
	"context"
	// "fmt"
	"time"

	"backend/db"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetNextQuestionID() (int, error) {
	counterCollection := db.GetCollection("counters")
	filter := bson.M{"_id": "question_id"}
	update := bson.M{"$inc": bson.M{"value":1}}

	opts := options.FindOneAndUpdate().SetReturnDocument(options.After).SetUpsert(true)

	var results struct {
		Value int `bson:"value"`
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)

	defer cancel()

	err := counterCollection.FindOneAndUpdate(ctx, filter, update, opts).Decode(&results)

	if err != nil {
		return 0, err
	}

	return results.Value, nil
}