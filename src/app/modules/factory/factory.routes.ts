import { Routes } from '@angular/router';
import { permissionGuard } from 'app/core/auth/guards/permission.guard';
import { componentRegister } from '../shared/services/component-register';
import { OrderViewComponent } from './order-view/order-view.component';

export default [
    {
        path: 'pipeline-orders',
        component: OrderViewComponent,
        data: { SCode: componentRegister.pipelineOrders.SCode },
        canActivate: [permissionGuard],
    },
] as Routes;
