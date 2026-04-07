import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { Navigation } from 'app/core/navigation/navigation.types';
import { LocalStorageService } from 'app/core/auth/localStorage.service';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { map, Observable, ReplaySubject, shareReplay, tap } from 'rxjs';
import { ApiResponse } from '../Base/interface/IResponses';

@Injectable({ providedIn: 'root' })
export class NavigationService {
    private _httpClient = inject(HttpClient);
    private _localStorage = inject(LocalStorageService);
    private _navigation: ReplaySubject<Navigation> =
        new ReplaySubject<Navigation>(1);
    private _navigationCache$: Observable<Navigation> | null = null;

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
     * Cached: Subsequent calls return the same cached observable instead of making new HTTP requests
     */
   get(): Observable<Navigation> {
    // If we already have a cached observable, return it
    if (this._navigationCache$) {
        return this._navigationCache$;
    }

    // Create and cache the observable with shareReplay(1) to cache the result
    this._navigationCache$ = this._httpClient.get<ApiResponse<any[]>>(apiUrls.navigation).pipe(
        map((navigation: ApiResponse<any[]>) => {
            // Detect distributor: their nav has order-submit, no dashboard
            const links = navigation.Data?.flatMap((g: any) => g.children?.map((c: any) => c.link) || []) || [];
            const isDistributor = links.includes('/orders/order-submit');
            this._localStorage.isDistributor = isDistributor ? 'true' : 'false';
            return this.buildNavigationVariants(navigation);
        }),
        tap((navObj: Navigation) => {
            this._navigation.next(navObj);
        }),
        shareReplay(1) // Cache the result and share it with all subscribers
    );

    return this._navigationCache$;
}

/**
 * Clear the navigation cache (useful after logout or when navigation needs to be refreshed)
 */
clearCache(): void {
    this._navigationCache$ = null;
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
