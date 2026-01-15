package handlers

import (
	"net/http"
	"taskmanager/config"
	"taskmanager/models"

	"github.com/gin-gonic/gin"
)

func GetUsers(c *gin.Context) {
	var users []models.User
	config.DB.Find(&users)
	c.JSON(http.StatusOK, users)
}
