import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
    CurrentUser,
    LoginUser,
    ModuleAccess,
    SectionAccess,
} from 'app/core/user/user.types';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { Observable, ReplaySubject, map, of, switchMap, tap } from 'rxjs';
import { ApiResponse } from '../Base/interface/IResponses';
import { LocalStorageService } from '../auth/localStorage.service';

@Injectable({ providedIn: 'root' })
export class UserService {
    private _httpClient = inject(HttpClient);
    private _localStorage = inject(LocalStorageService);
    private _user: ReplaySubject<CurrentUser> = new ReplaySubject<CurrentUser>();
    /** Cached user API response to avoid repeated getUser() calls on every guard check */
    private _cachedUserResponse: ApiResponse<any> | null = null;

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: CurrentUser) {
        // Store the value
        this._user.next(value);
    }

    get user$(): Observable<CurrentUser> {
        return this._user.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current signed-in user data
     */
    get(): Observable<CurrentUser> {
        return this._httpClient.get<CurrentUser>('api/common/user').pipe(
            tap((user) => {
                this._user.next(user);
            })
        );
    }

    /**
     * Update the user
     *
     * @param user
     */
    update(user: CurrentUser): Observable<any> {
        return this._httpClient
            .patch<CurrentUser>('api/common/user', { user })
            .pipe(
                map((response) => {
                    this._user.next(response);
                })
            );
    }

    /**
     * Get current user from API. Result is cached after first successful call
     * so the Auth Guard does not trigger a new HTTP request on every navigation.
     * Cache is cleared on logout via clearUserCache().
     */
    getUser(): Observable<ApiResponse<any>> {
        if (this._cachedUserResponse !== null) {
            return of(this._cachedUserResponse);
        }
        return this._httpClient.get<ApiResponse<any>>(apiUrls.me).pipe(
            switchMap((response: ApiResponse<any>) => {
                this._localStorage.cid = response?.Data?.value[0].CID;
                this._localStorage.uid = response?.Data?.value[0].UID;
                this._localStorage.eid = response?.Data?.value[0].EID;
                this._localStorage.isDistributor = response?.Data?.value[0].IsDistributor ? 'true' : 'false';
                this._cachedUserResponse = response;
                return of(response);
            })
        );
    }

    /** Clear cached user (call on logout so next login fetches fresh data) */
    clearUserCache(): void {
        this._cachedUserResponse = null;
    }

    setUserProfile(response: any): void {
        let user: CurrentUser = response.value[0] as CurrentUser;
        LoginUser.User = user;
        LoginUser.ClientID = user.ClientID;
        LoginUser.EntityID = user.EntityID;

        let moduleAccess = response.Table1 as ModuleAccess[];
        LoginUser.ModuleAccess = moduleAccess;

        let sectionAccess = response.Table2 as SectionAccess[];
        LoginUser.SectionAccess = sectionAccess;

        this._user.next(user);
    }
}
