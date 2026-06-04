const Issue = require('../models/Issue')

exports.getIssues = async (req, res) => {
  try {
    const { category, status, sort } = req.query
    let filter = {}
    if (category) filter.category = category
    if (status)   filter.status   = status
    const sortBy = sort === 'upvotes' ? { 'upvotes': -1 } : { createdAt: -1 }
    const issues = await Issue.find(filter).sort(sortBy).populate('reportedBy', 'name')
    res.json(issues)
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
}

exports.getIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name')
      .populate('assignedTo', 'name')
    if (!issue) return res.status(404).json({ msg: 'Not found' })
    res.json(issue)
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
}

exports.createIssue = async (req, res) => {
  try {
    const photos = req.files ? req.files.map(f => f.path) : []
    const issue = await Issue.create({
      ...req.body,
      location: JSON.parse(req.body.location),
      photos,
      reportedBy: req.user.id
    })
    res.status(201).json(issue)
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
}

exports.updateStatus = async (req, res) => {
  try {
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    )
    res.json(issue)
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
}

exports.upvoteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
    const index = issue.upvotes.indexOf(req.user.id)
    if (index === -1) issue.upvotes.push(req.user.id)
    else issue.upvotes.splice(index, 1)
    await issue.save()
    res.json(issue)
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
}

exports.deleteIssue = async (req, res) => {
  try {
    await Issue.findByIdAndDelete(req.params.id)
    res.json({ msg: 'Deleted' })
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
}