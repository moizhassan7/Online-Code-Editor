const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define schema for file subdocuments
const FileSchema = new Schema({
  name: { type: String, required: true },
  content: { type: String, default: '' }
});

// Project schema with a name and array of files
const ProjectSchema = new Schema({
  name: { type: String, required: true },
  files: [FileSchema]
});

// Create and export the Project model
module.exports = mongoose.model('Project', ProjectSchema);
