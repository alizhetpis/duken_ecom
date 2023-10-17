import express from 'express';
import multer from 'multer';
import path from 'path';
import { isAuth, isAdmin } from '../utils.js';
import { fileURLToPath } from 'url';

const uploadRouter = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Setup multer storage configuration
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, '../../frontend/public/images/'));
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

uploadRouter.post('/', isAuth, isAdmin, upload.single('file'), (req, res) => {
  try {
    const { filename } = req.file;
    res.send({ path: `/images/${filename}` });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error', error: error.message });
  }
});

export default uploadRouter;
