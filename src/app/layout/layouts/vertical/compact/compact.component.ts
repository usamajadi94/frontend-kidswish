import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FuseFullscreenComponent } from '@fuse/components/fullscreen';
import { FuseLoadingBarComponent } from '@fuse/components/loading-bar';
import {
    FuseNavigationItem,
    FuseNavigationService,
    FuseVerticalNavigationComponent,
} from '@fuse/components/navigation';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { Navigation } from 'app/core/navigation/navigation.types';
import { UserComponent } from 'app/layout/common/user/user.component';
import { NotificationsBellComponent } from 'app/layout/common/notifications-bell/notifications-bell.component';
import { filter, Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'compact-layout',
    templateUrl: './compact.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        FuseLoadingBarComponent,
        MatButtonModule,
        MatIconModule,
        FuseFullscreenComponent,
        UserComponent,
        RouterOutlet,
        RouterLink,
        RouterLinkActive,
        FuseVerticalNavigationComponent,
        NotificationsBellComponent,
    ],
})
export class CompactLayoutComponent implements OnInit, OnDestroy {
    isScreenSmall: boolean;
    navigation: Navigation;
    subNavItems: FuseNavigationItem[] = [];
    subNavTitle = '';

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _navigationService: NavigationService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService,
    ) {}

    get currentYear(): number {
        return new Date().getFullYear();
    }

    ngOnInit(): void {
        this._navigationService.navigation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((navigation: Navigation) => {
                this.navigation = navigation;
                this._updateSubNav(this._router.url);
            });

        this._router.events
            .pipe(
                filter(e => e instanceof NavigationEnd),
                takeUntil(this._unsubscribeAll),
            )
            .subscribe((e: NavigationEnd) => {
                this._updateSubNav(e.urlAfterRedirects);
            });

        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                this.isScreenSmall = !matchingAliases.includes('md');
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    toggleNavigation(name: string): void {
        const navigation = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(name);
        if (navigation) navigation.toggle();
    }

    private _updateSubNav(url: string): void {
        if (!this.navigation?.default) { this.subNavItems = []; return; }

        const cleanUrl = url.split('?')[0];

        for (const group of this.navigation.default) {
            const children: FuseNavigationItem[] = (group.children || []).filter(
                (c: FuseNavigationItem) => c.link && c.type === 'basic',
            );
            // Match by exact link — avoids false positives when multiple groups share the same URL prefix (e.g. /setup/)
            const belongs = children.some(c =>
                cleanUrl === c.link ||
                cleanUrl.startsWith(c.link + '/') ||
                cleanUrl.startsWith(c.link + '?'),
            );
            if (belongs && children.length > 1) {
                this.subNavItems = children;
                this.subNavTitle = group.title as string;
                return;
            }
        }
        this.subNavItems = [];
        this.subNavTitle = '';
    }

    isSubNavActive(link: string): boolean {
        return this._router.url === link || this._router.url.startsWith(link + '/') || this._router.url.startsWith(link + '?');
    }
}
