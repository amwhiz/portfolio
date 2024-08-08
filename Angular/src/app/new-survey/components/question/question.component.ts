import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';
import { Question } from '../../../_models/question';
import { UploadImageService } from '../../../shared/upload-image.service';
import { FileHolder } from '../../../shared/image-upload/image-upload.component';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html'
})
export class QuestionComponent implements OnInit {
  _ = _;
  @Input() question: Question;
  @Input() selectedQuestion: Question;
  @Output() selectQuestion: EventEmitter<Question> = new EventEmitter();
  @Output() updateQuestion: EventEmitter<Question> = new EventEmitter();

  constructor(private uploadImageService: UploadImageService) {
  }

  ngOnInit() {
  }

  questionSelection() {
    this.selectQuestion.emit(this.question);
  }

  onUpload(file: FileHolder) {
    const question: Question = _.cloneDeep(this.question);
    this.uploadImageService.uploadImage(file, (err: any, data: any) => {
      question.options = [data.Location];
      this.updateQuestion.emit(question);
    });
  }

}
