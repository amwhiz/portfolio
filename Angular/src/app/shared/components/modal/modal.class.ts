import { ElementRef } from '@angular/core';
import * as _ from 'lodash';

export class Modal {
  defaultFocus(htmlContainer: HTMLElement | ElementRef) {
    if (htmlContainer instanceof HTMLElement) {
      this.focusElem(_.first(htmlContainer.getElementsByTagName('input')));
    } else if (htmlContainer instanceof ElementRef) {
      this.focusElem(_.first((<HTMLElement>htmlContainer.nativeElement).getElementsByTagName('input')));
    }
  }

  focusElem(elem: HTMLInputElement | ElementRef) {
    if (elem instanceof HTMLInputElement) {
      this.focusHTMLElement(elem);
    } else if (elem instanceof ElementRef) {
      this.focusHTMLElement(elem.nativeElement);
    }
  }

  focusHTMLElement(elem: HTMLInputElement) {
    elem.focus();
  }
}
