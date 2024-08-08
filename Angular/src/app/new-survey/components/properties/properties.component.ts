import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';

import { Question } from '../../../_models/question';

@Component({
  selector: 'app-properties',
  templateUrl: './properties.component.html'
})
export class PropertiesComponent implements OnInit {
  _ = _;
  @Input() question: Question;
  @Output() deleteQuestionNo: EventEmitter<any> = new EventEmitter();
  @Output() addAnswer: EventEmitter<any> = new EventEmitter();

  constructor() {
  }

  ngOnInit() {
  }

  addAnswerToQuestion(answer: string) {
    const question: Question = _.cloneDeep(this.question);
    question.options.push(answer);
    this.addAnswer.emit(question);
  }

  deleteQuestion() {
    this.deleteQuestionNo.emit();
  }

  validateQuestion() {
    if (_.isEqual(this.question.type, 'TEXT')) {
      this.question.phoneValidation = /phone/.test(_.lowerCase(this.question.name));
      this.question.emailValidation = /email/.test(_.lowerCase(this.question.name));
    }
  }

  removeAnswer(key: number) {
    this.question.options.splice(key, 1);
  }

}
