package middleware

import (
	"context"
	"log"
	"net/http"

	"cloud.google.com/go/storage"
)

type ContextType string

const (
	StorageContext  ContextType = "storageContext"
	DatabaseContext ContextType = "databaseContext"
	UserContext     ContextType = "userContext"
)

func Ctx(next http.Handler) http.Handler {
	storageClient, err := storage.NewClient(context.Background())
	if err != nil {
		log.Printf("unable to create storage client: %v", err)
		return nil
	}

	// dbClient, err := sql.Open("sqlite3", "./sparkbox.db")
	// if err != nil {
	// 	log.Printf("unable to create the database client: %v", err)
	// 	return nil
	// }

	// _, err = dbClient.Exec("CREATE TABLE IF NOT EXISTS files (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, filename TEXT NOT NULL, foldername TEXT NOT NULL, file TEXT NOT NULL, user_id TEXT NOT NULL)")
	// if err != nil {
	// 	log.Printf("unable to create the database table: %v", err)
	// 	return nil
	// }

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		ctx := r.Context()

		ctx = context.WithValue(ctx, StorageContext, storageClient)
		// ctx = context.WithValue(ctx, DatabaseContext, dbClient)
		ctx = context.WithValue(ctx, UserContext, "ab12345")

		newReq := r.WithContext(ctx)
		next.ServeHTTP(w, newReq)
	})
}
