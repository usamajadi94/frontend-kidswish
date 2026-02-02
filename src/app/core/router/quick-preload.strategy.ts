import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

/**
 * Preloads lazy chunks quickly: yields one tick so initial paint isn't blocked,
 * then starts loading all chunks so navigation feels instant.
 */
@Injectable({ providedIn: 'root' })
export class QuickPreloadStrategy implements PreloadingStrategy {
    preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
        if (route.data?.['preload'] === false) {
            return of(null);
        }
        if (route.loadChildren) {
            return timer(0).pipe(switchMap(() => load()));
        }
        return of(null);
    }
}
