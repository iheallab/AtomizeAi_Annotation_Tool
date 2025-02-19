package routes

import (
	// "net/http"
	"github.com/gorilla/mux"
	"backend/controllers"
)

func InitializeRoutes() *mux.Router {
	r := mux.NewRouter()

	// Lab Member Access:
	r.HandleFunc("/insert_questions", controllers.InsertQuestions).Methods("POST")

	r.HandleFunc("/upload", controllers.UploadFile).Methods("POST")

	r.HandleFunc("/questions", controllers.GetQuestions).Methods("GET")

	r.HandleFunc("/questions", controllers.UpdateQuestion).Methods("PUT")

	r.HandleFunc("/questions", controllers.DeleteQuestion).Methods("DELETE")

	r.HandleFunc("/add_assignment", controllers.AddAssignment).Methods("POST")

	r.HandleFunc("/add_user", controllers.AddUser).Methods("POST")


	// User Access:

	r.HandleFunc("/login", controllers.Login).Methods("POST")

	// r.HandleFunc("/get_annot_questions_list", controllers.)

	return r
}