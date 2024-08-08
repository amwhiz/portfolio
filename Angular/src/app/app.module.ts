import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BsDropdownModule, ModalModule } from 'ngx-bootstrap';
import { ImageUploadModule } from 'angular2-image-upload';

import { AppComponent } from './app.component';
import { routing } from './app.routing';
import { customHttpProvider } from './_helpers';
import { AlertComponent } from './_directives';
import { EventsComponent } from './events/events.component';
import { LoginComponent } from './login/login.component';
import { SurveysComponent } from './surveys/surveys.component';
import { AlertService, AuthenticationService, EventsService, SurveysService } from './_services';
import { AuthGuard } from './_guards';
import { SideNavComponent } from './shared/components/side-nav/side-nav.component';
import { PageHeaderComponent } from './shared/components/page-header/page-header.component';
import { EventsDataTableComponent } from './shared/components/events-data-table/events-data-table.component';
import { SurveysDataTableComponent } from './shared/components/surveys-data-table/surveys-data-table.component';
import { QuestionPageComponent } from './new-survey/components/question-page/question-page.component';
import { PropertiesComponent } from './new-survey/components/properties/properties.component';
import { QuestionComponent } from './new-survey/components/question/question.component';
import { ModalComponent } from './shared/components/modal/modal.component';
import { NewSurveyComponent } from './new-survey/new-survey.component';
import { AddQuestionComponent } from './new-survey/components/modals/add-question/add-question.component';
import { CreateEventComponent } from './events/components/modals/create-event/create-event.component';
import { AddAnswerComponent } from './new-survey/components/modals/add-answer/add-answer.component';
import { CoverImageUploadModule } from './shared/image-upload/image-upload.module';
import { PageSpinnerModule } from './shared/components/page-spinner/page-spinner.module';
import { AddSurveyDetailsComponent } from './new-survey/components/modals/add-survey-details/add-survey-details.component';
import { UploadImageService } from './shared/upload-image.service';
import { DataTablePaginationComponent } from './shared/components/data-table-pagination/data-table-pagination.component';
import { MultipleImageUploadModule } from './shared/multiple-image-upload/multiple-image-upload.module';
import { DisplayImagesComponent } from './new-survey/components/modals/display-images/display-images.component';
import { CanDeactivateGuard } from './shared/can-deactivate-guard.service';

@NgModule({
  declarations: [
    AppComponent,
    AlertComponent,
    EventsComponent,
    LoginComponent,
    SurveysComponent,
    SideNavComponent,
    PageHeaderComponent,
    SurveysComponent,
    QuestionPageComponent,
    QuestionComponent,
    PropertiesComponent,
    ModalComponent,
    NewSurveyComponent,
    AddQuestionComponent,
    EventsDataTableComponent,
    SurveysDataTableComponent,
    CreateEventComponent,
    AddAnswerComponent,
    AddSurveyDetailsComponent,
    DataTablePaginationComponent,
    DisplayImagesComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    PageSpinnerModule,
    ModalModule.forRoot(),
    CoverImageUploadModule.forRoot(),
    ImageUploadModule.forRoot(),
    BsDropdownModule.forRoot(),
    MultipleImageUploadModule.forRoot(),
    routing
  ],
  providers: [
    customHttpProvider,
    AuthGuard,
    AlertService,
    AuthenticationService,
    EventsService,
    SurveysService,
    UploadImageService,
    CanDeactivateGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
