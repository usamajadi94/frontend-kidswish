import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import {
    FuseNavigationService,
    FuseVerticalNavigationComponent,
} from '@fuse/components/navigation';
import { AvailableLangs, TranslocoService } from '@ngneat/transloco';
import { take } from 'rxjs';

@Component({
    selector: 'languages',
    templateUrl: './languages.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'languages',
    standalone: true,
    imports: [MatButtonModule, MatMenuModule, NgTemplateOutlet],
})
export class LanguagesComponent implements OnInit, OnDestroy {
    availableLangs: AvailableLangs;
    activeLang: string;
    flagCodes: any;
    private _lastGoogleTarget: string | null = null;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseNavigationService: FuseNavigationService,
        private _translocoService: TranslocoService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Get the available languages from transloco
        this.availableLangs = this._translocoService.getAvailableLangs();

        // Subscribe to language changes
        this._translocoService.langChanges$.subscribe((activeLang) => {
            // Get the active lang
            this.activeLang = activeLang;

            // Update the navigation
            this._updateNavigation(activeLang);
        });

        // Set the country iso codes for languages for flags
        this.flagCodes = {
            en: 'us',
            es: 'es',
        };
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Set the active lang
     *
     * @param lang
     */
    setActiveLang(lang: string): void {
        // Set the active lang
        this._translocoService.setActiveLang(lang);

        // Also trigger Google Translate if available
        try {
            const win: any = window as any;
            const gt = win.google && win.google.translate;
            const targetMap: Record<string, string> = {
                en: 'en'
            };
            const target = targetMap[lang] || 'en';

            const setGoogleCookie = (from: string, to: string) => {
                try {
                    // Use /auto/ to avoid fighting with current page language
                    const cookieVal = `/auto/${to}`;
                    document.cookie = `googtrans=${cookieVal};path=/;`; // path scoped
                    document.cookie = `googtrans=${cookieVal};domain=${window.location.hostname};path=/;`; // domain scoped
                } catch {}
            };

            const applyTranslate = () => {
                const select = document.querySelector(
                    'select.goog-te-combo'
                ) as HTMLSelectElement | null;
                if (!select) return false;
                // Set cookie to help GT detect desired language
                setGoogleCookie('auto', target);
                // If this target is already applied and dropdown already shows it, do nothing
                if (this._lastGoogleTarget === target && select.value === target) {
                    return true;
                }
                // Apply target and dispatch multiple times to ensure GT picks it up
                const fire = () => {
                    select.value = target;
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                };
                fire();
                // Schedule retries to survive widget re-render
                setTimeout(fire, 100);
                requestAnimationFrame(() => fire());
                this._lastGoogleTarget = target;
                return true;
            };

            if (!applyTranslate()) {
                let tries = 0;
                const interval = setInterval(() => {
                    tries++;
                    if (applyTranslate() || tries > 40) {
                        clearInterval(interval);
                    }
                }, 200);
                // Fire a couple of delayed attempts to overcome late DOM swaps
                setTimeout(applyTranslate, 500);
                setTimeout(applyTranslate, 1500);
            }
        } catch (e) {
            // no-op
        }
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Update the navigation
     *
     * @param lang
     * @private
     */
    private _updateNavigation(lang: string): void {
        // For the demonstration purposes, we will only update the Dashboard names
        // from the navigation but you can do a full swap and change the entire
        // navigation data.
        //
        // You can import the data from a file or request it from your backend,
        // it's up to you.

        // Get the component -> navigation data -> item
        const navComponent =
            this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(
                'mainNavigation'
            );

        // Return if the navigation component does not exist
        if (!navComponent) {
            return null;
        }

        // Get the flat navigation data
        const navigation = navComponent.navigation;

        // Get the Project dashboard item and update its title
        const projectDashboardItem = this._fuseNavigationService.getItem(
            'dashboards.project',
            navigation
        );
        if (projectDashboardItem) {
            this._translocoService
                .selectTranslate('Project')
                .pipe(take(1))
                .subscribe((translation) => {
                    // Set the title
                    projectDashboardItem.title = translation;

                    // Refresh the navigation component
                    navComponent.refresh();
                });
        }

        // Get the Analytics dashboard item and update its title
        const analyticsDashboardItem = this._fuseNavigationService.getItem(
            'dashboards.analytics',
            navigation
        );
        if (analyticsDashboardItem) {
            this._translocoService
                .selectTranslate('Analytics')
                .pipe(take(1))
                .subscribe((translation) => {
                    // Set the title
                    analyticsDashboardItem.title = translation;

                    // Refresh the navigation component
                    navComponent.refresh();
                });
        }
    }
}
