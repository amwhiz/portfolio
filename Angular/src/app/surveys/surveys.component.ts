import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';

import { SurveysService } from '../_services/surveys.service';
import { BaseComponent } from '../_helpers/base.component';
import { QueryParams } from '../_helpers/entities/QueryParams';
import { Survey } from '../_models/survey';


@Component({
  selector: 'app-surveys',
  templateUrl: './surveys.component.html'
})
export class SurveysComponent extends BaseComponent implements OnInit {

  data: {
    surveys: any[],
    pagination: {
      totalResults: number,
      index: number,
      includedResults: number
    }
  };
  surveys: any[];
  newQuery: QueryParams;
  validSortOption: any = [
    'survey_name',
    '-survey_name',
    'client',
    '-client',
    'events',
    '-events',
    'total_entries',
    '-total_entries'
  ];

  constructor(private surveysService: SurveysService, private route: ActivatedRoute, private router: Router) {
    super();
  }

  ngOnInit() {
    this.resetQuery(true);
  }

  onRouteChange(queryParams: QueryParams) {
    if (!this.queryParamsCorrection(queryParams)) {
      this.router.navigate(['surveys'], {
        queryParams: {
          Offset: _.get(queryParams, 'Offset', 0),
          Limit: _.get(queryParams, 'Limit', 10),
          SortBy: _.get(queryParams, 'SortBy', 'survey_name'),
        }
      });
    } else {
      const {
        Offset, Limit, SortBy
      }: QueryParams = queryParams;
      this.surveysService.getAll(Offset, Limit, SortBy)
        .subscribe(result => this.data = result);
    }

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
      queryParams.SortBy = 'survey_name';
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

  navigateToCreateNewSurvey() {
    this.router.navigate(['/survey']);
  }

  deleteSurveyAction(survey: Survey) {
    this.surveysService.deleteSurvey(survey.id).subscribe(data => {
      _.remove(this.data.surveys, {id: survey.id});
    }, err => {
      const error = _.get(err, 'error', 'This Survey is associated with an Event hence can\'t be deleted');
      alert(error);
    });
  }
}
