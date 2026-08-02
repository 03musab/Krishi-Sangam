/* ═══════════════════════════════════════════
   KrishiSetu — server/routes/upload.js
   (Image upload route — Supabase Storage)
   ═══════════════════════════════════════════ */

const express = require('express');
const multer = require('multer');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/* ── Supabase Storage client ──────────────── */
const BUCKET = 'krishi-sangam';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

async function ensureBucket() {
  if (!supabase) return;
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error('⚠️  Could not list buckets:', error.message);
    return;
  }
  if (!buckets.some((b) => b.name === BUCKET)) {
    const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024
    });
    if (createErr) {
      console.error('⚠️  Could not create bucket:', createErr.message);
    } else {
      console.log(`📦 Created Supabase Storage bucket: ${BUCKET}`);
    }
  }
}

/* ── Multer (in-memory — buffer passed to Supabase) ── */
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed.'), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/* ── POST /api/upload ──────────────────────── */
router.post('/', authenticateToken, (req, res) => {
  upload.single('image')(req, res, async (err) => {
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

    if (!supabase) {
      return res.status(500).json({ error: 'Storage not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' });
    }

    try {
      await ensureBucket();

      const ext = path.extname(req.file.originalname) || '.png';
      const filename = `upload-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(filename, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false
        });

      if (uploadErr) {
        console.error('Supabase upload error:', uploadErr.message);
        return res.status(500).json({ error: 'Upload to storage failed. ' + uploadErr.message });
      }

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filename);
      const imageUrl = urlData.publicUrl;

      res.json({
        message: 'Image uploaded successfully!',
        url: imageUrl,
        filename
      });
    } catch (e) {
      console.error('Upload error:', e);
      res.status(500).json({ error: 'Server error uploading image.' });
    }
  });
});

/* ── DELETE /api/upload/:filename ───────────── */
router.delete('/:filename', authenticateToken, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Storage not configured.' });
    }
    const filename = req.params.filename;

    const { error } = await supabase.storage.from(BUCKET).remove([filename]);

    if (error) {
      console.error('Supabase delete error:', error.message);
      return res.status(500).json({ error: 'Server error deleting image.' });
    }
    res.json({ message: 'Image deleted successfully.' });
  } catch (err) {
    console.error('Delete image error:', err);
    res.status(500).json({ error: 'Server error deleting image.' });
  }
});

module.exports = router;
