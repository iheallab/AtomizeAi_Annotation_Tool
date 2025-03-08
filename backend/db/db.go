package db

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var DB *mongo.Database

func ConnectDB(){
	clientOptions := options.Client().ApplyURI("mongodb+srv://ehruser:ehrpassword@post-discharge.oienw.mongodb.net/")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)

	defer cancel()

	client, err := mongo.Connect(ctx, clientOptions)

	if err!= nil {
		log.Fatal("Error connecting to database:", err)
	}

	DB = client.Database("EHR_Chatbot")
	fmt.Println("Connected to database")
}

func GetCollection(collectionName string) *mongo.Collection{
	return DB.Collection(collectionName)
}