package main

import (
	"fmt"
	"net/http"
	"os"
	"sparkbox/pkg/handlers"
	"sparkbox/pkg/middleware"
)

func main() {

	router := http.NewServeMux()

	// Create endpoints to upload files
	router.HandleFunc("/api/v1/workflows/{workflowID}/files/upload", handlers.UploadFile)

	// Endpoint to read file
	router.HandleFunc("/api/v1/workflows/{workflowID}/files/{filename}", handlers.GetFile)

	// Endpoint to list files
	router.HandleFunc("/api/v1/workflows/{workflowID}/files", handlers.ListFiles)

	//Bring up server
	err := http.ListenAndServe(":3000", middleware.Ctx(router))
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error starting server: %v", err)
	}
}
