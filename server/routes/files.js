const router = require('express').Router();
const {
  getFilesList,
  uploadFile,
  deleteFile,
  downloadFile,
  openFile
} = require('../controllers/files');

router.get('/get_files_list/:folder_id', getFilesList);
router.post('/upload_file', uploadFile);
router.delete('/delete_file/:file_id', deleteFile);
router.get('/download_file/:file_id', downloadFile);
router.get('/open_file/:file_id', openFile);

module.exports = router;