package utils

import (
	"backend/db"
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetNextQuestionID() (int, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	counters := db.GetCollection("counters")
	questions := db.GetCollection("questions")

	// Get current max from questions collection
	var latest struct {
		QuestionID int `bson:"question_id"`
	}
	opts := options.FindOne().SetSort(bson.D{{"question_id", -1}})
	err := questions.FindOne(ctx, bson.M{}, opts).Decode(&latest)
	maxInQuestions := latest.QuestionID

	// Atomically increment counter
	filter := bson.M{"_id": "question_id"}
	update := bson.M{"$inc": bson.M{"value": 1}}
	counterOpts := options.FindOneAndUpdate().SetUpsert(true).SetReturnDocument(options.After)

	var counter struct {
		Value int `bson:"value"`
	}
	err = counters.FindOneAndUpdate(ctx, filter, update, counterOpts).Decode(&counter)
	if err != nil {
		return 0, errors.New("failed to update counter: " + err.Error())
	}

	// If counter value is less than existing max, bump it
	if counter.Value <= maxInQuestions {
		newValue := maxInQuestions + 1
		_, err := counters.UpdateOne(ctx, filter, bson.M{"$set": bson.M{"value": newValue}})
		if err != nil {
			return 0, errors.New("failed to sync counter with existing data: " + err.Error())
		}
		return newValue, nil
	}

	return counter.Value, nil
}
