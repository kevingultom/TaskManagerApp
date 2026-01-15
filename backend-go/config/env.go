package config

import "os"

func GetGeminiAPIKey() string {
	key := os.Getenv("GEMINI_API_KEY")
	if key != "" {
		return key
	}

	return "AIzaSyDKA4PM-FioTq_PIlCqg6Rmty7THZi4Ays"
}
