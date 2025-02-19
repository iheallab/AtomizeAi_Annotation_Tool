package main
import (
	"fmt" //printing
	"net/http" //for http server
	"log"
	"backend/routes"
	"backend/db"
)

func main() {
	db.ConnectDB()
	r := routes.InitializeRoutes()

	fmt.Println("Server is running on port 8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}