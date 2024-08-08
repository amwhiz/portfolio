import { Component, ContentChild, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Modal } from './modal.class';
import * as _ from 'lodash';
@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html'
})
export class ModalComponent extends Modal {
  modalConfig = {
    keyboard: false,
    ignoreBackdropClick: true
  };
  @Input() successBtnDisabled = false;
  @Input() successBtn: string;
  @Input() heading: string;
  @Input() FormElem: any;
  @Output() onSuccess: EventEmitter<any> = new EventEmitter();
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @ViewChild('appModal') appModal: any;
  @ContentChild('questionName') questionName: any;

  constructor() {
    super();
  }

  show() {
    this.appModal.show();
  }

  hide() {
    this.appModal.hide();
  }

  cancel() {
    if (_.size(this.onClose.observers)) {
      this.onClose.emit();
    } else {
      this.hide();
    }
  }
}
