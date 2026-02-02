import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { ApiResponse } from '../interface/IResponses';

@Injectable({
  providedIn: 'root'
})

export class GenericService {

  constructor(private http: HttpClient) { }

  getDataByID<T>(controllerName: string, ID: number): Observable<ApiResponse<T>> {
    const url = `${apiUrls.server}${controllerName}/${ID}`;
    return this.http.get<ApiResponse<T>>(url).pipe(
      tap(() => {
        if (!environment.production) {
          console.log(`Fetched data for ID: ${ID}`);
        }
      }),
      catchError(this.handleError)
    );
  }

  insert<T>(controllerName: string, formData: any): Observable<ApiResponse<T>> {
    const reqUrl = `${apiUrls.server}${controllerName}`;
    return this.http.post<ApiResponse<T>>(reqUrl, formData).pipe(
      tap(() => {
        if (!environment.production) {
          console.log('Insert request sent');
        }
      }),
      catchError(this.handleError)
    );
  }

  bulkinsert<T>(controllerName: string, formData: any): Observable<ApiResponse<T[]>> {
    const reqUrl = `${apiUrls.server}${controllerName}/bulkinsert`;
    return this.http.post<ApiResponse<T[]>>(reqUrl, formData).pipe(
      tap(() => {
        if (!environment.production) {
          console.log('Bulk insert request sent');
        }
      }),
      catchError(this.handleError)
    );
  }

  update<T>(controllerName: string, ID: any, formData: any): Observable<ApiResponse<T>> {
    const reqUrl = `${apiUrls.server}${controllerName}/${ID}`;
    return this.http.put<ApiResponse<T>>(reqUrl, formData).pipe(
      tap(() => {
        if (!environment.production) {
          console.log('Update request sent');
        }
      }),
      catchError(this.handleError)
    );
  }

  delete(controllerName: string, ID: any): Observable<ApiResponse<string>> {
    const url = `${apiUrls.server}${controllerName}/${ID}`;
    return this.http.delete<ApiResponse<string>>(url).pipe(
      tap(() => {
        if (!environment.production) {
          console.log(`Delete request sent for ID: ${ID}`);
        }
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    // Always log errors, but use console.error only in development
    if (!environment.production) {
      console.error('API Error:', error);
    }
    return throwError(() => error);
  }
}


