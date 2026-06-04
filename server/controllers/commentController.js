const Comment = require('../models/Comment')

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ issue: req.params.id })
      .populate('author', 'name')
      .sort({ createdAt: 1 })
    res.json(comments)
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
}

exports.addComment = async (req, res) => {
  try {
    const comment = await Comment.create({
      body: req.body.body,
      issue: req.params.id,
      author: req.user.id
    })
    res.status(201).json(comment)
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
}