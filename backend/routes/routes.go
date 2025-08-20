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

	// r.HandleFunc("/upload", controllers.UploadFile).Methods("POST")

	r.HandleFunc("/questions", controllers.GetQuestions).Methods("GET")

	// r.HandleFunc("/questions", controllers.UpdateQuestion).Methods("PUT")

	// r.HandleFunc("/questions", controllers.DeleteQuestion).Methods("DELETE")

	r.HandleFunc("/skip_question_by_id", controllers.SkipQuestionByID).Methods("POST")

	// r.HandleFunc("/replace_question_by_id", controllers.ReplaceQuestionByID).Methods("POST")

	r.HandleFunc("/annotations", controllers.GetQuestionsToAnnotate).Methods("GET")

	r.HandleFunc("/annotations", controllers.AnnotateQuestion).Methods("POST")

	r.HandleFunc("/ping", controllers.Ping).Methods("GET")

	// User Access:

	r.HandleFunc("/login", controllers.Login).Methods("POST")

	r.HandleFunc("/login_with_google", controllers.LoginWithGoogle).Methods("POST")

	r.HandleFunc("/check_user_links_with_google", controllers.CheckUserLinksWithGoogle).Methods("GET")

	r.HandleFunc("/link_user_with_google", controllers.LinkUserWithGoogle).Methods("POST")

	r.HandleFunc("/change_password", controllers.ChangePassword).Methods("POST")

	// Admin routes

	r.HandleFunc("/admin/add_user", controllers.AddUser).Methods("POST")

	r.HandleFunc("/admin/add_assignment", controllers.AddAssignment).Methods("POST")

	r.HandleFunc("/admin/question_assignment_summary", controllers.GetQuestionAssignmentSummary).Methods("GET")

	r.HandleFunc("/admin/annotator_progress", controllers.GetAnnotatorProgress).Methods("GET")

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	handler := c.Handler(r)
	// r.HandleFunc("/get_annot_questions_list", controllers.)

	return handler
}
