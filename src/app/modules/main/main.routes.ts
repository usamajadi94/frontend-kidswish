import { Routes } from '@angular/router';
import { permissionGuard } from 'app/core/auth/guards/permission.guard';
import { componentRegister } from '../shared/services/component-register';

import { CustomerOrderListComponent } from './components/customer-order/customer-order-list/customer-order-list.component';
import { InvoiceListComponent } from './components/invoice/invoice-list/invoice-list.component';

export default [
    {
        path:'customer-order-list', component: CustomerOrderListComponent, data: { SCode: componentRegister.customerOrder.SCode },
        canActivate: [permissionGuard]
    },
    {
        path:'invoice-list', component: InvoiceListComponent, data: { SCode: componentRegister.invoice.SCode },
        canActivate: [permissionGuard]
    }
] as Routes;
