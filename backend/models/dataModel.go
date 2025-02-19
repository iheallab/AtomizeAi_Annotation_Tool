package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// RetrievalTask represents a retrieval operation for a question
type RetrievalTask struct {
	Table        string   `json:"table" bson:"table"`
	Task         string   `json:"task" bson:"task"`
	SQLQuery     string   `json:"sql_query" bson:"sql_query"`
	isValid 	  bool   `json:"valid" bson:"valid"`
}

type Question struct {
	ID             primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	QuestionID		int				`json:"question_id" bson:"question_id"`
	Question 		string			 `json:"question" bson:"question"`
	Category		string			 `json:"category" bson:"category"`
	RetrievalTasks []RetrievalTask	`json:"retrieval_tasks" bson:"retrieval_tasks"`
	// Annotated_By   map[string]string `json:"annotated_by" bson:"annotated_by"`

	MainFeedback   string             `json:"main_feedback,omitempty" bson:"main_feedback,omitempty"`
}

// // Question represents the original question entity
// type Question struct {
// 	ID             primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
// 	QuestionID		int				`json:"question_id" bson:"question_id"`
// 	Question       string             `json:"question" bson:"question"`
// 	Category       string             `json:"category" bson:"category"`
// 	RetrievalTasks []RetrievalTask    `json:"retrieval_tasks" bson:"retrieval_tasks"`
// 	// Annotated      bool               `json:"annotated" bson:"annotated"`
// 	MainFeedback   string             `json:"main_feedback,omitempty" bson:"main_feedback,omitempty"`
// }



// // Annotation represents an annotator's modification to a question
// type Annotation struct {
// 	ID         primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
// 	UserID     int `json:"user_id" bson:"user_id"`
// 	QuestionID primitive.ObjectID `json:"question_id" bson:"question_id"`
// 	Question   Question           `json:"question" bson:"question"`
// 	CreatedAt  int64              `json:"created_at" bson:"created_at"`
// }


// AnnotationAssignment tracks which annotators are assigned which questions
type AnnotationAssignment struct {
	ID          primitive.ObjectID   `json:"_id,omitempty" bson:"_id,omitempty"`
	UserID      int   `json:"user_id" bson:"user_id"`
	QuestionIDs []primitive.ObjectID `json:"question_ids" bson:"question_ids"`
	AssignedAt  int64                `json:"assigned_at" bson:"assigned_at"`
}


// AnnotationsDone tracks completed annotations per user
// type AnnotationsDone struct {
// 	ID           primitive.ObjectID   `json:"_id,omitempty" bson:"_id,omitempty"`
// 	UserID       primitive.ObjectID   `json:"user_id" bson:"user_id"`
// 	AnnotationIDs []primitive.ObjectID `json:"annotation_ids" bson:"annotation_ids"`
// 	CompletedAt  int64                `json:"completed_at" bson:"completed_at"`
// }
