import { Routes } from '@angular/router';

export default [
    {
        path: 'client-list',
        loadComponent: () => import('./client-list/client-list.component').then(m => m.ClientListComponent),
    },
] as Routes;
