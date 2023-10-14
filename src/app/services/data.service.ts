import { Observable } from 'rxjs';
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { KeyValue } from '@angular/common';

@Injectable({
  providedIn: 'root',

})
export class DataService {
  private http = inject(HttpClient);

  get(url: string, parameters?: Array<KeyValue<any, any>>): Observable<any> {
    return this.http.get<any>(url, { params: this.setParams(parameters) });
  }


  setParams(parameters?: Array<KeyValue<any, any>>): HttpParams {
    let params = new HttpParams();

    if (parameters) parameters.forEach(x => params = params.set(x.key, x.value));
    return params;
  }


  post(url: string, body: any): Observable<any> {
    return this.http.post<any>(url, body);
  }


  put(url: string, body: any) {
    return this.http.put<any>(url, body);
  }

  delete(url: string, params: any) {
    return this.http.delete<any>(url, { params: params });
  }
}