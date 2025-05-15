const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// GET /api/projects - list all projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({}, 'name'); // get name and _id
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// POST /api/projects - create a new project
// Expects JSON { name: "Project Name" }
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const project = new Project({ name, files: [] });
    const saved = await project.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// GET /api/projects/:id - get a project by ID (with files)
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// DELETE /api/projects/:id - delete a project
router.delete('/:id', async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// POST /api/projects/:id/files - add a new file
// Expects JSON { name: "filename.ext" }
router.post('/:id/files', async (req, res) => {
  try {
    const { name } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    project.files.push({ name, content: '' });
    await project.save();
    const newFile = project.files[project.files.length - 1];
    res.status(201).json(newFile);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add file' });
  }
});

// DELETE /api/projects/:id/files/:fileId - delete a file
router.delete('/:id/files/:fileId', async (req, res) => {
  try {
    await Project.findByIdAndUpdate(req.params.id, {
      $pull: { files: { _id: req.params.fileId } }
    });
    res.json({ message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// PUT /api/projects/:id/files/:fileId - update file content
// Expects JSON { content: "new content..." }
router.put('/:id/files/:fileId', async (req, res) => {
  try {
    const { content } = req.body;
    await Project.findOneAndUpdate(
      { _id: req.params.id, 'files._id': req.params.fileId },
      { $set: { 'files.$.content': content } }
    );
    res.json({ message: 'File updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update file' });
  }
});

module.exports = router;
