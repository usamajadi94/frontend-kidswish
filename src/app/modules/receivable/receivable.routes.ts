import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () => import('./receivable.component').then(m => m.ReceivableComponent),
    },
] as Routes;
