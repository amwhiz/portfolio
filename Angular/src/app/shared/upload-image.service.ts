import { Injectable } from '@angular/core';
import { UUID } from 'angular2-uuid';
import { FileHolder } from './image-upload/image-upload.component';
import * as _ from 'lodash';
declare const AWS: any;

@Injectable()
export class UploadImageService {
  private ACCESS_KEY_ID = 'AKIAIXLLWUXMJS2RPGNQ';
  private SECRET_ACCESS_KEY = '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';
  private BUCKET_NAME = 'newscope-dev';

  uploadImage(image: FileHolder, callback?: any) {
    const AWSService = AWS;
    const file = image.file;
    const splitDots: string[] = _.split(file.name, '.');
    AWSService.config.accessKeyId = this.ACCESS_KEY_ID;
    AWSService.config.secretAccessKey = this.SECRET_ACCESS_KEY;
    const bucket = new AWSService.S3({params: {Bucket: this.BUCKET_NAME}});
    const params = {Key: UUID.UUID() + '.' + _.last(splitDots), Body: file};

    bucket.upload(params, (err: any, data: any) => {
      if (callback) {
        callback(err, data);
      }
    });

  }

}
