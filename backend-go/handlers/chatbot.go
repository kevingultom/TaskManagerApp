package handlers

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"taskmanager/config"
	"taskmanager/models"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

type ChatRequest struct {
	Message string `json:"message" binding:"required"`
}

type ChatResponse struct {
	Answer string `json:"answer"`
	Query  string `json:"query,omitempty"`
}

// POST /chat
func ChatWithAI(c *gin.Context) {
	var req ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Message is required"})
		return
	}

	// Get API Key
	apiKey := config.GetGeminiAPIKey()
	if apiKey == "" || apiKey == "YOUR_API_KEY_HERE" {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gemini API key not configured"})
		return
	}

	// Fetch current tasks from database
	var tasks []models.Task
	config.DB.Preload("Assignee").Find(&tasks)

	tasksContext := buildTasksContext(tasks)

	prompt := fmt.Sprintf(`Kamu adalah asisten AI untuk Task Manager Application.

Data Tasks Saat Ini:
%s

Pertanyaan User: %s

Instruksi:
- Jawab pertanyaan berdasarkan data tasks di atas
- Gunakan format yang mudah dibaca (bullet points, numbering)
- Jika ditanya tentang task spesifik, berikan detail lengkap
- Jika ditanya statistik, hitung dari data yang ada
- Gunakan bahasa Indonesia yang natural
- Jika data tidak ada, katakan dengan sopan

Jawaban:`, tasksContext, req.Message)

	// Call Gemini API
	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to initialize AI client"})
		return
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-2.5-flash")
	model.SetTemperature(0.7)
	model.SetMaxOutputTokens(1000)

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "AI processing failed: " + err.Error()})
		return
	}

	// Extract answer
	answer := extractAnswer(resp)

	c.JSON(http.StatusOK, ChatResponse{
		Answer: answer,
		Query:  req.Message,
	})
}

func buildTasksContext(tasks []models.Task) string {
	if len(tasks) == 0 {
		return "Tidak ada task saat ini."
	}

	var builder strings.Builder
	today := time.Now().Format("2006-01-02")

	for i, task := range tasks {
		assigneeName := "Tidak ada assignee"
		if task.Assignee != nil {
			assigneeName = task.Assignee.Name
		}

		deadline := task.Deadline.Format("2006-01-02")
		isToday := ""
		if deadline == today {
			isToday = " (HARI INI)"
		}

		builder.WriteString(fmt.Sprintf(`
%d. Task ID: %d
  Judul: %s
  Deskripsi: %s
  Status: %s
  Deadline: %s%s
  Assignee: %s
`, i+1, task.ID, task.Title, task.Description, task.Status, deadline, isToday, assigneeName))
	}

	return builder.String()
}

func extractAnswer(resp *genai.GenerateContentResponse) string {
	if resp == nil || len(resp.Candidates) == 0 {
		return "Maaf, saya tidak dapat memproses pertanyaan Anda saat ini."
	}

	var answer strings.Builder
	for _, cand := range resp.Candidates {
		if cand.Content != nil {
			for _, part := range cand.Content.Parts {
				answer.WriteString(fmt.Sprintf("%v", part))
			}
		}
	}

	result := answer.String()
	if result == "" {
		return "Maaf, tidak ada jawaban yang dihasilkan."
	}

	return result
}
