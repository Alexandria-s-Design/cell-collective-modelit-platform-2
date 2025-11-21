package main

type LogLevel string

type LogUser struct {
	ID    int
	Email string
	Name  string
}

type CreateLogRequestBody struct {
	Level    LogLevel               `json:"level"`
	File     string                 `json:"file"`
	Line     int                    `json:"line"`
	Group    string                 `json:"group"`
	Action   string                 `json:"action"`
	Message  string                 `json:"message"`
	Stack    string                 `json:"stack"`
	User     LogUser                `json:"user"`
	JsonData map[string]interface{} `json:"jsondata"`
}

type Response struct {
	Message string        `json:"message"`
	Code    int           `json:"code"`
	Status  string        `json:"status"`
	Data    []interface{} `json:"data"`
}

type ResponseData struct {
	Id        string `json:"id"`
	Date      string `json:"date"`
	Level     string `json:"level"`
	File      string `json:"file"`
	Group     string `json:"group"`
	Action    string `json:"action"`
	Message   string `json:"message"`
	UserId    string `json:"userId"`
	UserEmail string `json:"userEmail"`
	UserName  string `json:"userName"`
	Stack     string `json:"stack"`
}

type YearPageData struct {
	Year   string
	Months []string
}

type FoldersPageData struct {
	Years []YearPageData
}

type DayPageData struct {
	Day     string
	LogFile string
}

type DocumentsPageData struct {
	Days  []DayPageData
	Month string
	Year  string
}
