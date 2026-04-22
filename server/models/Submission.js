const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  regNo: { type: String, required: true, unique: true },
  section: { type: Number, required: true },
  unit1Marks: { type: Number, default: 0 },
  unit2Marks: { type: Number, default: 0 },
  unit3Marks: { type: Number, default: 0 },
  unit4Marks: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 },
  submissionType: { type: String, enum: ['Manual', 'Auto'], default: 'Manual' },
  responses: { type: Map, of: Number }, // Map of questionId to selectedOptionIndex
}, { timestamps: true });

module.exports = mongoose.model('Submission', SubmissionSchema);
