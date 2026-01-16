package config

import "os"

func GetGeminiAPIKey() string {
	key := os.Getenv("GEMINI_API_KEY")
	if key == "" {
		panic("GEMINI_API_KEY environment variable is required")
	}
	return key
}
