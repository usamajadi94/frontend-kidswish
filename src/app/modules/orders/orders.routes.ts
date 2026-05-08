import { Routes } from '@angular/router';

export default [
    {
        path: 'order-dashboard',
        loadComponent: () => import('./order-dashboard/order-dashboard.component').then(m => m.OrderDashboardComponent),
    },
    {
        path: 'order-submit',
        loadComponent: () => import('./order-submit/order-submit.component').then(m => m.OrderSubmitComponent),
    },
    {
        path: 'order-edit/:id',
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
    {
        path: 'stock-master',
        loadComponent: () => import('./stock-master/stock-master.component').then(m => m.StockMasterComponent),
    },
    {
        path: 'dispatch-planning',
        loadComponent: () => import('./dispatch-planning/dispatch-planning.component').then(m => m.DispatchPlanningComponent),
    },
    {
        path: 'dispatch-list',
        loadComponent: () => import('./dispatch-list/dispatch-list.component').then(m => m.DispatchListComponent),
    },
    {
        path: 'customer-ledger',
        loadComponent: () => import('./customer-ledger/customer-ledger.component').then(m => m.CustomerLedgerComponent),
    },
    {
        path: 'vehicle-dispatch',
        loadComponent: () => import('./vehicle-dispatch/vehicle-dispatch.component').then(m => m.VehicleDispatchComponent),
    },
] as Routes;
