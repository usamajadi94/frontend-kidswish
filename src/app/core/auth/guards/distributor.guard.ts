import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LocalStorageService } from 'app/core/auth/localStorage.service';

export const DistributorGuard: CanActivateFn = () => {
    const localStorage = inject(LocalStorageService);
    const router = inject(Router);

    if (localStorage.isDistributor === 'true') {
        return true;
    }
    return router.parseUrl('/dashboard');
};

export const NoDistributorGuard: CanActivateFn = () => {
    const localStorage = inject(LocalStorageService);
    const router = inject(Router);

    // Admin users always get through (belt-and-suspenders)
    if (localStorage.isAdmin === 'true' || localStorage.isGlobalAdmin === 'true') {
        return true;
    }
    if (localStorage.isDistributor !== 'true') {
        return true;
    }
    return router.parseUrl('/orders/my-orders');
};
