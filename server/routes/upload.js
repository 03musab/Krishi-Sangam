/* ═══════════════════════════════════════════
   KrishiSetu — server/routes/upload.js
   (Image upload route with multer)
   ═══════════════════════════════════════════ */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/* ── Configure Multer Storage ──────────────── */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `upload-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/* ── POST /api/upload ──────────────────────── */
router.post('/', authenticateToken, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ error: err.message });
      }
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({
      message: 'Image uploaded successfully!',
      url: imageUrl,
      filename: req.file.filename
    });
  });
});

/* ── DELETE /api/upload/:filename ───────────── */
router.delete('/:filename', authenticateToken, (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', 'uploads', filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'Image deleted successfully.' });
    } else {
      res.status(404).json({ error: 'Image not found.' });
    }
  } catch (err) {
    console.error('Delete image error:', err);
    res.status(500).json({ error: 'Server error deleting image.' });
  }
});

module.exports = router;
