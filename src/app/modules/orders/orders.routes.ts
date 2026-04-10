import { Routes } from '@angular/router';
import { DistributorGuard, NoDistributorGuard } from 'app/core/auth/guards/distributor.guard';

export default [
    {
        path: 'order-dashboard',
        canActivate: [NoDistributorGuard],
        loadComponent: () => import('./order-dashboard/order-dashboard.component').then(m => m.OrderDashboardComponent),
    },
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
    {
        path: 'stock-master',
        canActivate: [NoDistributorGuard],
        loadComponent: () => import('./stock-master/stock-master.component').then(m => m.StockMasterComponent),
    },
    {
        path: 'dispatch-planning',
        canActivate: [NoDistributorGuard],
        loadComponent: () => import('./dispatch-planning/dispatch-planning.component').then(m => m.DispatchPlanningComponent),
    },
    {
        path: 'dispatch-list',
        canActivate: [NoDistributorGuard],
        loadComponent: () => import('./dispatch-list/dispatch-list.component').then(m => m.DispatchListComponent),
    },
] as Routes;
