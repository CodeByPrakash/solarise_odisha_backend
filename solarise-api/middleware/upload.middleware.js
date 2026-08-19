import multer from "multer";

const allowedMimeTypes = new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
]);

export const documentUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: Number(process.env.MAX_DOCUMENT_SIZE_BYTES) || 10 * 1024 * 1024,
    },
    fileFilter: (_req, file, callback) => {
        if (!allowedMimeTypes.has(file.mimetype)) {
            return callback(new Error("Unsupported file type. Use PDF, JPG, PNG, WEBP, or MP4."));
        }
        callback(null, true);
    },
});
