package main

import (
	"log"
	"taskmanager/config"
	"taskmanager/handlers"
	"taskmanager/models"
	"taskmanager/middleware"

	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
)

func main() {
	// connect DB
	if err := config.ConnectDB(); err != nil {
		log.Fatal("DB connection error:", err)
	}

	// auto migrate (buat tabel users & tasks otomatis)
	config.DB.AutoMigrate(&models.User{}, &models.Task{})

	r := gin.Default()
	// CORS configuration
	r.Use(cors.New(cors.Config{
	AllowOrigins:     []string{"http://localhost:3000", "http://localhost:3001"},
	AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
	AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
	AllowCredentials: true,
}))


// public
	r.POST("/login", handlers.Login)
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// seed sementara (boleh nanti dihapus)
	r.POST("/seed", handlers.SeedUsers)

	// protected routes
	auth := r.Group("/")
	auth.Use(middleware.AuthRequired())

	auth.GET("/users", handlers.GetUsers)
	auth.GET("/tasks", handlers.GetTasks)
	auth.POST("/tasks", handlers.CreateTask)
	auth.PUT("/tasks/:id", handlers.UpdateTask)
	auth.DELETE("/tasks/:id", handlers.DeleteTask)
	auth.POST("/chat", handlers.ChatWithAI)


	r.Run(":8000")

}
