import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthenticationService } from '../_services/authentication.service';
import { AlertService } from '../_services/alert.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit, OnDestroy {
  model: any = {};
  loading = false;
  returnUrl: string;
  errorMsg: string;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private authenticationService: AuthenticationService,
              private alertService: AlertService,
              private renderer: Renderer2) {
    this.renderer.addClass(document.body, 'bg-login');
  }

  ngOnInit() {
    // reset login status
    this.errorMsg = '';
    this.authenticationService.logout();

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  login() {
    this.loading = true;
    this.authenticationService.login(this.model.username, this.model.password)
      .subscribe(
        data => {
          this.router.navigate([this.returnUrl]);
        },
        error => {
          try {
            const msg = JSON.parse(error);
            this.errorMsg = msg.message;
            this.loading = false;
          } catch (e) {
          }
        });
  }

  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'bg-login');
  }
}
