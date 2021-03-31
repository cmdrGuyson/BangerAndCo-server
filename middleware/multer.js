const multer = require("multer");

//Set filename and destination to be stored
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

//Filter out filetypes other than image
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(
      {
        message: "Invalid file type",
      },
      false
    );
  }
};

const upload = (type) =>
  multer({
    storage: multerStorage(type),
    fileFilter: multerFilter,
    limits: {
      fileSize: 10 * 1024 * 1024 * 1024,
    },
  });

exports.uploadLicenseImageMW = upload("licenses").single("image");
exports.uploadAlternateIDImageMW = upload("alternates").single("image");
exports.uploadVehicleImageMW = upload("vehicles").single("image");
exports.uploadUserImageMW = upload("users").single("image");
