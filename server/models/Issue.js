const mongoose = require('mongoose')

const IssueSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['roads', 'electricity', 'water', 'sanitation', 'parks', 'other'],
    required: true
  },
  sector:   { type: String, required: true },
  location: {
    address: String,
    lat: Number,
    lng: Number
  },
  photos: [{ type: String }],
  status: {
  type: String,
  enum: ['open', 'in-progress', 'resolved', 'closed'],
  default: 'open'
},
  upvotes:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

module.exports = mongoose.model('Issue', IssueSchema)