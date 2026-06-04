const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const upload = require('../middleware/upload')
const {
  getIssues, getIssue, createIssue,
  updateStatus, upvoteIssue, deleteIssue
} = require('../controllers/issueController')

router.get('/',          getIssues)
router.get('/:id',       getIssue)
router.post('/', auth, upload.array('photos', 5), createIssue)
router.patch('/:id',     auth, updateStatus)
router.post('/:id/upvote', auth, upvoteIssue)
router.delete('/:id',    auth, deleteIssue)

module.exports = router