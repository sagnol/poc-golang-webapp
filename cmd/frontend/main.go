package main

import (
	"bytes"
	"context"
	"html/template"
	"io"
	"log"
	"net/http"
)

func main() {
	render := func(filename string, data interface{}) ([]byte, error) {
		tmpl, err := template.ParseFiles(filename)
		if err != nil {
			return nil, err
		}

		var buf bytes.Buffer
		err = tmpl.Execute(&buf, "index")

		return buf.Bytes(), nil
	}

	servePage := func(ctx context.Context, w http.ResponseWriter, filename string, data interface{}) {
		buf, err := render(filename, data)
		if err != nil {
			log.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
		}

		if _, err := io.Copy(w, bytes.NewBuffer(buf)); err != nil {
			log.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
		}
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		servePage(ctx, w, "templates/index.html", "data")
	})

	srv := http.Server{
		Addr:    ":3000",
		Handler: mux,
	}

	if err := srv.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}
