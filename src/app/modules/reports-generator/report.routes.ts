import { Route } from '@angular/router';
import { ReportViewerComponent } from './report-viewer/report-viewer.component';
import { BillCollectionComponent } from './bill-collection/bill-collection.component';
import { PurInvoiceReportComponent } from './pur-invoicereport/pur-invoice-report.component';
import { SaleInvoiceComponent } from './sale-invoice/sale-invoice.component';
import { CustomerRecoveryComponent } from './customer-recovery/customer-recovery.component';
import { ProductSaleReportComponent } from './product-sale-report/product-sale-report.component';
import { SalesmanRouteSaleReportComponent } from './salesman-route-sale-report/salesman-route-sale-report.component';
import { PurInvoiceReturnReportComponent } from './pur-invoice-return-report/pur-invoice-return-report.component';
import { CompanySaleComponent } from './company-sale/company-sale.component';
import { CustomerInvoiceComponent } from './customer-invoice/customer-invoice.component';

export default [
    {path:'sale-invoice' , component: SaleInvoiceComponent},
    {path:'bill-collection' , component: BillCollectionComponent},
    {path:'purchase-invoice' , component: PurInvoiceReportComponent},
    {path:'report' , component: ReportViewerComponent},
    {path:'customer-recovery' , component: CustomerRecoveryComponent},
    {path:'product-sale' , component: ProductSaleReportComponent},
    {path:'salesman-route-sale' , component: SalesmanRouteSaleReportComponent},
    {path:'purchase-return-invoice' , component:PurInvoiceReturnReportComponent},
    {path:'company-sale' , component: CompanySaleComponent},
    {path:'customer-invoice' , component: CustomerInvoiceComponent},
] as Route[];
