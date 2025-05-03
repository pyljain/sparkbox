package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sparkbox/pkg/middleware"
	"strings"

	"cloud.google.com/go/storage"
	"google.golang.org/api/iterator"
)

func ListFiles(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	storageClient := r.Context().Value(middleware.StorageContext).(*storage.Client)

	bucket := storageClient.Bucket(bucketName)
	workflowId := r.PathValue("workflowID")
	objects := bucket.Objects(r.Context(), &storage.Query{Prefix: fmt.Sprintf("%s/", workflowId)})

	var files []File
	for {
		attrs, err := objects.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		fname := strings.Split(attrs.Name, "/")
		files = append(files, File{
			Name:       fname[1],
			WorkflowID: workflowId,
			Size:       attrs.Size,
			UploadDate: attrs.Updated.String(),
		})
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	err := json.NewEncoder(w).Encode(files)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}

type File struct {
	Name       string `json:"name"`
	WorkflowID string `json:"workflowID"`
	Size       int64  `json:"size"`
	UploadDate string `json:"uploadDate"`
}
