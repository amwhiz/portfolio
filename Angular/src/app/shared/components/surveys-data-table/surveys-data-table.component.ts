import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';
import { LoDashStatic } from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';

import { QueryParams } from '../../../_helpers/entities/QueryParams';
import { Survey } from '../../../_models/survey';

@Component({
  selector: 'app-surveys-data-table',
  templateUrl: './surveys-data-table.component.html'
})
export class SurveysDataTableComponent implements OnInit {

  _: LoDashStatic = _;
  @Input() surveys: any[];
  @Input() sortBy: string;
  @Input() pagination: any;
  @Input() limit: number;
  @Output() changeQueryParams: EventEmitter<any> = new EventEmitter();
  @Output() deleteSurveyAction: EventEmitter<any> = new EventEmitter();
  survey: Survey[];
  tableHeadings: any[] = [
    {
      'label': 'Survey Name',
      'apiLabel': 'survey_name',
    },
    {
      'label': 'Client',
      'apiLabel': 'client',
    },
    {
      'label': 'Events',
      'apiLabel': 'events'
    },
    {
      'label': 'Entries Collected',
      'apiLabel': 'total_entries'
    }
  ];

  constructor(private route: ActivatedRoute, private router: Router) {
  }

  ngOnInit() {
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
    this.router.navigate(['surveys'], {queryParams});
  }

  onPagination(i: string, l: string) {
    const queryParams = _.assign({}, this.route.snapshot.queryParams, {
      Offset: i,
      Limit: l || 50
    });
    this.router.navigate(['surveys'], {queryParams});
  }

  onChangeLimit(event) {
    this.onPagination('0', this.limit.toLocaleString());
  }

  deleteSurvey(survey: Survey) {
    if (confirm('Are You Sure You Want To Delete ' + survey.name + ' Survey') === true) {
      this.deleteSurveyAction.emit(survey);
    }
  }

  onClone(id: number) {
    const queryParams = {
      cloneId: id
    };
    this.router.navigate(['survey'], {queryParams});
  }
}
