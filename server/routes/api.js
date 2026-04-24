const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Question = require('../models/Question');
const Submission = require('../models/Submission');

// --- Student Routes ---

// Get 10 random questions for a specific unit (Students)
router.get('/questions/:unit', async (req, res) => {
  try {
    const unit = parseInt(req.params.unit);
    const questions = await Question.aggregate([
      { $match: { unit: unit } },
      { $sample: { size: 10 } }
    ]);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get ALL questions for a specific unit (Admin)
router.get('/admin-questions/:unit', async (req, res) => {
  try {
    const questions = await Question.find({ unit: parseInt(req.params.unit) });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Check if registration number already exists
router.get('/check-registration/:regNo', async (req, res) => {
  try {
    const regNum = parseInt(req.params.regNo);
    if (isNaN(regNum) || regNum < 2501050001 || regNum > 2501050250) {
      return res.status(400).json({ message: 'Registration number outside of valid range.' });
    }
    const existing = await Submission.findOne({ regNo: req.params.regNo });
    res.json({ exists: !!existing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit final quiz results
router.post('/submit', async (req, res) => {
  const { studentName, regNo, section, unit1Marks, unit2Marks, unit3Marks, unit4Marks, responses, submissionType } = req.body;
  const totalMarks = unit1Marks + unit2Marks + unit3Marks + unit4Marks;
  const sType = submissionType || 'Manual';

  try {
    const newSubmission = new Submission({
      studentName,
      regNo,
      section,
      unit1Marks,
      unit2Marks,
      unit3Marks,
      unit4Marks,
      totalMarks,
      submissionType: sType,
      responses
    });
    await newSubmission.save();
    res.status(201).json(newSubmission);
  } catch (err) {
    console.error('Submission Error:', err);
    res.status(400).json({ message: err.message });
  }
});

// --- Admin Routes ---

// Add a question
router.post('/questions', async (req, res) => {
  const question = new Question({
    unit: req.body.unit,
    questionText: req.body.questionText,
    options: req.body.options,
    correctAnswer: req.body.correctAnswer
  });

  try {
    const newQuestion = await question.save();
    res.status(201).json(newQuestion);
  } catch (err) {
    console.error('Add Question Error:', err);
    res.status(400).json({ message: err.message });
  }
});

// Delete a question
router.delete('/questions/:id', async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all participants
router.get('/participants', async (req, res) => {
  try {
    const participants = await Submission.find();
    res.json(participants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a participant submission
router.delete('/participants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Participant ID format' });
    }
    
    const result = await Submission.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Participant record not found' });
    }

    res.json({ message: 'Submission deleted successfully' });
  } catch (err) {
    console.error('Delete Participant Error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
