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
import { Observable, catchError, switchMap, throwError } from 'rxjs';
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

    const excludedUrls: string[] = [
        `${apiUrls.login}`,
        `${apiUrls.signup}`,
        `${apiUrls.tokenRefresh}`
    ];

    // Check if request is in excluded list
    const isExcluded = excludedUrls.some((url) => req.url.includes(url));

    // If request is excluded, pass through without auth
    if (isExcluded) {
        return next(req);
    }

    // Build a function to attach auth headers
    const attachAuth = (request: HttpRequest<unknown>, token: string): HttpRequest<unknown> => {
        const headersObj = request.headers
            .set('Authorization', `Bearer ${token}`)
            .set('cid', _localStorage.cid || '')
            .set('uid', _localStorage.uid || '')
            .set('eid', _localStorage.eid || '');
        return request.clone({ headers: headersObj });
    };

    const token = _localStorage.accessToken;

    // If we have a valid (non-expired) token, attach and continue
    if (token && !AuthUtils.isTokenExpired(token)) {
        const authedReq = attachAuth(req, token);
        return next(authedReq).pipe(
            catchError((error) => {
                if (error instanceof HttpErrorResponse && error.status === 401) {
                    // Try silent refresh then retry
                    return authService.refreshAccessToken().pipe(
                        switchMap((newToken) => next(attachAuth(req, newToken))),
                        catchError((refreshErr) => {
                            authService.signOut();
                            return throwError(refreshErr);
                        })
                    );
                }
                return throwError(error);
            })
        );
    }

    // If token missing or expired but we have a refresh token, refresh proactively then continue
    if (_localStorage.refreshToken) {
        return authService.refreshAccessToken().pipe(
            switchMap((newToken) => next(attachAuth(req, newToken))),
            catchError((refreshErr) => {
                authService.signOut();
                return throwError(refreshErr);
            })
        );
    }

    // No token and no refresh token: proceed without auth; backend may 401
    return next(req).pipe(
        catchError((error) => {
            if (error instanceof HttpErrorResponse && error.status === 401) {
                authService.signOut();
            }
            return throwError(error);
        })
    );
};
