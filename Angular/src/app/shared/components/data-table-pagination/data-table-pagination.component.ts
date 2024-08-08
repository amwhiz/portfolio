import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { LoDashStatic } from 'lodash';

@Component({
  selector: 'app-data-table-pagination',
  templateUrl: './data-table-pagination.component.html'
})
export class DataTablePaginationComponent implements OnInit {
  _: LoDashStatic = _;
  @Input() limit: number;
  @Input() pagination: {
    included_results: number,
    index: number,
    total_results: number
  };
  @Input() page: string;
  @Input() type: string;

  constructor(private route: ActivatedRoute, private router: Router) {
  }

  ngOnInit() {
  }

  onPagination(i: string, l: string) {
    const queryParams = _.assign({}, this.route.snapshot.queryParams, {
      Offset: i,
      Limit: l || 10
    });
    this.router.navigate([this.page], {queryParams});
  }

}
