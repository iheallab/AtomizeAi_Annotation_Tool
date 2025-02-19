package main

import (
	"fmt"
	"log"
	"backend/utils"
	"backend/db"
	"backend/models"
	"context"
	"time"

	// "go.mongodb.org/mongo-driver/bson/primitive"
)

// Manually insert a user with a hashed password into MongoDB
func main() {
	username := "Hruday"
	password := "xHf223%"

	// ✅ Hash the password correctly
	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		log.Fatal("Error hashing password:", err)
	}

	// ✅ Insert user into MongoDB
	collection := db.GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	newUser := models.User{
		UserId:   1,
		Username: username,
		Password: hashedPassword, // ✅ Store the hashed password, NOT plaintext
	}

	_, err = collection.InsertOne(ctx, newUser)
	if err != nil {
		log.Fatal("Error inserting user:", err)
	}

	fmt.Println("User successfully inserted:", username)
}
