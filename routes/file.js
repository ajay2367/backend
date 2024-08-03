const express = require('express');
const multer = require('multer');
const File = require('../models/file');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Configure multer for handling file uploads in memory
const storage = multer.memoryStorage();

// Increase file size limit to 50MB
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// Fetch Files
router.get('/', authMiddleware, async (req, res) => {
  try {
    const files = await File.find();
    res.json(files);
  } catch (error) {
    console.error('Error fetching files:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Add File (Admin Only)
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const { originalname: filename } = req.file;
  const fileData = req.file.buffer; // Access the file buffer

  try {
    const newFile = new File({ filename, fileData });
    await newFile.save();
    res.status(201).json({ message: 'File added' });
  } catch (error) {
    console.error('Error saving file:', error.message);
    res.status(400).json({ message: error.message });
  }
});

// Remove File (Admin Only)
router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const deletedFile = await File.findByIdAndDelete(req.params.id);

    if (!deletedFile) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.json({ message: 'File removed' });
  } catch (error) {
    console.error('Error removing file:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Error handling for multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size exceeds 50MB limit' });
    }
    return res.status(400).json({ message: `Multer error: ${err.message}` });
  }
  next(err);
});

module.exports = router;
