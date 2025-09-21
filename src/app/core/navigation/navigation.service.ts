import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { Navigation } from 'app/core/navigation/navigation.types';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { map, Observable, ReplaySubject, tap } from 'rxjs';
import { ApiResponse } from '../Base/interface/IResponses';

@Injectable({ providedIn: 'root' })
export class NavigationService {
    private _httpClient = inject(HttpClient);
    private _navigation: ReplaySubject<Navigation> =
        new ReplaySubject<Navigation>(1);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for navigation
     */
    get navigation$(): Observable<Navigation> {
        return this._navigation.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all navigation data
     */
   get(): Observable<Navigation> {
    /*  return this._httpClient.get<Navigation>('api/common/navigation').pipe(
            tap((navigation) => {
                this._navigation.next(navigation);
            })
        );*/
    return this._httpClient.get<ApiResponse<any[]>>(apiUrls.navigation).pipe(
        map((navigation: ApiResponse<any[]>) => this.buildNavigationVariants(navigation)),
        tap((navObj: Navigation) => {
            this._navigation.next(navObj);
        })
    );
}

/**
 * Builds different navigation variants from base navigation
 */
private buildNavigationVariants(navigation: ApiResponse<any[]>): Navigation {
    const baseNavigation = [...navigation.Data]; // Shallow copy for safety

    return {
        default: navigation.Data,
        compact: baseNavigation.map(item => ({ ...item, type: 'aside' })),
        futuristic: baseNavigation.map(item => {
            const { children, ...rest } = item;
            return { ...rest, type: 'basic' };
        }),
        horizontal: baseNavigation.map(item => {
            const { children, ...rest } = item;
            return { ...rest, type: 'basic' };
        })
    };
}

}
