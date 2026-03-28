import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl as createPresignerUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../lib/s3";
import { randomUUID } from "node:crypto";

const BUCKET = process.env.AWS_S3_BUCKET!;

export class S3Service {
  async upload(
    file: Express.Multer.File,
    folder: string = "uploads",
  ): Promise<string> {
    // El proceso para poder subir archivo consta de lo siguiente:

    // obtenemos la extension
    const ext = file.originalname.split(".").pop();
    const key = `${folder}/${randomUUID()}.${ext}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return key;
  }

  async getSignerUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });

    const url = await createPresignerUrl(s3, command, { expiresIn });

    return url;
  }

  async destroy(key: string): Promise<void> {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
      }),
    );
  }
}
