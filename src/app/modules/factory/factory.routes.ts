import { Routes } from '@angular/router';
import { permissionGuard } from 'app/core/auth/guards/permission.guard';
import { componentRegister } from '../shared/services/component-register';
import { OrderViewComponent } from './components/order-view/order-view.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export default [
    {
        path: 'pipeline-orders',
        component: OrderViewComponent,
        data: { SCode: componentRegister.pipelineOrders.SCode },
        canActivate: [permissionGuard],
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        data: { SCode: componentRegister.dashboard.SCode },
        canActivate: [permissionGuard],
    },
] as Routes;
