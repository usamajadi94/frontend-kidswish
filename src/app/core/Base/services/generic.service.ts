import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { catchError, Observable, throwError } from 'rxjs';
import { ApiResponse } from '../interface/IResponses';

@Injectable({
  providedIn: 'root'
})
export class GenericService {

  constructor(private http: HttpClient) { }

  getDataByID<T>(controllerName: string, ID: number): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(`${apiUrls.server}${controllerName}/${ID}`).pipe(
      catchError(this.handleError)
    );
  }

  insert<T>(controllerName: string, formData: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${apiUrls.server}${controllerName}`, formData).pipe(
      catchError(this.handleError)
    );
  }

  bulkinsert<T>(controllerName: string, formData: any): Observable<ApiResponse<T[]>> {
    return this.http.post<ApiResponse<T[]>>(`${apiUrls.server}${controllerName}/bulkinsert`, formData).pipe(
      catchError(this.handleError)
    );
  }

  update<T>(controllerName: string, ID: any, formData: any): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${apiUrls.server}${controllerName}/${ID}`, formData).pipe(
      catchError(this.handleError)
    );
  }

  delete(controllerName: string, ID: any): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${apiUrls.server}${controllerName}/${ID}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    return throwError(() => error);
  }
}
