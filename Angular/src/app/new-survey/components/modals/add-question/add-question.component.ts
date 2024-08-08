import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import * as _ from 'lodash';
import { LoDashStatic } from 'lodash';
import { questionTypes } from '../../../../shared/constants';

@Component({
  selector: 'app-add-question',
  templateUrl: './add-question.component.html'
})
export class AddQuestionComponent {
  _: LoDashStatic = _;
  @ViewChild('addQuestion') modal: ModalComponent;
  @Output() addQuestion: EventEmitter<any> = new EventEmitter();
  selectedQuestionType = '';
  questionNameLabel = '';
  questionTypes: any = _.cloneDeep(questionTypes);

  addQuestionToQuestions(val: string, ack?: string) {
    this.addQuestion.emit({
      type: this.selectedQuestionType,
      question: val,
      ack: ack || ''
    });
    this.selectedQuestionType = '';
  }

  closeModal(modal: ModalComponent, element?: HTMLInputElement) {
    if (element) {
      element.value = '';
    }
    this.selectedQuestionType = '';
    this.questionNameLabel = '';
    modal.hide();
  }

}
