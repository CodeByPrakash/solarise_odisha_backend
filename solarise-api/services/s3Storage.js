import { DeleteObjectCommand, GetObjectCommand, HeadBucketCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "node:crypto";
import path from "node:path";

let s3ClientInstance = null;

export const getS3Client = () => {
    if (!s3ClientInstance) {
        const region = process.env.AWS_REGION || "ap-south-2";
        const credentials = (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID.trim(),
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY.trim(),
        } : undefined;

        s3ClientInstance = new S3Client({
            region,
            credentials,
        });
    }
    return s3ClientInstance;
};

export const getConfig = () => {
    const region = process.env.AWS_REGION || "ap-south-2";
    const bucket = process.env.AWS_S3_BUCKET || process.env.AWS_BUCKET_NAME || "solarise-odisha-storage";

    if (!region || !bucket) {
        throw new Error("AWS_REGION and AWS_S3_BUCKET must be configured for file uploads");
    }

    return { region, bucket };
};

export const extractS3Key = (keyOrUrl) => {
    if (!keyOrUrl) return null;
    if (!keyOrUrl.startsWith("http://") && !keyOrUrl.startsWith("https://")) {
        return keyOrUrl.replace(/^\/+/, "");
    }
    try {
        const parsed = new URL(keyOrUrl);
        // Pathname starts with '/' e.g. /documents/1/electric_bill/uuid-file.jpg
        return decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
    } catch {
        return keyOrUrl;
    }
};

export const safeFileName = (fileName) => {
    const extension = path.extname(fileName || "").toLowerCase();
    const baseName = path.basename(fileName || "document", extension)
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80) || "document";
    return `${baseName}${extension}`;
};

export const uploadFileToS3 = async ({ file, consumerId, documentType }) => {
    if (!file || !file.buffer) {
        throw new Error("Invalid file buffer for S3 upload");
    }

    const { region, bucket } = getConfig();
    const client = getS3Client();
    const sanitizedConsumerId = String(consumerId || "common").replace(/[^a-zA-Z0-9_-]/g, "");
    const sanitizedDocType = String(documentType || "general").replace(/[^a-zA-Z0-9_-]/g, "");
    const sanitizedFileName = safeFileName(file.originalname);
    const key = `documents/${sanitizedConsumerId}/${sanitizedDocType}/${crypto.randomUUID()}-${sanitizedFileName}`;

    await client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype || "application/octet-stream",
        ContentLength: file.buffer ? file.buffer.length : (file.size || undefined),
        Metadata: {
            consumer_id: String(consumerId || ""),
            doc_type: String(documentType || ""),
            original_name: encodeURIComponent(file.originalname || "document"),
        },
    }));

    const publicBaseUrl = process.env.AWS_S3_PUBLIC_BASE_URL?.replace(/\/$/, "");
    const url = publicBaseUrl
        ? `${publicBaseUrl}/${key}`
        : `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    return {
        key,
        url,
        bucket,
        region,
    };
};

export const deleteFileFromS3 = async (keyOrUrl) => {
    const key = extractS3Key(keyOrUrl);
    if (!key) return;

    const { bucket } = getConfig();
    const client = getS3Client();

    await client.send(new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
    }));
};

export const getPresignedDownloadUrl = async (keyOrUrl, expiresInSeconds = 3600) => {
    const key = extractS3Key(keyOrUrl);
    if (!key) return null;

    const { bucket } = getConfig();
    const client = getS3Client();

    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
    });

    return await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
};

export const checkS3Health = async () => {
    const { bucket, region } = getConfig();
    const client = getS3Client();

    await client.send(new HeadBucketCommand({ Bucket: bucket }));
    return { status: "connected", bucket, region };
};
