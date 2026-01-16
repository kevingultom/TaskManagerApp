package handlers

import (
	"net/http"
	"taskmanager/config"
	"taskmanager/models"
	"time"

	"github.com/gin-gonic/gin"
)

type TaskRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      string `json:"status"`
	Deadline    string `json:"deadline"`
	AssigneeID  *uint  `json:"assignee_id"`
}

// GET /tasks
func GetTasks(c *gin.Context) {
	var tasks []models.Task
	config.DB.Preload("Assignee").Find(&tasks)
	c.JSON(http.StatusOK, tasks)
}

// POST /tasks
func CreateTask(c *gin.Context) {
	var req TaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request body"})
		return
	}

	var deadline time.Time
	if req.Deadline != "" {
		parsedDeadline, err := time.Parse("2006-01-02", req.Deadline)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid deadline format (use YYYY-MM-DD)"})
			return
		}
		deadline = parsedDeadline
	}

	status := req.Status
	if status == "" {
		status = "Todo"
	}

	task := models.Task{
		Title:       req.Title,
		Description: req.Description,
		Status:      status,
		Deadline:    deadline,
		AssigneeID:  req.AssigneeID,
	}

	config.DB.Create(&task)
	config.DB.Preload("Assignee").First(&task, task.ID)

	c.JSON(http.StatusOK, task)
}

func UpdateTask(c *gin.Context) {
	id := c.Param("id")

	var task models.Task
	if err := config.DB.First(&task, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Task not found"})
		return
	}

	var req TaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request body"})
		return
	}

	var deadline time.Time
	if req.Deadline != "" {
		parsedDeadline, err := time.Parse("2006-01-02", req.Deadline)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid deadline format (use YYYY-MM-DD)"})
			return
		}
		deadline = parsedDeadline
	}

	task.Title = req.Title
	task.Description = req.Description
	task.Status = req.Status
	if task.Status == "" {
		task.Status = "Todo"
	}
	task.Deadline = deadline
	task.AssigneeID = req.AssigneeID

	config.DB.Save(&task)
	config.DB.Preload("Assignee").First(&task, task.ID)

	c.JSON(http.StatusOK, task)
}

// DELETE /tasks/:id
func DeleteTask(c *gin.Context) {
	id := c.Param("id")

	var task models.Task
	if err := config.DB.First(&task, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Task not found"})
		return
	}

	config.DB.Delete(&task)
	c.JSON(http.StatusOK, gin.H{"message": "Task deleted"})
}
