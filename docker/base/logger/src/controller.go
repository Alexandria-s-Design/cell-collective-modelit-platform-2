package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/google/uuid"
)

/*
 * GET /
 */
func homeRouter(w http.ResponseWriter, r *http.Request) {
	jsonResponse(w, "Logger system", http.StatusOK, HTTP_JSON_SUCCESS)
}

/*
 * POST /add/log
 */
func createLogRouter(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		jsonResponse(w, "Failed to read request body", http.StatusBadRequest, HTTP_JSON_ERROR)
		return
	}
	defer r.Body.Close()

	var requestBody CreateLogRequestBody
	if err := json.Unmarshal(body, &requestBody); err != nil {
		jsonResponse(w, "Failed to parse JSON in the body", http.StatusBadRequest, HTTP_JSON_ERROR)
		return
	}

	id := uuid.New()

	responseData := map[string]interface{}{
		"id":  id,
		"log": GetCurrLogFileName(),
	}

	insertLog(
		id.String(),
		requestBody.Level,
		requestBody.File,
		requestBody.Line,
		requestBody.Group,
		requestBody.Action,
		requestBody.Message,
		requestBody.User,
		requestBody.Stack,
	)
	jsonResponse(w, "Log type "+string(requestBody.Level)+" was created", http.StatusCreated, HTTP_JSON_SUCCESS, responseData)
}

/*
 * GET /logs
 */
func fetchAllYearsRouter(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	queryParams := r.URL.Query()
	output := queryParams.Get("output")

	lsFolders := []YearPageData{}
	folders, _ := listLogFolders("/data")
	for _, year := range folders {
		lsMonthsFolder := YearPageData{
			Year:   year,
			Months: []string{},
		}

		monthfolders, _ := listLogFolders("/data/" + year)
		for _, month := range monthfolders {
			addMonth := []string{month}
			lsMonthsFolder.Months = append(lsMonthsFolder.Months, addMonth...)
		}

		lsFolders = append(lsFolders, lsMonthsFolder)
	}
	data := FoldersPageData{Years: lsFolders}
	if output == "json" {
		jsonResponse(w, "List of years and months", http.StatusCreated, HTTP_JSON_SUCCESS, data)
		return
	}
	htmlResponse(w, "index.html", data)
}

/*
 * GET /logs/days
 */
func fetchAllDaysRouter(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	queryParams := r.URL.Query()
	year := queryParams.Get("year")
	month := queryParams.Get("month")
	output := queryParams.Get("output")

	lsDocs := []DayPageData{}
	docs, _ := listLogDocuments(fmt.Sprintf("/data/%s/%s", year, month))
	for _, dayLog := range docs {
		parts := strings.Split(dayLog, ".")
		parts = strings.Split(parts[0], "-")
		day := parts[2]
		lsDaysFiles := DayPageData{
			Day:     day,
			LogFile: dayLog,
		}
		lsDocs = append(lsDocs, lsDaysFiles)
	}
	data := DocumentsPageData{Days: lsDocs, Month: month, Year: year}
	if output == "json" {
		jsonResponse(w, "List of logs by date", http.StatusCreated, HTTP_JSON_SUCCESS, data)
		return
	}
	htmlResponse(w, "days.html", data)
}

/*
 *	GET /logs/view
 */
func viewLogRouter(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	queryParams := r.URL.Query()
	day := queryParams.Get("day")
	year := queryParams.Get("year")
	month := queryParams.Get("month")
	output := queryParams.Get("output")

	logPath := fmt.Sprintf("/data/%s/%s/%s-%s-%s.log", year, month, year, month, day)

	content, err := os.ReadFile(logPath)
	if err != nil {
		fmt.Println("Error:", err)
		jsonResponse(w, "Log not found", http.StatusNotFound, HTTP_JSON_ERROR)
		return
	}

	jsonStr := fmt.Sprintf("[%s {}]", removeNonJSONChars(string(content)))
	var data []ResponseData

	jsonErr := json.Unmarshal([]byte(jsonStr), &data)
	if jsonErr != nil {
		fmt.Println("Error:", jsonErr)
		jsonResponse(w, "Log has not a valid JSON content", http.StatusInternalServerError, HTTP_JSON_ERROR)
		return
	}

	if output == "json" {
		jsonResponse(w, "View log", http.StatusCreated, HTTP_JSON_SUCCESS, data)
		return
	}

	htmlResponse(w, "view.html", data)
}
