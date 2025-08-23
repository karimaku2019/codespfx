require('dotenv').config();
const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const db = require('./db');
const apiKeyMiddleware = require('./apiKeyMiddleware');

const app = express();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit
app.use(express.json());

// Middleware for API key
app.use(apiKeyMiddleware);

// File upload endpoint
app.post('/api/files/upload', upload.array('files'), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const stmt = db.prepare('INSERT INTO Files(filename, mimetype, size, data) VALUES (?,?,?,?)');
  req.files.forEach(file => {
    stmt.run(file.originalname, file.mimetype, file.size, file.buffer);
  });
  stmt.finalize();
  res.json({ message: 'Files uploaded successfully' });
});

// Attendance upload endpoint
app.post('/api/attendance/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);
    const stmt = db.prepare('INSERT OR REPLACE INTO Attendance(name, date, status) VALUES (?,?,?)');
    rows.forEach(row => {
      stmt.run(row.Name, row.Date, row.Status);
    });
    stmt.finalize();
    res.json({ message: 'Attendance uploaded' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Invalid Excel file' });
  }
});

// Get attendance records
app.get('/api/attendance', (req, res) => {
  db.all('SELECT * FROM Attendance', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Download file by ID
app.get('/api/files/:id', (req, res) => {
  db.get('SELECT * FROM Files WHERE id = ?', [req.params.id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'File not found' });
    res.setHeader('Content-Type', row.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${row.filename}"`);
    res.send(row.data);
  });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server running on port ${port}`));
