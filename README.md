
**Dibuat oleh:** Kevin Gultom   
**Untuk:** Technical Test - Full Stack Developer Internship

# Task Manager Application

Aplikasi Task Manager dengan AI Chatbot untuk Technical Test - Full Stack Developer Internship.

## Tech Stack

**Backend:**
- Golang (Gin Framework, GORM)
- PostgreSQL
- JWT Authentication
- Google Gemini 2.5 Flash API

**Frontend:**
- Next.js (React)
- Tailwind CSS

## Database (ERD)

**File ERD:** `ERD/ERD_Task_Manager.drawio.png`

**Tabel:**
- `users` (id, name, email, password)
- `tasks` (id, title, description, status, deadline, assignee_id)

**Relasi:** One-to-Many (1 user dapat memiliki banyak tasks)

## Cara Menjalankan Project

### 1. Setup Database
```bash
psql -U postgres
CREATE DATABASE task_manager_db;
\q
```

### 2. Jalankan Backend
```bash
cd backend-go

# Install dependencies
go mod tidy

# Buat file .env dan isi dengan Gemini API Key (lihat section AI Chatbot di bawah)
# GEMINI_API_KEY=your_api_key_here

# Jalankan server
go run main.go
```
Backend: http://localhost:8000

### 3. Jalankan Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend: http://localhost:3000

### 4. Login
```
Email: admin@test.com
Password: 123
```

---

## AI Chatbot (BONUS FEATURE)

### Cara Kerja Chatbot

AI Chatbot menggunakan **Google Gemini 2.5 Flash** untuk menjawab pertanyaan tentang data tasks dengan bahasa natural Indonesia.

**Alur Kerja:**
1. User mengetik pertanyaan di chat UI (floating button pojok kanan bawah halaman Tasks)
2. Frontend mengirim POST request ke `/chat` endpoint dengan JWT token
3. Backend mengambil semua data tasks dari PostgreSQL (dengan informasi assignee)
4. Data tasks diformat menjadi context string
5. Context + pertanyaan user dikirim ke Gemini 2.5 Flash API
6. AI memproses dan memberikan jawaban dalam Bahasa Indonesia
7. Response ditampilkan di chat bubble

**Contoh Pertanyaan:**
- "Tampilkan semua task yang statusnya belum selesai"
- "Berapa jumlah task yang sudah selesai?"
- "Tugas apa saja yang deadlinenya hari ini?"
- "Siapa assignee dari task Belajar Golang?"
- "Task apa yang paling urgent?"

### Library & Model yang Dipakai

- **Model AI**: Google Gemini 2.5 Flash
- **Library Backend**: 
  - `google/generative-ai-go` v0.20.1 (Official Go SDK)
  - `joho/godotenv` v1.5.1 (Load .env file)
- **Authentication**: JWT Bearer Token
- **Database**: PostgreSQL dengan GORM

### Cara Menjalankan Fitur Chatbot

#### 1. Dapatkan Gemini API Key (GRATIS)
- Kunjungi: https://aistudio.google.com/app/apikey
- Login dengan Google Account
- Klik "Create API Key"
- Copy API key yang dihasilkan

#### 2. Set API Key
Buat file `.env` di folder `backend-go`:

```bash
cd backend-go
# Buat file .env
```

Isi file `.env` dengan:
```
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Ganti** `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX` dengan API key Anda yang sebenarnya.

**PENTING:** File `.env` sudah masuk `.gitignore`, jadi API key Anda aman dan tidak akan ter-commit ke repository.

#### 3. Install Dependencies
```bash
cd backend-go
go mod tidy
```

#### 4. Restart Backend
```bash
cd backend-go
go run main.go
```

#### 5. Akses Chatbot
1. Buka http://localhost:3000
2. Login dengan `admin@test.com` / `123`
3. Masuk ke halaman Tasks
4. Klik icon 🤖 di pojok kanan bawah
5. Ketik pertanyaan dan klik Send

---

## API Documentation (Postman)

**File Postman Collection:** `postman/task-manager.postman_collection.json`

**Cara Import ke Postman:**
1. Buka aplikasi Postman
2. Klik **Import** (tombol di kiri atas)
3. Pilih **Upload Files**
4. Browse dan pilih file `task-manager.postman_collection.json`
5. Klik **Import**
6. Collection **"Task Manager API"** akan muncul di sidebar

**Cara Menggunakan:**
1. Jalankan request **Login** terlebih dahulu
2. JWT token akan otomatis tersimpan di variable `{{jwt_token}}`
3. Request lainnya akan otomatis menggunakan token tersebut
4. Untuk test chatbot, jalankan request **Chat with AI**

**Daftar Endpoints:**
- `POST /login` - Authentication (auto-save JWT token)
- `GET /users` - Get semua users untuk dropdown assignee
- `GET /tasks` - Get semua tasks
- `POST /tasks` - Create task baru (auto-save taskId)
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `POST /chat` - AI Chatbot (bonus feature)

**Collection Variables:**
- `jwt_token` - JWT token dari login (auto-saved)
- `taskId` - ID task terakhir yang dibuat (auto-saved)

---

## Struktur Project

```
TaskManagerApp/
├── backend-go/
│   ├── config/
│   │   ├── db.go           # Konfigurasi PostgreSQL
│   │   └── env.go          # Gemini API Key config
│   ├── handlers/
│   │   ├── auth.go         # Login handler
│   │   ├── chatbot.go      # AI Chatbot handler (BONUS)
│   │   ├── task.go         # CRUD tasks
│   │   └── user.go         # Get users
│   ├── middleware/
│   │   ├── auth.go         # JWT middleware
│   │   └── jwt.go          # Token generator
│   ├── models/
│   │   ├── task.go         # Task model (GORM)
│   │   └── user.go         # User model (GORM)
│   ├── go.mod              # Go dependencies
│   └── main.go             # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/
│   │   │   │   └── page.jsx    # Login page
│   │   │   └── tasks/
│   │   │       ├── page.jsx    # Tasks management
│   │   │       └── ChatBot.jsx # AI Chatbot UI 
│   │   └── lib/
│   │       └── api.js          # API utilities
│   ├── package.json            # NPM dependencies
│   └── next.config.mjs         # Next.js config
│
├── ERD/
│   └── ERD_Task_Manager.drawio.png  # Database ERD menggunakan Draw.io
│
├── postman/
│   └── task-manager.postman_collection.json  # API Collection
│
└── README.md                   # Dokumentasi project (file ini)
```
## Catatan Tambahan

**Database Auto-Migration:**
Backend menggunakan GORM AutoMigrate, sehingga tabel `users` dan `tasks` akan otomatis dibuat saat pertama kali menjalankan `go run main.go`.

**Seed Data:**
Backend sudah include seed data untuk 2 users (admin@test.com dan user@test.com). Data akan otomatis masuk saat pertama kali running.

**CORS:**
Backend sudah dikonfigurasi untuk accept request dari frontend (localhost:3000).

**Environment Variables:**
Untuk production, disarankan menggunakan environment variable untuk:
- Gemini API Key (GEMINI_API_KEY) - **WAJIB** untuk fitur chatbot
- Database credentials (DB_HOST, DB_USER, DB_PASSWORD, etc.)
- JWT Secret Key

**File .env:**
Project ini sudah dikonfigurasi untuk membaca file `.env` menggunakan library `godotenv`. File `.env` sudah masuk ke `.gitignore` untuk keamanan.
