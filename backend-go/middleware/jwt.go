package middleware

import "github.com/golang-jwt/jwt/v5"

var Secret = []byte("supersecret-key") 

func GenerateToken(email string) (string, error) {
	claims := jwt.MapClaims{
		"sub": email,
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(Secret)
}
