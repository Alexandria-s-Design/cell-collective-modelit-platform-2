package main

import (
	"net/http"
)

func AppRouter(mux *http.ServeMux) {
	mux.HandleFunc("/", corsMiddleware(homeRouter))
	mux.HandleFunc("/add/log", corsMiddleware(createLogRouter))
	mux.HandleFunc("/logs", corsMiddleware(fetchAllYearsRouter))
	mux.HandleFunc("/logs/days", corsMiddleware(fetchAllDaysRouter))
	mux.HandleFunc("/logs/view", corsMiddleware(viewLogRouter))
}
