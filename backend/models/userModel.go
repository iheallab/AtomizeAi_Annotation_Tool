package models

// import (
// 	"fmt"
// )

type User struct{
	UserId int `json:"user_id"`
	Username string `json:"username"`
	Password string `json:"password"`
}