package handlers

import (
	"net/http"
	"taskmanager/middleware"

	"github.com/gin-gonic/gin"
)

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request body"})
		return
	}

	if req.Email == "admin@test.com" && req.Password == "123" {
		token, err := middleware.GenerateToken(req.Email)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to generate token"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"access_token": token,
			"token_type":   "bearer",
		})
		return
	}

	c.JSON(http.StatusUnauthorized, gin.H{"message": "Email/password salah"})
}
