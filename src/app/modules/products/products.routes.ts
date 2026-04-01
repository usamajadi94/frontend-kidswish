import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product/product-list/product-list.component';
import { permissionGuard } from 'app/core/auth/guards/permission.guard';
import { componentRegister } from '../shared/services/component-register';

export default [
    {
        path: 'product-list',
        component: ProductListComponent,
        data: { SCode: componentRegister.product.SCode },
        canActivate: [permissionGuard],
    },
] as Routes;
