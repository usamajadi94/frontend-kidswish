import { Routes } from '@angular/router';
import { ExpenseListComponent } from './components/expense/expense-list/expense-list.component';
import { ExpenseCategoryListComponent } from './components/expense-category/expense-category-list/expense-category-list.component';
import { DepartmentListComponent } from './components/department/department-list/department-list.component';
import { DistributorListComponent } from './components/distributor/distributor-list/distributor-list.component';
import { CustomerListComponent } from './components/customer/customer-list/customer-list.component';
import { VendorListComponent } from './components/vendor/vendor-list/vendor-list.component';
import { VendorTypeListComponent } from './components/vendor-type/vendor-type-list/vendor-type-list.component';
import { BankAccountListComponent } from './components/bank-account/bank-account-list/bank-account-list.component';
import { LegalEntityListComponent } from './components/legal-entity/legal-entity-list/legal-entity-list.component';
import { PaymentReceivedListComponent } from './components/payment-received/payment-received-list/payment-received-list.component';
import { MakePaymentListComponent } from './components/make-payment/make-payment-list/make-payment-list.component';
import { LedgerComponent } from './components/ledger/ledger.component';
import { CustomerLedgerComponent } from './components/customer-ledger/customer-ledger.component';
import { PettyCashListComponent } from './components/petty-cash/petty-cash-list/petty-cash-list.component';
import { PettyCashDetailComponent } from './components/petty-cash/petty-cash-detail/petty-cash-detail.component';
import { BankAccountDetailComponent } from './components/bank-account/bank-account-detail/bank-account-detail.component';
import { permissionGuard } from 'app/core/auth/guards/permission.guard';
import { componentRegister } from '../shared/services/component-register';

export default [
    {
        path: 'distributor-list',
        component: DistributorListComponent,
        data: { SCode: componentRegister.distributor.SCode },
        canActivate: [permissionGuard],
    },
    {
        path: 'department-list',
        component: DepartmentListComponent,
        data: { SCode: componentRegister.department.SCode },
        canActivate: [permissionGuard],
    },
    {
        path: 'expense-list',
        component: ExpenseListComponent,
        data: { SCode: componentRegister.expense.SCode },
        canActivate: [permissionGuard],
    },
    {
        path: 'expense-category-list',
        component: ExpenseCategoryListComponent,
        data: { SCode: componentRegister.expenseCategory.SCode },
        canActivate: [permissionGuard],
    },
    {
        path: 'customer-list',
        component: CustomerListComponent,
        data: { SCode: componentRegister.customer.SCode },
        canActivate: [permissionGuard],
    },
    {
        path: 'vendor-list',
        component: VendorListComponent,
        data: { SCode: componentRegister.vendor.SCode },
        canActivate: [permissionGuard],
    },
    {
        path: 'vendor-type-list',
        component: VendorTypeListComponent,
        data: { SCode: componentRegister.vendorType.SCode },
        canActivate: [permissionGuard],
    },
    {
        path: 'bank-account-list',
        component: BankAccountListComponent,
        data: { SCode: componentRegister.bankAccount.SCode },
        canActivate: [permissionGuard],
    },
    {
        path: 'bank-account-detail/:id',
        component: BankAccountDetailComponent,
        data: { SCode: componentRegister.bankAccount.SCode },
        canActivate: [permissionGuard],
    },
    {
        path: 'legal-entity-list',
        component: LegalEntityListComponent,
        data: { SCode: componentRegister.legalEntity.SCode },
        canActivate: [permissionGuard],
    },
    {
        path: 'payment-received-list',
        component: PaymentReceivedListComponent,
        data: { SCode: componentRegister.paymentReceived.SCode },
        canActivate: [permissionGuard],
    },
    {
        path: 'make-payment-list',
        component: MakePaymentListComponent,
        data: { SCode: componentRegister.makePayment.SCode },
        canActivate: [permissionGuard],
    },
    {
        path: 'ledger',
        component: LedgerComponent,
        data: { SCode: componentRegister.ledger.SCode },
        canActivate: [permissionGuard],
    },
    {
        path: 'customer-ledger',
        component: CustomerLedgerComponent,
        data: { SCode: componentRegister.customerLedger.SCode },
        canActivate: [permissionGuard],
    },
    {
        path: 'petty-cash-list',
        component: PettyCashListComponent,
        data: { SCode: componentRegister.pettyCash.SCode },
        canActivate: [permissionGuard],
    },
    {
        path: 'petty-cash-detail/:id',
        component: PettyCashDetailComponent,
        data: { SCode: componentRegister.pettyCash.SCode },
        canActivate: [permissionGuard],
    },
] as Routes;
