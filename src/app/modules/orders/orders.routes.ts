import { Routes } from '@angular/router';
import { DistributorGuard, NoDistributorGuard } from 'app/core/auth/guards/distributor.guard';

export const ordersRoutes: Routes = [
    {
        path: 'order-submit',
        canActivate: [DistributorGuard],
        loadComponent: () => import('./order-submit/order-submit.component').then(m => m.OrderSubmitComponent),
    },
    {
        path: 'my-orders',
        canActivate: [DistributorGuard],
        loadComponent: () => import('./order-list/order-list.component').then(m => m.OrderListComponent),
        data: { title: 'My Orders', showSubmitBtn: true },
    },
    {
        path: 'order-list',
        canActivate: [NoDistributorGuard],
        loadComponent: () => import('./order-list/order-list.component').then(m => m.OrderListComponent),
    },
    {
        path: 'order-detail/:id',
        loadComponent: () => import('./order-detail/order-detail.component').then(m => m.OrderDetailComponent),
    },
];
