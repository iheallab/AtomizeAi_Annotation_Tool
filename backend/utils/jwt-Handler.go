package utils

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// replace in env vars
var jwtSecret = []byte("my-secret-key")

func GenerateJWTToken(username string) (string, error){
	expirationTime := time.Now().Add(24 * time.Hour)

	claims := &jwt.MapClaims{
		"username" : username,
		"expiry" : expirationTime.Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString(jwtSecret)

	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func validateJWT(tokenString string) (*jwt.Token, error){
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtSecret, nil
	})

	return token, err
}