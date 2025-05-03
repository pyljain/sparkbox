package handlers

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"sparkbox/pkg/middleware"

	"cloud.google.com/go/storage"
)

const (
	bucketName = "sparkbox"
)

func UploadFile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	ur := UploadRequest{}
	err := json.NewDecoder(r.Body).Decode(&ur)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// Upload file to S3
	client := r.Context().Value(middleware.StorageContext).(*storage.Client)

	bucket := client.Bucket(bucketName)
	// Upload file to bucket

	fileBytes, err := base64.StdEncoding.DecodeString(ur.Content)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	workflowID := r.PathValue("workflowID")

	oh := bucket.Object(fmt.Sprintf("%s/%s", workflowID, ur.Filename))
	writer := oh.NewWriter(r.Context())
	defer writer.Close()

	_, err = writer.Write(fileBytes)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// Write metadata to database
	// db := r.Context().Value("databaseContext").(*sql.DB)
	// db.Exec("INSERT INTO files (name, folder_name, user_id) VALUES (?, ?, ?)", ur.FilePath, ur.FolderName, userId)

	w.WriteHeader(http.StatusOK)
}

type UploadRequest struct {
	Content  string `json:"content"`
	Filename string `json:"filename"`
}
