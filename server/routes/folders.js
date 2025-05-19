const router = require('express').Router();
const {
  getFoldersTree,
  getFolderInfo
} = require('../controllers/folders');

router.get('/get_folders_tree/:folder_id', getFoldersTree)
router.get('/get_folder_info/:folder_id', getFolderInfo)

module.exports = router;