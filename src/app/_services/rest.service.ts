import { inject, Injectable } from '@angular/core';
import { CloudProvider } from '../_typings/rest/rest.typings';
import { environment } from '../../environments/environment.development';
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandOutput,
  ListObjectsCommand,
  ListObjectsCommandOutput,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { FileInteractionService } from './file-interaction.service';
import { WorksheetRowData } from '../_typings/worksheet.typings';

@Injectable({
  providedIn: 'root',
})
export class RestService {
  private readonly awsS3Client: S3Client = new S3Client({
    region: environment.aws_s3_bucket_region,
    credentials: {
      accessKeyId: environment.aws_s3_bucket_access_key_id,
      secretAccessKey: environment.aws_s3_bucket_secret_access_key,
    },
  });

  private readonly fileInteractionService = inject(FileInteractionService);

  constructor() {}

  async uploadFile(provider: CloudProvider, file: File): Promise<void> {
    if (provider === 'aws-s3') {
      await this.uploadFileToAwsS3(file);
      return;
    }

    throw new Error(`Uploading file to ${provider} is not supported yet`);
  }

  async fetchFileListFromAwsS3(): Promise<ListObjectsCommandOutput> {
    const listObjectsCommand = new ListObjectsCommand({
      Bucket: environment.aws_s3_bucket_name,
      Prefix: environment.aws_s3_bucket_default_files_prefix + '-',
    });

    return await this.awsS3Client.send(listObjectsCommand);
  }

  async fetchDefaultFileContentFromAwsS3(
    fileNameSuffix: string
  ): Promise<Map<string, WorksheetRowData>> {
    const fullFileName =
      environment.aws_s3_bucket_default_files_prefix + '-' + fileNameSuffix;
    const getObjectCommand = new GetObjectCommand({
      Key: fullFileName,
      Bucket: environment.aws_s3_bucket_name,
    });

    const getObjectCommandResult = await this.awsS3Client.send(
      getObjectCommand
    );

    const stringifiedStream =
      await getObjectCommandResult.Body?.transformToString();
    if (!stringifiedStream) {
      throw new Error('Cannot read external file');
    }

    return this.fileInteractionService.convertCsvStringToMap(stringifiedStream);
  }

  private async uploadFileToAwsS3(file: File): Promise<PutObjectCommandOutput> {
    const putObjectCommand = new PutObjectCommand({
      Bucket: environment.aws_s3_bucket_name,
      Key: file.name,
      Body: file,
      ACL: 'public-read',
    });

    return await this.awsS3Client.send(putObjectCommand);
  }
}
