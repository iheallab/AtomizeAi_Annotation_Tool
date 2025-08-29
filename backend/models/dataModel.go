package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// RetrievalTask represents a retrieval operation for a question
type RetrievalTaskVariable struct {
	Variable string `json:"variable" bson:"variable"`
	IsValid  bool   `json:"valid" bson:"valid"`
}

type RetrievalTask struct {
	ID   int    `json:"task_id" bson:"task_id"  // Correct syntax`
	Task string `json:"task" bson:"task"`
	// SQLQuery string `json:"sql_query" bson:"sql_query"`
	// IsValid  []bool   `json:"valid" bson:"valid"`
	Variables []RetrievalTaskVariable `json:"variables" bson:"variables"`
}

// AddedTask represents a task that was added by the annotator for missing data elements
type AddedTask struct {
	ID          string `json:"id" bson:"id"`
	Name        string `json:"name" bson:"name"`
	ConceptID   string `json:"conceptId" bson:"concept_id"`
	Category    string `json:"category" bson:"category"`
	Variable    string `json:"variable" bson:"variable"`
	Description string `json:"description,omitempty" bson:"description,omitempty"`
	Valid       bool   `json:"valid" bson:"valid"`
}

type Question struct {
	ID             primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	QuestionID     int                `json:"question_id" bson:"question_id"`
	Question       string             `json:"question" bson:"question"`
	Category       []string           `json:"category" bson:"category"`
	ICUTopic       string             `json:"icu_topic" bson:"icu_topic"`
	RetrievalTasks []RetrievalTask    `json:"retrieval_tasks" bson:"retrieval_tasks"`
	AnnotatedBy    int                `json:"annotated_by" bson:"annotated_by"`
	Reasoning      string             `json:"reasoning" bson:"reasoning"`
	QuestionValid  *bool              `json:"question_valid" bson:"question_valid"`
	ResoningValid  *bool              `json:"reasoning_valid" bson:"reasoning_valid"`
	MainFeedback   string             `json:"main_feedback,omitempty" bson:"main_feedback,omitempty"`
	Context        string             `json:"context" bson:"context"`
	MissingData    *bool              `json:"missing_data" bson:"missing_data"`
	AddedTasks     []AddedTask        `json:"added_tasks,omitempty" bson:"added_tasks,omitempty"`
	CreatedAt      *time.Time         `bson:"created_at,omitempty" json:"created_at,omitempty"`
	UpdatedAt      *time.Time         `bson:"updated_at,omitempty" json:"updated_at,omitempty"`
	Model          string             `json:"model" bson:"model"`
	BatchID        int                `json:"batch_id" bson:"batch_id"`
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
	ID                 primitive.ObjectID   `json:"_id,omitempty" bson:"_id,omitempty"`
	UserID             int                  `json:"user_id" bson:"user_id"`
	QuestionIDs        []primitive.ObjectID `json:"question_ids" bson:"question_ids"`
	SkippedQuestionIDs []primitive.ObjectID `json:"skipped_question_ids" bson:"skipped_question_ids"`
	AssignedAt         time.Time            `json:"assigned_at" bson:"assigned_at"`
	AssignCounter      AssignCounter        `json:"assign_counter" bson:"assign_counter"`
}

// AssignCounter tracks assignment statistics
type AssignCounter struct {
	AutomaticCount int                     `json:"automatic_count" bson:"automatic_count"`
	ManualCount    int                     `json:"manual_count" bson:"manual_count"`
	CurrentType    string                  `json:"current_type" bson:"current_type"`
	AssignedAt     time.Time               `json:"assigned_at" bson:"assigned_at"`
	History        []AssignmentHistoryItem `json:"history" bson:"history"`
}

// AssignmentHistoryItem represents a single assignment event
type AssignmentHistoryItem struct {
	Type        string    `json:"type" bson:"type"` // "automatic" or "manual"
	AssignedAt  time.Time `json:"assigned_at" bson:"assigned_at"`
	QuestionIDs []int     `json:"question_ids" bson:"question_ids"`
}

// AnnotationsDone tracks completed annotations per user
// type AnnotationsDone struct {
// 	ID           primitive.ObjectID   `json:"_id,omitempty" bson:"_id,omitempty"`
// 	UserID       primitive.ObjectID   `json:"user_id" bson:"user_id"`
// 	AnnotationIDs []primitive.ObjectID `json:"annotation_ids" bson:"annotation_ids"`
// 	CompletedAt  int64                `json:"completed_at" bson:"completed_at"`
// }
