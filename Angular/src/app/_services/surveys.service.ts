import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class SurveysService {
  constructor(private http: Http) {
  }

  getAll(offset: string, limit: string, sortBy: string): Observable<any> {
    const params = new URLSearchParams();
    params.append('offset', offset);
    params.append('limit', limit);
    params.append('sortby', sortBy);

    return this.http.get(`/api/surveys?${params.toString()}`)
      .map((response: Response) => {
        return <any>response.json().data;
      });
  }

  get(surveyId: number): Observable<any> {
    return this.http.get(`/api/survey/${surveyId}`)
      .map((response: Response) => {
        return <any>response.json().data;
      });
  }

  createSurvey(name: string, clientName: string, questions: any): Observable<any> {
    return this.http.post('/api/surveys', {
      name: name,
      clientName: clientName,
      questions: questions
    })
      .map((response: Response) => {
        return <any>response.json().data;
      });
  }

  updateSurvey(id: number, name: string, clientName: string, questions: any): Observable<any> {
    return this.http.put(`/api/surveys/${id}` , {
      name: name,
      clientName: clientName,
      questions: questions
    })
      .map((response: Response) => {
        return <any>response.json().data;
      });
  }

  deleteSurvey(id: number): Observable<any> {
    const url = '/api/surveys/' + id;
    return this.http.delete(url)
      .map((response: Response) => {
        return <any>response.json().data;
      });
  }
}
