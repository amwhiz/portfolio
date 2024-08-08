import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class EventsService {
  constructor(private http: Http) {
  }

  getAll(offset: string, limit: string, sortBy: string): Observable<any> {
    const params = new URLSearchParams();
    params.append('offset', offset);
    params.append('limit', limit);
    params.append('sortby', sortBy);

    return this.http.get(`/api/events?${params.toString()}`)
      .map((response: Response) => {
        return <any>response.json().data;
      });
  }

  createEvent(name: string, startDate: Date, endDate: Date, surveyID: number): Observable<any> {
    return this.http.post('/api/events', {
      name: name,
      start_date: startDate,
      end_date: endDate,
      survey_id: surveyID
    })
      .map((response: Response) => {
        return <any>response.json().data;
      });
  }

  updateEvent(name: string, startDate: Date, endDate: Date, surveyID: number, eventID: number): Observable<any> {
    const url = '/api/events/' + eventID;
    return this.http.put(url, {
      name: name,
      start_date: startDate,
      end_date: endDate,
      survey_id: surveyID
    })
      .map((response: Response) => {
        return <any>response.json().data;
      });
  }

  deleteEvent(eventID: number): Observable<any> {
    const url = '/api/events/' + eventID;
    return this.http.delete(url)
      .map((response: Response) => {
        return <any>response.json().data;
      });
  }
}
