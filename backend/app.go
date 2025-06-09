package main

import (
	"backend/db"
	"backend/routes"
	"fmt" //printing
	"log"
	"net/http" //for http server
)

func main() {
	db.ConnectDB()
	r := routes.InitializeRoutes()

	fmt.Println("Server is running on port 5000")
	log.Fatal(http.ListenAndServe(":5000", r))
}
