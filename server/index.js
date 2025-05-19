const express = require('express');
const router = express.Router();

const folders = require('./routes/folders');
const files = require('./routes/files');

router.use('/', folders);
router.use('/', files);

module.exports = router;