import { Route } from '@angular/router';
import { ReportViewerComponent } from './report-viewer/report-viewer.component';
import { SaleInvoiceComponent } from './sale-invoice/sale-invoice.component';

export default [
    {path:'sale-invoice' , component: SaleInvoiceComponent},
    {path:'report' , component: ReportViewerComponent},
] as Route[];
