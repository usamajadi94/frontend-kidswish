import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiResponse } from '../interface/IResponses';

@Injectable({
  providedIn: 'root'
})
export class QueryService {
  constructor(private http: HttpClient) {}

  getQuery(helpno: string, filters: any = {}): Observable<any[]> {
    return this.http.post(apiUrls.query, { helpno, filters }).pipe(
      map((res: ApiResponse<any>) => res.Data['value']),
      catchError(this.handleError)
    );
  }

  getMultipleQuery(helpno: string, filters: any = {}): Observable<ApiResponse<any>> {
    return this.http.post(apiUrls.query, { helpno, filters }).pipe(
      map((res: ApiResponse<any>) => res.Data),
      catchError(this.handleError)
    );
  }

  get<T>(path: string): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(apiUrls.server + path).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    return throwError(() => error);
  }
}
