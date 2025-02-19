package utils

import (
	"golang.org/x/crypto/bcrypt"
)

// HashPassword generates a hashed password from a plain text string
func HashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedPassword), nil
}

// CheckPassword verifies if the provided password matches the stored hash
func CheckPassword(providedPassword, storedHash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(providedPassword))
	return err == nil
}