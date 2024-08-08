import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-spinner',
  templateUrl: './page-spinner.component.html'
})
export class PageSpinnerComponent {
  @Input() visible = true;
}
