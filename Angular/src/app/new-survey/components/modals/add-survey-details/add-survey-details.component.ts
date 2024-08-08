import { Component, EventEmitter, Input, OnChanges, OnInit, SimpleChanges, ViewChild, Output } from '@angular/core';
import * as _ from 'lodash';
import { LoDashStatic } from 'lodash';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { SurveysService } from '../../../../_services/surveys.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-survey-details',
  templateUrl: './add-survey-details.component.html'
})
export class AddSurveyDetailsComponent implements OnInit, OnChanges {
  _: LoDashStatic = _;
  @Input() name: string;
  @Input() clientName: string;
  @Input() surveyId: number;
  @Input() type: string;
  @Output() navigateToSurveys: EventEmitter<any> = new EventEmitter();
  surveyName: string;
  surveyClientName: string;
  loading = false;
  @Input() question: any;
  @ViewChild('surveyDetails') surveyDetailsModal: ModalComponent;
  constructor(private surveysService: SurveysService,
              private router: Router) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (_.get(changes, 'name.currentValue') || _.get(changes, 'clientName.currentValue')) {
      this.surveyName = _.get(changes, 'name.currentValue');
      this.surveyClientName = _.get(changes, 'clientName.currentValue');
    }
  }

  hide() {
    this.surveyDetailsModal.hide();
    this.reset();
  }

  show() {
    this.surveyDetailsModal.show();
  }

  onSave() {
    const data = {
      name: this.surveyName,
      clientName: this.surveyClientName,
      questions: this.question
    };
    this.loading = true;
    this.surveysService.createSurvey(this.surveyName, this.surveyClientName, this.question).subscribe(data => {
        this.loading = false;
        this.hide();
        this.navigateToSurveys.emit();
      },
      err => {
        this.loading = false;
        alert('Something went wrong');
      });
  }

  onUpdate() {
    const data = {
      name: this.surveyName,
      clientName: this.surveyClientName,
      questions: this.question
    };
    this.loading = true;
    this.surveysService.updateSurvey(this.surveyId, this.surveyName, this.surveyClientName, this.question).subscribe(data => {
        this.loading = false;
        this.hide();
        this.navigateToSurveys.emit();
      },
      err => {
        this.loading = false;
        alert('Something went wrong');
      });
  }

  reset() {
    this.surveyName = this.name;
    this.surveyClientName = this.clientName;
  }

}
