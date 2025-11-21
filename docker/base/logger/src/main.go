package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	router := http.NewServeMux()
	AppRouter(router)
	fmt.Printf("Server running (port=8085)")
	if err := http.ListenAndServe(":8085", router); err != nil {
		log.Fatal(err)
	}
}
