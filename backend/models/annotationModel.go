package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Annotation struct {
	ID             primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	QuestionID     int                `json:"question_id" bson:"question_id"`
	Question       string             `json:"question" bson:"question"`
	Category       []string           `json:"category" bson:"category"`
	ICUTopic       string             `json:"icu_topic" bson:"icu_topic"`
	RetrievalTasks []RetrievalTask    `json:"retrieval_tasks" bson:"retrieval_tasks"`
	AnnotatedBy    int                `json:"annotated_by" bson:"annotated_by"`
	Reasoning      string             `json:"reasoning" bson:"reasoning"`
	QuestionValid  bool               `json:"question_valid" bson:"question_valid"`
	ResoningValid  bool               `json:"reasoning_valid" bson:"reasoning_valid"`
	MainFeedback   string             `json:"main_feedback,omitempty" bson:"main_feedback,omitempty"`
	Context        string             `json:"context" bson:"context"`
	MissingData    bool               `json:"missing_data" bson:"missing_data"`
	CreatedAt      time.Time          `bson:"created_at,omitempty" json:"created_at,omitempty"`
	UpdatedAt      time.Time          `bson:"updated_at,omitempty" json:"updated_at,omitempty"`
}
