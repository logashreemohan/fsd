import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const checkFileType = (file, cb) => {
  const allowedExts = /\.(jpe?g|png|webp|gif|bmp|mp4|mov|avi|webm|mkv|m4v)$/i;
  const ext = path.extname(file.originalname).toLowerCase();
  const isExtValid = allowedExts.test(ext);
  const isMimeValid =
    !file.mimetype ||
    file.mimetype === 'application/octet-stream' ||
    file.mimetype.startsWith('image/') ||
    file.mimetype.startsWith('video/');

  if (isExtValid || isMimeValid) {
    return cb(null, true);
  } else {
    cb(new Error('Images and Videos only (.mp4, .mov, .avi, .webm, .jpg, .png, .webp)!'));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});
