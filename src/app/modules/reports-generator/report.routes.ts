import { Route } from '@angular/router';
import { ReportViewerComponent } from './report-viewer/report-viewer.component';
import { SaleInvoiceComponent } from './sale-invoice/sale-invoice.component';
import { componentRegister } from '../shared/services/component-register';
import { permissionGuard } from 'app/core/auth/guards/permission.guard';

export default [
    {
        path:'sale-invoice' , 
        component: SaleInvoiceComponent,
        data: { SCode: componentRegister.saleInvoiceReport.SCode },
        canActivate: [permissionGuard]
    },
    {path:'report' , component: ReportViewerComponent},
] as Route[];
