package routes

import (
	// "net/http"
	"backend/controllers"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func InitializeRoutes() http.Handler {
	r := mux.NewRouter()

	// Lab Member Access:
	r.HandleFunc("/insert_questions", controllers.InsertQuestions).Methods("POST")

	r.HandleFunc("/upload", controllers.UploadFile).Methods("POST")

	r.HandleFunc("/questions", controllers.GetQuestions).Methods("GET")

	r.HandleFunc("/questions", controllers.UpdateQuestion).Methods("PUT")

	r.HandleFunc("/questions", controllers.DeleteQuestion).Methods("DELETE")

	r.HandleFunc("/add_assignment", controllers.AddAssignment).Methods("POST")

	r.HandleFunc("/add_user", controllers.AddUser).Methods("POST")

	r.HandleFunc("/annotations", controllers.GetQuestionsToAnnotate).Methods("GET")

	r.HandleFunc("/annotations", controllers.AnnotateQuestion).Methods("POST")


	// User Access:

	r.HandleFunc("/login", controllers.Login).Methods("POST")

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders: []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	handler := c.Handler(r)
	// r.HandleFunc("/get_annot_questions_list", controllers.)

	return handler
}