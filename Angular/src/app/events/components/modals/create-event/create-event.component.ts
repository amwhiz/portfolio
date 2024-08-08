import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';

import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { EventsService } from '../../../../_services/events.service';
import { SurveysService } from '../../../../_services/surveys.service';
import { Survey } from '../../../../_models/survey';

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html'
})
export class CreateEventComponent implements OnInit {
  createEventForm: FormGroup;
  loading: boolean;
  error: string;
  surveyId: number;
  surveyName: string;
  eventId: number = null;
  type: string;
  @ViewChild('createEvent') createEventModal: ModalComponent;
  @Output() createEvent: EventEmitter<any> = new EventEmitter();
  @Output() createdEvent: EventEmitter<any> = new EventEmitter();
  @Input() heading: string;
  @Input() successBtn: string;
  @Input() event: Event;
  @Input() surveys: [Survey];

  constructor(private route: ActivatedRoute, private router: Router, private fb: FormBuilder,
              private eventService: EventsService, private surveyService: SurveysService) {
    this.createEventForm = fb.group({
      'eventName': [null, Validators.required],
      'startDate': [null, Validators.required],
      'endDate': [null, Validators.required],
      'surveyId': [null, Validators.required]
    });

  }

  ngOnInit() {
    this.surveyName = 'Select Survey';
  }

  hide() {
    this.createEventForm.reset();
    this.createEventModal.hide();
    this.surveyName = 'Select Survey';
    this.eventId = null;
  }

  getDate(value: string) {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1) < 10 ? (0 + (date.getMonth() + 1).toString(10)) : (date.getMonth() + 1).toString(10);
    const day = (date.getDate()) < 10 ? (0 + (date.getDate()).toString(10)) : (date.getDate()).toString(10);
    return year + '-' + month + '-' + day;
  }

  show(type: string, value: any) {
    this.type = type;
    if (value != null) {
      this.createEventModal.show();
      this.eventId = value.id;
      this.createEventForm.setValue({
        eventName: value.name,
        startDate: this.getDate(value.start_date),
        endDate: this.getDate(value.end_date),
        surveyId: value.survey_id
      });
    } else {
      this.eventId = null;
      this.createEventModal.show();
    }
  }

  areDatesValid(): boolean {
    const endDate: number = new Date(this.createEventForm.value.endDate).valueOf();
    const startDate: number = new Date(this.createEventForm.value.startDate).valueOf();
    return (endDate - startDate) > 0;
  }

  onSuccess() {
    const {eventName, startDate, endDate, surveyId} = this.createEventForm.value;
    this.eventService.createEvent(eventName, startDate, endDate, surveyId).subscribe(data => {
        this.loading = true;
        window.setTimeout(() => {
          this.createdEvent.emit();
          this.loading = false;
          this.hide();
        }, 1000);
      },
      err => {
        this.error = _.get(err, 'error', 'This event already exists');
        alert(this.error);
      });
  }

  onUpdate() {
    const {eventName, startDate, endDate, surveyId} = this.createEventForm.value;
    this.eventService.updateEvent(eventName, startDate, endDate, surveyId, this.eventId).subscribe(data => {
        this.loading = true;
        window.setTimeout(() => {
          this.createdEvent.emit();
          this.loading = false;
          this.hide();
        }, 1000);
      },
      err => {
        this.error = _.get(err, 'error', 'This event already exists');
        alert(this.error);
      });
  }

  selectSurvey(survey: Survey) {
  }
}
