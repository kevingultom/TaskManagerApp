package handlers

import (
	"net/http"
	"taskmanager/config"
	"taskmanager/models"

	"github.com/gin-gonic/gin"
)

func SeedUsers(c *gin.Context) {
	users := []models.User{
		{Name: "Kevin Gultom", Email: "kevin@demo.com", Password: "123"},
		{Name: "Andi", Email: "andi@demo.com", Password: "123"},
		{Name: "Siti", Email: "siti@demo.com", Password: "123"},
	}

	for _, u := range users {
		var existing models.User
		err := config.DB.Where("email = ?", u.Email).First(&existing).Error
		if err != nil {
			config.DB.Create(&u)
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Seed users done"})
}
