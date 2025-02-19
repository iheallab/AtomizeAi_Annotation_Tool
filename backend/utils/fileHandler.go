package utils

import (
	"fmt"
	"encoding/json"
	"io"
	"backend/models"
)

func ParseJSONFile(file io.Reader) ([]models.Question, error){
	var requestData struct {
		Questions []models.Question `json:"questions"`
	}

	decoder := json.NewDecoder(file)
	err := decoder.Decode(&requestData)

	if err != nil {
		fmt.Println("Error in decoding JSON", err)
		return nil, err
	}

	return requestData.Questions, nil
}