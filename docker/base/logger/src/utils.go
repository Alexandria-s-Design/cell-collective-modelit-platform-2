package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"regexp"
	"text/template"
)

const (
	INFO  LogLevel = "INFO"
	WARN  LogLevel = "WARN"
	ERROR LogLevel = "ERROR"
	DEBUG LogLevel = "DEBUG"
)

const (
	HTTP_JSON_SUCCESS = "SUCCESS"
	HTTP_JSON_ERROR   = "ERROR"
)

func jsonResponse(w http.ResponseWriter, message string, statusCode int, status string, resData ...interface{}) {
	response := Response{
		Message: message,
		Code:    statusCode,
		Status:  status,
		Data:    resData,
	}

	jsonResponse, err := json.Marshal(response)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	w.Write(jsonResponse)
}

func htmlResponse(w http.ResponseWriter, templateName string, data interface{}) {
	tmpl, err := template.ParseFiles(fmt.Sprintf("/templates/%s", templateName))
	if err != nil {
		panic(err)
	}
	err = tmpl.Execute(w, data)
	if err != nil {
		panic(err)
	}
}

func removeSpecialChars(input string) string {
	re := regexp.MustCompile(`[\"\'\n\t\r]`)
	cleaned := re.ReplaceAllString(input, "")
	return cleaned
}

func removeNonJSONChars(input string) string {
	re := regexp.MustCompile("[^\\x20-\\x7E]+")
	cleaned := re.ReplaceAllString(input, "")
	return cleaned
}

func listLogFolders(directory string) ([]string, error) {
	dir, err := os.Open(directory)
	if err != nil {
		return nil, err
	}
	defer dir.Close()

	entries, err := dir.Readdir(-1)
	if err != nil {
		return nil, err
	}

	var folders []string
	for _, entry := range entries {
		if entry.IsDir() {
			folders = append(folders, entry.Name())
		}
	}

	return folders, nil
}

func listLogDocuments(directory string) ([]string, error) {
	dirEntries, err := os.ReadDir(directory)
	if err != nil {
		fmt.Println("Error:", err)
		return nil, err
	}

	var documents []string
	for _, entry := range dirEntries {
		if entry.Type().IsRegular() {
			documents = append(documents, entry.Name())
		}
	}

	return documents, nil
}
