import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html'
})
export class SideNavComponent implements OnInit {
  @Input() currentPage: string;
  constructor() { }

  ngOnInit() {
  }

  logout() {
    localStorage.clear();
    window.location.href = '/login';
  }
}
