import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import * as _ from 'lodash';
import { LoDashStatic } from 'lodash';

@Component({
  selector: 'app-add-answer',
  templateUrl: './add-answer.component.html'
})
export class AddAnswerComponent {
  _: LoDashStatic = _;
  @Output() addAnswer: EventEmitter<any> = new EventEmitter();
  @ViewChild('newOption') modal: ModalDirective;

  addAnswerToQuestion(value: string) {
    this.addAnswer.emit(value);
  }

}
