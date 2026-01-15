package models

import "time"

type Task struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Status      string    `json:"status"`
	Deadline    time.Time `json:"deadline"`
	AssigneeID  *uint     `json:"assignee_id"`
	Assignee    *User     `gorm:"foreignKey:AssigneeID" json:"assignee"`
}
