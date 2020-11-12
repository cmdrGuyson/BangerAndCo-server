const multer = require("multer");

const multerStorage = (type) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, `data/${type}`);
    },
    filename: (req, file, cb) => {
      const ext = file.mimetype.split("/")[1];
      cb(null, `${Math.floor(Math.random() * 10000)}-${Date.now()}.${ext}`);
    },
  });

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload an image.", 400), false);
  }
};

const upload = (type) =>
  multer({
    storage: multerStorage(type),
    fileFilter: multerFilter,
  });

exports.uploadLicenseImageMW = upload("DL").single("image");
