import { HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginUser } from 'app/core/user/user.types';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { ApiResponse } from '../interface/IResponses';

@Injectable({
  providedIn: 'root'
})
export class QueryService {
  constructor(private http: HttpClient) {}

  getQuery(helpno: string, filters: any = {}): Observable<any[]> {
    const body = { helpno, filters };
    return this.http.post(apiUrls.query, body ).pipe(
      map((res:ApiResponse<any>)=> res.Data['value']),
      tap(() => console.log('Help data request sent')),
      catchError(this.handleError)
    );
  }

  getMultipleQuery(helpno: string, filters: any = {}): Observable<ApiResponse<any>> {
    const body = { helpno, filters };
    return this.http.post(apiUrls.query, body ).pipe(
      map((res:ApiResponse<any>)=> res.Data),
      tap(() => console.log('Help data request sent')),
      catchError(this.handleError)
    );
  }
 

  get<T>(path: string): Observable<ApiResponse<T>>{
    return this.http.get<ApiResponse<T>>(apiUrls.server+path).pipe(
      tap(() => console.log('Help data request sent')),
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('API Error:', error);
    return throwError(() => error);
  }
}