import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandlerFn,
    HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { Observable, catchError, throwError } from 'rxjs';
import { LocalStorageService } from './localStorage.service';

/**
 * Intercept
 *
 * @param req
 * @param next
 */
export const authInterceptor = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthService);
    const _localStorage = inject(LocalStorageService);

    const excludedUrls: string[] = [`${apiUrls.login}`];

    // Check if request is in excluded list
    const isExcluded = excludedUrls.some((url) => req.url.includes(url));

    // Clone the request object
    let newReq = req.clone();

    // Request
    if (
        !isExcluded &&
        _localStorage.accessToken && !AuthUtils.isTokenExpired(_localStorage.accessToken)
    ) {

        let headersObj = req.headers
            .set('Authorization', `Bearer ${_localStorage.accessToken}`)
            .set('cid', _localStorage.cid || '')  // Default empty string if undefined
            .set('uid', _localStorage.uid || '')
            .set('eid', _localStorage.eid || '');

        newReq = req.clone({ headers: headersObj });
    }

    // Response
    return next(newReq).pipe(
        catchError((error) => {
            // Catch "401 Unauthorized" responses
            if (error instanceof HttpErrorResponse && error.status === 401) {
                // Sign out
                authService.signOut();

                // Reload the app
                location.reload();
            }

            return throwError(error);
        })
    );
};
