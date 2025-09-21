import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
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
      tap(() => console.log(`Fetched data for ID: ${ID}`)),
      catchError(this.handleError)
    );
  }

  insert<T>(controllerName: string, formData: any): Observable<ApiResponse<T>> {
    const reqUrl = `${apiUrls.server}${controllerName}`;
    return this.http.post<ApiResponse<T>>(reqUrl, formData).pipe(
      tap(() => console.log('Insert request sent')),
      catchError(this.handleError)
    );
  }

  bulkinsert<T>(controllerName: string, formData: any): Observable<ApiResponse<T[]>> {
    const reqUrl = `${apiUrls.server}${controllerName}/bulkinsert`;
    return this.http.post<ApiResponse<T[]>>(reqUrl, formData).pipe(
      tap(() => console.log('Bulk insert request sent')),
      catchError(this.handleError)
    );
  }

  update<T>(controllerName: string, ID: any, formData: any): Observable<ApiResponse<T>> {
    const reqUrl = `${apiUrls.server}${controllerName}/${ID}`;
    return this.http.put<ApiResponse<T>>(reqUrl, formData).pipe(
      tap(() => console.log('Update request sent')),
      catchError(this.handleError)
    );
  }

  delete(controllerName: string, ID: any): Observable<ApiResponse<string>> {
    const url = `${apiUrls.server}${controllerName}/${ID}`;
    return this.http.delete<ApiResponse<string>>(url).pipe(
      tap(() => console.log(`Delete request sent for ID: ${ID}`)),
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('API Error:', error);
    return throwError(() => error);
  }
}


