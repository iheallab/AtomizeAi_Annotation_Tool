package utils

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// replace in env vars
var jwtSecret = []byte("my-secret-key")

func GenerateJWTToken(username string, user_id int) (string, error){
	expirationTime := time.Now().Add(24 * time.Hour)

	claims := &jwt.MapClaims{
		"username" : username,
		"user_id" : user_id,
		"exp" : expirationTime.Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString(jwtSecret)

	if err != nil {
		return "", err
	}

	return tokenString, nil
}


func ValidateJWT(tokenString string) (*jwt.Token, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtSecret, nil
	})

	if err != nil {
		fmt.Println("JWT Validation Failed:", err) // ✅ Log error
	}

	return token, err
}