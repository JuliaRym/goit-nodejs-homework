const multer = require("multer");
const path = require("path");

const tmpDir = path.join(__dirname, "../tmp");

const multerConfig = multer.diskStorage({
  destination: tmpDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${req.user._id}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

module.exports = multer({ storage: multerConfig });
