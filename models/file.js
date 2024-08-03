// models/file.js
const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  fileData: { type: Buffer, required: true }, // Add this line to store file data
});

module.exports = mongoose.model('File', fileSchema);
