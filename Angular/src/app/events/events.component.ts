import { Component, OnInit, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';

import { EventsService } from '../_services/events.service';
import { Event } from '../_models/event';
import { BaseComponent } from '../_helpers/base.component';
import { QueryParams } from '../_helpers/entities/QueryParams';
import { CreateEventComponent } from './components/modals/create-event/create-event.component';
import { SurveysService } from '../_services/surveys.service';
import { Survey } from '../_models/survey';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html'
})
export class EventsComponent extends BaseComponent implements OnInit {
  bsModalRef: BsModalRef;
  data: {
    events: Event[],
    pagination: {
      totalResults: number,
      index: number,
      includedResults: number
    }
  };
  dataSurvey: {
    surveys: Survey[];
    pagination: {
      totalResults: number,
      index: number,
      includedResults: number
    }
  };
  events: Event[];
  surveys: Survey[];
  newQuery: QueryParams;
  validSortOption: any = [
    'event_name',
    '-event_name',
    'survey_name',
    '-survey_name',
    'event_date',
    '-event_date',
    'last_synced',
    '-last_synced',
    'total_entries',
    '-total_entries'
  ];
  @ViewChild('createEvent') createEvent: CreateEventComponent;

  constructor(private eventsService: EventsService,
              private route: ActivatedRoute,
              private router: Router,
              private surveyService: SurveysService,
              private eventService: EventsService,
              private modalService: BsModalService) {
    super();
  }

  ngOnInit() {
    this.resetQuery(true);
    this.surveyService.getAll('0', '1000000', 'surveyName').subscribe(val => {
      this.dataSurvey = val;
    });
  }

  onRouteChange(queryParams: QueryParams) {
    if (!this.queryParamsCorrection(queryParams)) {
      this.router.navigate(['events'], {
        queryParams: {
          Offset: _.get(queryParams, 'Offset', 0),
          Limit: _.get(queryParams, 'Limit', 10),
          SortBy: _.get(queryParams, 'SortBy', 'eventName'),
        }
      });
    } else {
      this.getEvents(queryParams);
    }
  }

  getEvents(queryParams: QueryParams) {
    this.eventsService.getAll(queryParams.Offset, queryParams.Limit, queryParams.SortBy)
      .subscribe(result => {
        this.data = result;
        this.createEvent.hide();
      });
  }

  resetQuery(init: boolean = false) {
    this.subscribe(this.route.queryParams, (routeQueryParams: QueryParams) => {
      const queryParams = _.cloneDeep(routeQueryParams);
      this.newQuery = queryParams;
      if (init) {
        this.onRouteChange(this.newQuery);
      }
    });
  }

  queryParamsCorrection(queryParams: QueryParams): boolean {
    let isQueryParamsValid = true;

    // Validate SortBy
    if (!_.includes(this.validSortOption, queryParams.SortBy)) {
      queryParams.SortBy = 'event_name';
      isQueryParamsValid = false;
    }

    // Validate Offset
    if (_.isNaN(parseInt(queryParams.Offset, 10)) || parseInt(queryParams.Offset, 10) < 0) {
      queryParams.Offset = '0';
      isQueryParamsValid = false;
    }

    // Validate Limit
    if (_.isNaN(parseInt(queryParams.Limit, 10)) || parseInt(queryParams.Limit, 10) < 1) {
      queryParams.Limit = '10';
      isQueryParamsValid = false;
    }

    return isQueryParamsValid;
  }

  applyNewPageTitleForCurrentPage(value: string) {
  }

  editEventAction(event: Event, modal: CreateEventComponent) {
    modal.show('update', event);
  }

  cloneEventAction(event: Event, modal: CreateEventComponent) {
    modal.show('create', event);
  }

  deleteEventAction(event: Event) {
    this.eventService.deleteEvent(event.id).subscribe(data => {
        _.remove(this.data.events, {id: event.id});
      },
      err => {
        alert('Something went wrong');
      });
  }
}
