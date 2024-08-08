import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';
import { LoDashStatic } from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';

import { QueryParams } from '../../../_helpers/entities/QueryParams';
import { Event } from '../../../_models/event';
import { CreateEventComponent } from '../../../events/components/modals/create-event/create-event.component';

@Component({
  selector: 'app-events-data-table',
  templateUrl: './events-data-table.component.html'
})
export class EventsDataTableComponent implements OnInit {
  bsModalRef: BsModalRef;
  _: LoDashStatic = _;
  @Input() events: any[];
  @Input() sortBy: string;
  @Input() pagination: any;
  @Input() limit: number;
  @Output() changeQueryParams: EventEmitter<any> = new EventEmitter();
  @Output() editEventAction: EventEmitter<any> = new EventEmitter();
  @Output() deleteEventAction: EventEmitter<any> = new EventEmitter();
  @Output() cloneEventAction: EventEmitter<any> = new EventEmitter();
  tableHeadings: any[] = [
    {
      'label': 'Event Name',
      'apiLabel': 'event_name',
    },
    {
      'label': 'Survey Name',
      'apiLabel': 'survey_name'
    },
    {
      'label': 'Event Dates',
      'apiLabel': 'event_date'
    },
    {
      'label': 'Last Synced',
      'apiLabel': 'last_synced'
    },
    {
      'label': 'Total Entries',
      'apiLabel': 'total_entries'
    }
  ];

  constructor(private route: ActivatedRoute, private router: Router, private modalService: BsModalService) {
  }

  ngOnInit() {
  }

  editEvent(event: Event) {
    this.editEventAction.emit(event);
  }

  cloneEvent(event: Event) {
    event.id = null;
    this.cloneEventAction.emit(event);
  }

  deleteEvent(event: Event) {
    if (confirm('Are You Sure You Want To Delete ' + event.name + ' Event') === true) {
      this.deleteEventAction.emit(event);
    }
  }

  applyFilter(sortOption: string) {
    let queryParams: QueryParams;
    if (!_.endsWith(this.sortBy, sortOption)) {
      queryParams = _.assign({}, <QueryParams>this.route.snapshot.queryParams, {
        Offset: 0,
        SortBy: sortOption
      });
    } else if (_.endsWith(this.sortBy, sortOption) && _.startsWith(this.sortBy, '-')) {
      queryParams = _.assign({}, <QueryParams>this.route.snapshot.queryParams, {
        Offset: 0,
        SortBy: sortOption
      });
    } else if (_.endsWith(this.sortBy, sortOption) && !_.startsWith(this.sortBy, '-')) {
      queryParams = _.assign({}, <QueryParams>this.route.snapshot.queryParams, {
        Offset: 0,
        SortBy: '-' + sortOption
      });
    }
    this.router.navigate(['events'], {queryParams});
  }

  onPagination(i: string, l: string) {
    const queryParams = _.assign({}, <QueryParams>this.route.snapshot.queryParams, {
      Offset: i,
      Limit: l || 50
    });
    this.router.navigate(['events'], {queryParams});
  }

  onChangeLimit(event) {
    this.onPagination('0', this.limit.toLocaleString());
  }
}
