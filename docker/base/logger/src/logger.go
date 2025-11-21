package main

import (
	"fmt"
	"log"
	"os"
	"strings"
	"time"
)

var logger *log.Logger

func init() {

	year, month, _ := time.Now().Date()

	folderPath := fmt.Sprintf("/data/%d/%02d", year, int(month))
	if err := os.MkdirAll(folderPath, 0755); err != nil {
		log.Fatalf("Failed to create log folder: %v", err)
	}

	filePath := fmt.Sprintf("%s/%d-%02d-%02d.log", folderPath, year, int(month), time.Now().Day())

	file, err := os.OpenFile(filePath, os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatalf("Failed to open log file: %v", err)
	}

	logger = log.New(file, "", 0)
}

func GetCurrLogFileName() string {
	year, month, _ := time.Now().Date()
	return fmt.Sprintf("%d/%02d/%d-%02d-%02d.log", year, int(month), year, int(month), time.Now().Day())
}

func insertLog(
	id string, level LogLevel, file string, line int,
	group string, action string, message string, user LogUser, stackTrace ...string) {
	_stackTrace := ""
	if len(stackTrace) > 0 {
		_stackTrace = strings.Join(stackTrace, "")
	}
	logger.Println(formatLog(id, level, file, line, group, action, removeSpecialChars(message), user, removeNonJSONChars(_stackTrace)))
}

func formatLog(id string, level LogLevel, file string, line int, group string, action string, message string, user LogUser, stackTrace string) string {
	return fmt.Sprintf(
		"{\"id\": \"%s\", \"date\": \"%s\", \"level\": \"%s\", \"file\": \"%s:%d\", \"group\": \"%s\", \"action\": \"%s\", \"message\": \"%s\", \"userId\": \"%d\", \"userName\": \"%s\", \"userEmail\": \"%s\", \"stack\": \"%s\"},",
		id, time.Now().UTC().Format("2006-01-02T15:04:05.000Z"), level, file, line, group, action, message, user.ID, user.Name, user.Email, stackTrace,
	)
}
