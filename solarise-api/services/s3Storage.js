import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import crypto from "node:crypto";
import path from "node:path";

const getConfig = () => {
    const { AWS_REGION, AWS_S3_BUCKET } = process.env;
    if (!AWS_REGION || !AWS_S3_BUCKET) {
        throw new Error("AWS_REGION and AWS_S3_BUCKET must be configured for file uploads");
    }
    return { region: AWS_REGION, bucket: AWS_S3_BUCKET };
};

const client = new S3Client({ region: process.env.AWS_REGION });

const safeFileName = (fileName) => {
    const extension = path.extname(fileName || "").toLowerCase();
    const baseName = path.basename(fileName || "document", extension)
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80) || "document";
    return `${baseName}${extension}`;
};

export const uploadFileToS3 = async ({ file, consumerId, documentType }) => {
    const { region, bucket } = getConfig();
    const key = `documents/${consumerId}/${documentType}/${crypto.randomUUID()}-${safeFileName(file.originalname)}`;

    await client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ContentLength: file.size,
    }));

    const publicBaseUrl = process.env.AWS_S3_PUBLIC_BASE_URL?.replace(/\/$/, "");
    const url = publicBaseUrl
        ? `${publicBaseUrl}/${key}`
        : `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    return { key, url };
};

export const deleteFileFromS3 = async (key) => {
    if (!key) return;
    const { bucket } = getConfig();
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
};
