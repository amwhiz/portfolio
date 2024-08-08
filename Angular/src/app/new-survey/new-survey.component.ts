import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { LoDashStatic } from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';

import { Question, QuestionsPage } from '../_models';
import { AddSurveyDetailsComponent } from './components/modals/add-survey-details/add-survey-details.component';
import { SurveysService } from '../_services/surveys.service';
import { questionsFormat } from '../shared/constants';

@Component({
  selector: 'app-new-surveys',
  templateUrl: './new-survey.component.html'
})
export class NewSurveyComponent implements OnInit {
  _: LoDashStatic = _;
  questions = _.cloneDeep(questionsFormat);
  language = 'en';
  currentPage = 1;
  surveyName = '';
  clientName = '';
  surveyId: number;
  type = 'create';
  disableReload = false;
  @ViewChild('addSurveyDetails') addSurveyDetails: AddSurveyDetailsComponent;
  constructor(private router: Router, private route: ActivatedRoute, private surveysService: SurveysService,) {
    this.route.params
      .subscribe(surveyID => {
        if (_.get(surveyID, 'id') || _.get(this.route, 'snapshot.queryParams.cloneId')) {
          const cloneId = _.get(this.route, 'snapshot.queryParams.cloneId');
          this.surveyId = _.get(surveyID, 'id');
          this.type = cloneId ? 'create' : 'update';
          this.surveysService.get(this.surveyId || cloneId).subscribe(data => {
              this.surveyName = _.get(data, 'name');
              this.clientName = _.get(data, 'client_name');
              this.questions = _.cloneDeep(_.isNull(_.get(data, 'questions')) ? questionsFormat : _.get(data, 'questions'));
            },
            err => {
              alert('Something went wrong');
              this.router.navigate(['surveys']);
            });
        } else if (_.get(this.route, 'snapshot.queryParams.cloneId')) {

        }else {
          this.type = 'create';
          this.questions = _.cloneDeep(questionsFormat);
        }
      });
  }

  @HostListener('window:beforeunload', ['$event'])
  doSomething($event: any) {
    if (this.disableReload) {
      return true;
    }
    $event.returnValue = 'Are you sure you want to leave ? The information that you have entered will be lost.';
  }

  canDeactivate(): Promise<boolean> | boolean {
    if (this.disableReload) {
      return true;
    }
    return window.confirm('Are you sure you want to leave ? The information that you have entered will be lost.');
  }

  getQuestionsForCurrentPage(currentPage?: number): QuestionsPage {
    const questionsPageVal = _.find(this.questions[this.language],
      (questionsPage: QuestionsPage) => questionsPage.pageNo === (currentPage || this.currentPage));
    if (!questionsPageVal) {
      this.currentPage = this.currentPage - 1;
      return _.find(this.questions[this.language],
        (questionsPage: QuestionsPage) => questionsPage.pageNo === (currentPage || this.currentPage));
    }
    return questionsPageVal;
  }

  ngOnInit() {
  }

  applyNewPageTitleForCurrentPage(title: string, subTitle) {
    this.getQuestionsForCurrentPage().pageTitle = title;
    this.getQuestionsForCurrentPage().pageSubTitle = subTitle;
  }

  addQuestionToQuestions(val: { type: string, question: string, ack: string }) {
    this.getQuestionsForCurrentPage().questions.push({
      no: _.size(this.getQuestionsForCurrentPage().questions) + 1,
      type: val.type,
      placeholder: true,
      name: val.question,
      required: true,
      phoneValidation: _.isEqual(val.type, 'TEXT') ? /phone/.test(_.lowerCase(val.question)) : false,
      emailValidation: _.isEqual(val.type, 'TEXT') ? /email/.test(_.lowerCase(val.question)) : false,
      acknowledgement: val.ack,
      noOfImages: 0,
      options: []
    });
  }

  addPage() {
    const allQuestions = _.cloneDeep(this.questions);
    _.forEach(['en', 'es'], (language: string) => {
      allQuestions[language].push({
        pageNo: _.size(allQuestions[language]) + 1,
        pageTitle: '',
        pageSubTitle: '',
        picture: '',
        questions: []
      });
    });
    this.questions = allQuestions;
  }

  navigateToSurvey(status: boolean) {
    this.disableReload = status;
    this.router.navigate(['/surveys']);
  }

  deleteQuestion(qNo: number) {
    const allQuestions = _.cloneDeep(this.questions);
    const questions: QuestionsPage = _.find(allQuestions[this.language],
      (questionsPage: QuestionsPage) => questionsPage.pageNo === this.currentPage);
    _.remove(questions.questions, (question: Question) => question.no === qNo);
    this.questions = allQuestions;
  }

  removePage() {
    const questions = _.cloneDeep(this.questions);
    this.currentPage = this.currentPage - 1;
    _.forEach(['en', 'es'], (language: string, i: number) => {
      _.remove(questions[language],
        (questionsPage: QuestionsPage) => questionsPage.pageNo === this.currentPage + 1);
    });
    _.forEach(['en', 'es'], (language: string) => {
      _.forEach(questions[language], (questionsPage: QuestionsPage, i: number) => {
        questionsPage.pageNo = i + 1;
      });
    });
    this.questions = questions;
  }

  setLang(lang: string) {
    this.language = lang;
  }

  updatePage(picture: string) {
    const questions = _.cloneDeep(this.questions);
    _.find(questions[this.language],
      (questionsPage: QuestionsPage) => questionsPage.pageNo === (this.currentPage)).picture = picture;
    this.questions = questions;
  }

  updateCoverImage(picture: string) {
    this.questions.picture = picture;
  }

  isFormInvalid() {
    let isError = false;
    _.forEach(['en', 'es'], (lang: string) => {
      _.forEach(this.questions[lang], (questionsPage: QuestionsPage) => {
        _.forEach(questionsPage.questions, (question: Question) => {
          if (question.type === 'CONTENT' && !question.acknowledgement) {
            isError = true;
          }
          if (!_.includes(['CONTENT', 'IMAGE'], question.type) && !question.name) {
            isError = true;
          }
          if (_.includes(['DROPDOWN', 'MULTIPLE_CHOICE_SINGLE', 'MULTIPLE_IMAGE', 'IMAGE'], question.type) && !_.size(question.options)) {
            isError = true;
          }
        });
      });
    });
    return isError;
  }

  updateQuestionToQuestion(updatedQuestion: Question) {
    _.find(this.getQuestionsForCurrentPage().questions,
      (question: Question) => question.no === updatedQuestion.no).options = updatedQuestion.options;
    _.find(this.getQuestionsForCurrentPage().questions,
      (question: Question) => question.no === updatedQuestion.no).noOfImages = updatedQuestion.noOfImages;
  }

}
