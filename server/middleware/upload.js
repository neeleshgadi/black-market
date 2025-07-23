import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadsDir = "uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, `alien-${uniqueSuffix}${extension}`);
  },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith("image/")) {
    // Check for allowed image types
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, GIF, and WebP images are allowed"), false);
    }
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1, // Only one file at a time
  },
});

// Middleware for single image upload
export const uploadAlienImage = upload.single("image");

// Error handling middleware for multer
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: {
          message: "File size too large. Maximum size is 5MB",
          code: "FILE_TOO_LARGE",
        },
      });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        error: {
          message: "Too many files. Only one file allowed",
          code: "TOO_MANY_FILES",
        },
      });
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        error: {
          message: "Unexpected field name. Use 'image' as field name",
          code: "UNEXPECTED_FIELD",
        },
      });
    }
  }

  if (error.message.includes("Only")) {
    return res.status(400).json({
      success: false,
      error: {
        message: error.message,
        code: "INVALID_FILE_TYPE",
      },
    });
  }

  // Pass other errors to global error handler
  next(error);
};

// Middleware to make image upload optional
export const optionalUploadAlienImage = (req, res, next) => {
  uploadAlienImage(req, res, (error) => {
    if (error) {
      return handleUploadError(error, req, res, next);
    }
    next();
  });
};
