import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () => import('./notifications.component').then(m => m.NotificationsComponent),
    },
] as Routes;
