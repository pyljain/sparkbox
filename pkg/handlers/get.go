package handlers

import (
	"fmt"
	"io"
	"net/http"
	"sparkbox/pkg/middleware"

	"cloud.google.com/go/storage"
)

func GetFile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	workflowId := r.PathValue("workflowID")
	filename := r.PathValue("filename")

	storageClient := r.Context().Value(middleware.StorageContext).(*storage.Client)

	bucket := storageClient.Bucket(bucketName)
	reader, err := bucket.Object(fmt.Sprintf("%s/%s", workflowId, filename)).NewReader(r.Context())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	defer reader.Close()
	_, err = io.Copy(w, reader)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// w.WriteHeader(http.StatusOK)
}
