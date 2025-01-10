import { Injectable } from '@angular/core';
import { CloudProvider } from '../_typings/rest/rest.typings';
import { environment } from '../../environments/environment.development';
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandOutput,
  ListObjectsCommand,
  ListObjectsCommandOutput,
} from '@aws-sdk/client-s3';

@Injectable({
  providedIn: 'root',
})
export class RestService {
  constructor() {}

  async uploadFile(provider: CloudProvider, file: File): Promise<void> {
    if (provider === 'aws-s3') {
      await this.uploadFileToAwsS3(file);
      return;
    }

    throw new Error(`Uploading file to ${provider} is not supported yet`);
  }

  async fetchFileListFromAwsS3(): Promise<ListObjectsCommandOutput> {
    const awsS3Client = new S3Client({
      region: 'eu-north-1',
      credentials: {
        accessKeyId: environment.aws_s3_bucket_access_key_id,
        secretAccessKey: environment.aws_s3_bucket_secret_access_key,
      },
    });

    const listObjectsCommand = new ListObjectsCommand({
      Bucket: environment.aws_s3_bucket_name,
      Prefix: environment.aws_s3_bucket_default_files_prefix + '-',
    });

    return await awsS3Client.send(listObjectsCommand);
  }

  private async uploadFileToAwsS3(file: File): Promise<PutObjectCommandOutput> {
    const awsS3Client = new S3Client({
      region: environment.aws_s3_bucket_region,
      credentials: {
        accessKeyId: environment.aws_s3_bucket_access_key_id,
        secretAccessKey: environment.aws_s3_bucket_secret_access_key,
      },
    });

    const putObjectCommand = new PutObjectCommand({
      Bucket: environment.aws_s3_bucket_name,
      Key: file.name,
      Body: file,
      ACL: 'public-read',
    });

    return await awsS3Client.send(putObjectCommand);
  }
}
