import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { user as userData } from 'app/mock-api/common/user/data';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { BehaviorSubject, catchError, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { ApiResponse } from '../Base/interface/IResponses';
import { LocalStorageService } from './localStorage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private _user: any = userData;
    private _authenticated: boolean = false;
    private _httpClient = inject(HttpClient);
    private _userService = inject(UserService);
    private _localStorage = inject(LocalStorageService);
    private _router = inject(Router);
    private _activatedRoute = inject(ActivatedRoute);

    // Keep access token in memory for runtime
    private _accessTokenInMemory: string = '';
    // Signal when refresh is in progress to queue waiting calls
    private _refreshInProgress$ = new BehaviorSubject<boolean>(false);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    changePassword(payload: any): Observable<any> {
        return this._httpClient.post(apiUrls.changePassword, payload);
    }

    updateMyProfile(payload: any): Observable<any> {
        return this._httpClient.put(apiUrls.settings, payload);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any> {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: {
        email: string;
        password: string;
    }): Observable<ApiResponse<any>> {
        // Throw error, if the user is already logged in
        if (this._authenticated) {
            return throwError('User is already logged in.');
        }
        return this._httpClient.post(apiUrls.login, credentials).pipe(
            switchMap((response: ApiResponse<any>) => {
                const accessToken = (response as any)?.accessToken ?? (response as any)?.Data?.AccessToken;
                const refreshToken = (response as any)?.refreshToken ?? (response as any)?.Data?.RefreshToken;
                this.setLocalStorage(accessToken);
                if (refreshToken) {
                    this._localStorage.refreshToken = refreshToken;
                }
                // this._localStorage.accessToken = response?.Data.AccessToken;
                // Set the authenticated flag to true
                // this._authenticated = true;
                // Store the user on the user service
                // this._userService.user = this._user;
                // Return a new observable with the response
                return of(response);
            })
        );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any> {
        // Check if access token exists in local storage
        const accessToken = this._accessTokenInMemory || this._localStorage.accessToken;

        if (!accessToken) {
            return of(false);
        }

        if (this._localStorage.isPasswordChanged == 'true') {
            this._router.navigateByUrl('/change-password');
            // this._authenticated = true;
            // return of(true);
        } else if (this._localStorage.eid == '') {
                if (this.checkMultipleEntity() == true) {
                    this._router.navigateByUrl('/switch-entity');
                    // this._authenticated = true;
                    // return of(true);
                }
        }else{
        //   Fetch user profile
        // this._userService.getUser().subscribe((res) => {
        //     this._userService.setUserProfile(res.Data);
        // });
        return this._userService.getUser().pipe(
            tap((res) => {
            this._userService.setUserProfile(res.Data);
            this._authenticated = true;
            }),
            map(() => true),
            catchError(() => of(false))
        );


        }

        // Check multiple entities condition
        // if(this._localStorage.eid == ''){
        //     if (this.checkMultipleEntity(accessToken)) {
        //         this._router.navigateByUrl('/switch-entity');
        //         this._authenticated = true;
        //         return of(true);
        //     }
        // }

      
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        this._localStorage.clearAll();
        this._accessTokenInMemory = '';

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: {
        name: string;
        email: string;
        password: string;
        company: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: {
        email: string;
        password: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        // Check if the user is logged in
        if (this._authenticated) {
            return of(true);
        }

        // Check the access token availability
        if (!(this._accessTokenInMemory || this._localStorage.accessToken)) {
            return of(false);
        }

        // Check the access token expire date
        const tokenToCheck = this._accessTokenInMemory || this._localStorage.accessToken;
        if (AuthUtils.isTokenExpired(tokenToCheck)) {
            return of(false);
        }

        // If the access token exists, and it didn't expire, sign in using it
        return this.signInUsingToken();
    }

    setLocalStorage(AccessToken: string) {
        if (AccessToken) {
            this._localStorage.accessToken = AccessToken;
            this._accessTokenInMemory = AccessToken;
            let tokenObj = AuthUtils._decodeToken(AccessToken);
            this._localStorage.cid = tokenObj.cid;
            this._localStorage.uid = tokenObj.uid;
            this._localStorage.isPasswordChanged =
                tokenObj.isPasswordChanged == 'Yes' ? 'true' : 'false';
            if (tokenObj.eid == '') {
                this._localStorage.isMultipleEntity = 'true';
                this._localStorage.eid = '';
            } else {
                this._localStorage.isMultipleEntity = 'false';
                this._localStorage.eid = tokenObj.eid;
            }
        }
    }

    /**
     * Refresh the access token using refresh token
     */
    refreshAccessToken(): Observable<string> {
        const storedRefreshToken = this._localStorage.refreshToken;
        if (!storedRefreshToken) {
            return throwError(() => new Error('No refresh token'));
        }
        if (this._refreshInProgress$.value) {
            return this._refreshInProgress$
                .pipe(
                    filter((inProgress) => !inProgress),
                    take(1),
                    map(() => this._accessTokenInMemory || this._localStorage.accessToken)
                );
        }
        this._refreshInProgress$.next(true);
        return this._httpClient.post(apiUrls.tokenRefresh, { refreshToken: storedRefreshToken })
            .pipe(
                switchMap((resp: any) => {
                    const newAccessToken = resp?.accessToken ?? resp?.Data?.accessToken;
                    if (!newAccessToken) {
                        throw new Error('No access token in refresh response');
                    }
                    this.setLocalStorage(newAccessToken);
                    return of(newAccessToken);
                }),
                catchError((err) => {
                    this.signOut();
                    return throwError(() => err);
                }),
                tap({
                    next: () => {},
                    error: () => this._refreshInProgress$.next(false),
                    complete: () => this._refreshInProgress$.next(false)
                })
            );
    }

    checkPasswordChange() {
        return this._localStorage.isPasswordChanged == 'true' ? true : false;
    }

    checkMultipleEntity(): boolean {
        return this._localStorage.isMultipleEntity == 'true' ? true : false;
    }
}
