const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  unit: { type: Number, required: true }, // 1, 2, or 3
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }, // Index of the correct option (0-3)
}, { timestamps: true });

module.exports = mongoose.model('Question', QuestionSchema);
