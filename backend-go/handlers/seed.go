package handlers

import (
	"net/http"
	"taskmanager/config"
	"taskmanager/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func SeedUsers(c *gin.Context) {
	// Hash password dengan bcrypt
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("123"), bcrypt.DefaultCost)

	users := []models.User{
		{Name: "Kevin Gultom", Email: "kevin@demo.com", Password: string(hashedPassword)},
		{Name: "Andi", Email: "andi@demo.com", Password: string(hashedPassword)},
		{Name: "Siti", Email: "siti@demo.com", Password: string(hashedPassword)},
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
