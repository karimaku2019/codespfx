# Service-Based Web Application

This project includes a simple React frontend and Node.js/Express backend using a SQLite database.

## Frontend
- React SPA using CDN and TailwindCSS
- Drag-and-drop multi-file upload
- Excel preview before upload
- Sends files and attendance data to backend with API key

## Backend
- Express server with SQLite
- API key authentication via `x-api-key` header
- Endpoints:
  - `POST /api/files/upload`
  - `POST /api/attendance/upload`
  - `GET /api/attendance`
  - `GET /api/files/:id`

To run locally, install dependencies and create a `.env` from `.env.example`.
