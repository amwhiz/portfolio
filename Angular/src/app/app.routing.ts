import { Routes, RouterModule } from '@angular/router';

import { EventsComponent } from './events/events.component';
import { LoginComponent } from './login/login.component';
import { SurveysComponent } from './surveys/surveys.component';
import { AuthGuard } from './_guards/index';
import { NewSurveyComponent } from './new-survey/new-survey.component';
import { CanDeactivateGuard } from './shared/can-deactivate-guard.service';


const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/events', pathMatch: 'full'},
  { path: 'events', component: EventsComponent, canActivate: [AuthGuard] },
  { path: 'surveys', component: SurveysComponent, canActivate: [AuthGuard] },
  { path: 'survey', component: NewSurveyComponent, canActivate: [AuthGuard], canDeactivate: [CanDeactivateGuard] },
  { path: 'survey/:id', component: NewSurveyComponent, canActivate: [AuthGuard], canDeactivate: [CanDeactivateGuard] },

  // otherwise redirect to home
  { path: '**', redirectTo: '/events', pathMatch: 'full'}
];

export const routing = RouterModule.forRoot(appRoutes);
