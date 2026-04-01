import { Route } from '@angular/router';
import { ReportViewerComponent } from './report-viewer/report-viewer.component';
import { SaleInvoiceComponent } from './sale-invoice/sale-invoice.component';
import { ExpenseByVendorComponent } from './expense-by-vendor/expense-by-vendor.component';
import { PaymentReceivedReportComponent } from './payment-received-report/payment-received-report.component';
import { PaymentMadeReportComponent } from './payment-made-report/payment-made-report.component';
import { AccountStatementComponent } from './account-statement/account-statement.component';
import { PettyCashReportComponent } from './petty-cash-report/petty-cash-report.component';
import { componentRegister } from '../shared/services/component-register';
import { permissionGuard } from 'app/core/auth/guards/permission.guard';

export default [
    {
        path: 'sale-invoice',
        component: SaleInvoiceComponent,
        data: { SCode: componentRegister.saleInvoiceReport.SCode },
        canActivate: [permissionGuard]
    },
    { path: 'report', component: ReportViewerComponent },
    { path: 'expense-by-vendor', component: ExpenseByVendorComponent },
    { path: 'payment-received', component: PaymentReceivedReportComponent },
    { path: 'payment-made', component: PaymentMadeReportComponent },
    { path: 'account-statement', component: AccountStatementComponent },
    { path: 'petty-cash-report', component: PettyCashReportComponent },
] as Route[];
