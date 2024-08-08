import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';
import { Question, QuestionsPage } from '../../../_models/question';
import { FileHolder } from '../../../shared/image-upload/image-upload.component';
import { UUID } from 'angular2-uuid';
import { UploadImageService } from '../../../shared/upload-image.service';

declare const AWS: any;

@Component({
  selector: 'app-question-page',
  templateUrl: './question-page.component.html'
})
export class QuestionPageComponent implements OnInit {
  @Input() noQuestionsPage: boolean;
  @Input() pageNo: number;
  @Input() totalPages: number;
  @Input() coverImage: string;
  selectedQuestion: Question = <Question>{};
  @Output() selectQuestion: EventEmitter<Question> = new EventEmitter();
  @Output() deleteQuestionNo: EventEmitter<any> = new EventEmitter();
  @Output() addAnswer: EventEmitter<any> = new EventEmitter();
  @Output() removePage: EventEmitter<any> = new EventEmitter();
  @Output() updatePicture: EventEmitter<any> = new EventEmitter();
  @Output() updateCoverImage: EventEmitter<any> = new EventEmitter();

  constructor(private uploadImageService: UploadImageService) {
  }

  _questionsForPage: QuestionsPage;

  get questionsForPage(): QuestionsPage {
    return this._questionsForPage;
  }

  @Input()
  set questionsForPage(val: QuestionsPage) {
    this._questionsForPage = val;
    this.selectedQuestion = <Question>{};
  }

  ngOnInit() {
  }

  questionSelection(question: Question) {
    this.selectQuestion.emit(question);
  }

  uploadImage(image: FileHolder) {
    const pageNo = this.pageNo;
    this.uploadImageService.uploadImage(image, (err: any, data: any) => {
      if (pageNo !== 1) {
        this.updatePicture.emit(data.Location);
      } else {
        this.updateCoverImage.emit(data.Location);
      }
    });
  }

  deleteQuestion() {
    this.deleteQuestionNo.emit(this.selectedQuestion.no);
    // this.selectedQuestion = <Question>{};
  }
}
