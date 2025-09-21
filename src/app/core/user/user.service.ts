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
import { LocalStorageService } from '../auth/localStorage.service';
import { ApiResponse } from '../Base/interface/IResponses';

@Injectable({ providedIn: 'root' })
export class UserService {
    private _httpClient = inject(HttpClient);
    private _localStorage = inject(LocalStorageService);
    private _user: ReplaySubject<CurrentUser> = new ReplaySubject<CurrentUser>();

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

    getUser() {
        return this._httpClient.get(apiUrls.me).pipe(
            switchMap((response: ApiResponse<any>) => {
                this._localStorage.cid = response?.Data?.value[0].CID;
                this._localStorage.uid = response?.Data?.value[0].UID;
                this._localStorage.eid = response?.Data?.value[0].EID;
                return of(response);
            })
        );
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
