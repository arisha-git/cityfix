const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({
  body:  { type: String, required: true },
  issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', required: true },
  author:{ type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true }
}, { timestamps: true })

module.exports = mongoose.model('Comment', CommentSchema)