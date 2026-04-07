import { Routes } from '@angular/router';

export const ordersRoutes: Routes = [
    {
        path: 'order-submit',
        loadComponent: () => import('./order-submit/order-submit.component').then(m => m.OrderSubmitComponent),
    },
    {
        path: 'my-orders',
        loadComponent: () => import('./order-list/order-list.component').then(m => m.OrderListComponent),
        data: { title: 'My Orders', showSubmitBtn: true },
    },
    {
        path: 'order-list',
        loadComponent: () => import('./order-list/order-list.component').then(m => m.OrderListComponent),
    },
    {
        path: 'order-detail/:id',
        loadComponent: () => import('./order-detail/order-detail.component').then(m => m.OrderDetailComponent),
    },
];
