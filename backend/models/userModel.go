package models

import "time"

// import (
// 	"fmt"
// )

type User struct {
	UserId         int       `json:"user_id" bson:"user_id"`
	Username       string    `json:"username"`
	Password       string    `json:"password"`
	FirstName      string    `json:"first_name"`
	LastName       string    `json:"last_name"`
	Email          string    `json:"email"`
	JobTitle       string    `json:"job_title"`
	Specialization string    `json:"specialization"`
	CreatedAt      time.Time `json:"created_at" bson:"created_at"`
}
