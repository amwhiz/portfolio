import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import {
  FileHolder,
  MultipleImageUploadComponent
} from '../../../../shared/multiple-image-upload/multiple-image-upload.component';
import { UploadImageService } from '../../../../shared/upload-image.service';
import { Question } from '../../../../_models/question';
import * as _ from 'lodash';

@Component({
  selector: 'display-images',
  templateUrl: './display-images.component.html'
})
export class DisplayImagesComponent {
  @ViewChild('displayImages') modal: ModalDirective;
  newQuestion: Question;
  oldQuestion: Question;
  @Input() set question(val: Question) {
    this.oldQuestion = _.cloneDeep(val);
    this.newQuestion = _.cloneDeep(val);
  }
  @Output() reCreateQuestion: EventEmitter<any> = new EventEmitter();
  @ViewChild('MultipleImage') multipleImage: MultipleImageUploadComponent;
  constructor(private uploadImageService: UploadImageService) {

  }

  show() {
    this.modal.show();
  }

  hide() {
    this.modal.hide();
  }

  uploadImages(file: FileHolder) {
    this.uploadImageService.uploadImage(file, (err: any, data: any) => {
      this.newQuestion.noOfImages = this.newQuestion.noOfImages === 0 ? 1 : this.newQuestion.noOfImages;
      this.newQuestion.options.push({
        src: data.Location,
        name: file.name
      });
    });
  }

  isFormInvalid() {
    return _.isEqual(this.newQuestion, this.oldQuestion) || !_.size(this.newQuestion.options) || _.size(_.filter(this.newQuestion.options, (value: any) => !_.trim(value.name)));
  }

  removeImage(file: FileHolder) {
    _.remove(this.newQuestion.options, (val) =>  val.src === file.src);
    this.reCreateQuestion.emit(this.newQuestion);
  }

  onCancel() {
    _.set(this.multipleImage, 'inputElement.nativeElement.value', '');
    this.hide();
    this.question = _.cloneDeep(this.oldQuestion);
  }

  done() {
    this.reCreateQuestion.emit(this.newQuestion);
    this.question = _.cloneDeep(this.newQuestion);
    this.hide();
  }
}
