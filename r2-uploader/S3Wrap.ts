import {
  S3Client,
  ListBucketsCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  S3ServiceException,
  DeleteObjectCommand,
  waitUntilObjectNotExists,
  DeleteObjectsCommand,
  CopyObjectCommand,
  waitUntilObjectExists,
  ObjectNotInActiveTierError,
  ListObjectsV2CommandOutput,
  ListObjectsV2Output,
} from "@aws-sdk/client-s3";

import * as fs from 'fs';

export class S3Wrap {


  constructor(
    private accountId: string,
    private accessKeyId: string,
    private secretAccessKey: string,
    private endpoint: string,
    private bucketName: string

  ) {

  }

  private client: S3Client = null as unknown as S3Client;

  public async CopyObject(sourceKey: string, destinationKey: string): Promise<boolean> {
    try {
      await this.client.send(
        new CopyObjectCommand({
          CopySource: `${this.bucketName}/${sourceKey}`,
          Bucket: this.bucketName,
          Key: destinationKey,
        })
      );
      await waitUntilObjectExists(
        { client: this.client, maxWaitTime: 2000 },
        { Bucket: this.bucketName, Key: destinationKey }
      );
      console.log(
        `Successfully copied ${this.bucketName}/${sourceKey} to ${this.bucketName}/${destinationKey}`
      );
      return true;
    } catch (caught) {
      if (caught instanceof ObjectNotInActiveTierError) {
        console.error(
          `Could not copy ${sourceKey} from ${this.bucketName}. Object is not in the active tier.`
        );
      } else {
        throw caught;
      }
    }
    return false;
  }

  public async DeleteFile(key: string): Promise<boolean> {
    const maxWaitTime: number = 2000;

    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        })
      );
      await waitUntilObjectNotExists(
        { client: this.client, maxWaitTime: maxWaitTime },
        { Bucket: this.bucketName, Key: key }
      );
      // A successful delete, or a delete for a non-existent object, both return
      // a 204 response code.
      console.log(
        `The object "${key}" from bucket "${this.bucketName}" was deleted, or it didn't exist.`
      );
      return true;
    } catch (caught) {
      if (
        caught instanceof S3ServiceException &&
        caught.name === "NoSuchBucket"
      ) {
        console.error(
          `Error from S3 while deleting object from ${this.bucketName}. The bucket doesn't exist.`
        );
      } else if (caught instanceof S3ServiceException) {
        console.error(
          `Error from S3 while deleting object from ${this.bucketName}.  ${caught.name}: ${caught.message}`
        );
      } else {
        throw caught;
      }
    }
    return false;
  }

  public async DeleteObjects(keys: string[]): Promise<boolean> {
    const maxWaitTime: number = 2000;

    try {
      const DeleteObjects = await this.client.send(
        new DeleteObjectsCommand({
          Bucket: this.bucketName,
          Delete: {
            Objects: keys.map((k) => ({ Key: k })),
          },
        })
      );
      for (const key in keys) {
        await waitUntilObjectNotExists(
          { client: this.client, maxWaitTime: maxWaitTime },
          { Bucket: this.bucketName, Key: key }
        );
      }
      console.log(
        `Successfully deleted ${DeleteObjects.Deleted ?? [].length
        } objects from S3 bucket. Deleted objects:`
      );
      console.log(
        (DeleteObjects.Deleted ?? []).map((d) => ` • ${d.Key}`).join("\n")
      );
      return true;
    } catch (caught) {
      if (
        caught instanceof S3ServiceException &&
        caught.name === "NoSuchBucket"
      ) {
        console.error(
          `Error from S3 while deleting objects from ${this.bucketName}. The bucket doesn't exist.`
        );
      } else if (caught instanceof S3ServiceException) {
        console.error(
          `Error from S3 while deleting objects from ${this.bucketName}.  ${caught.name}: ${caught.message}`
        );
      } else {
        throw caught;
      }
    }
    return false;
  }

  public async uploadFileFromFs(key: string, filePath: string): Promise<boolean> {
    return this.uploadFile(key, fs.readFileSync(filePath));
  }


  public async uploadFile(key: string, file: Buffer): Promise<boolean> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file,
    });

    try {
      const response = await this.client.send(command);
      console.log(response);
      return true;
    } catch (caught) {
      if (
        caught instanceof S3ServiceException &&
        caught.name === "EntityTooLarge"
      ) {
        console.error(
          `Error from S3 while uploading object to ${this.bucketName}. \
        The object was too large. To upload objects larger than 5GB, use the S3 console (160GB max) \
        or the multipart upload API (5TB max).`
        );
      } else if (caught instanceof S3ServiceException) {
        console.error(
          `Error from S3 while uploading object to ${this.bucketName}.  ${caught.name}: ${caught.message}`
        );
      } else {
        throw caught;
      }
    }
    return false;
  }

  public async GetObjectsList(): Promise<ListObjectsV2Output> {

    const command = new ListObjectsV2Command({ Bucket: this.bucketName });
    try {
      const response: ListObjectsV2Output = await this.client.send(command);
      console.log(response);
      return response
    } catch (caught) {
      console.error(caught)
      throw caught;
    }
  }



  public async init() {

    this.client = new S3Client({
      region: "auto",
      endpoint: this.endpoint, //`https://${configTokens.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED"
    });
  }

}