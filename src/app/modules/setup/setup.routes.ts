import { Routes } from '@angular/router';
import { CustomerManagementListComponent } from './components/customer-management/customer-management-list/customer-management-list.component';
import { EmployeeManagementListComponent } from './components/employee-mangement/employee-management-list/employee-management-list.component';
import { ExpenseListComponent } from './components/expense/expense-list/expense-list.component';
import { ItemTypeListComponent } from './components/item-type/item-type-list/item-type-list.component';
import { SuppliersListComponent } from './components/suppliers/suppliers-list/suppliers-list.component';
import { PackagingStockListComponent } from './components/packaging-stock/packaging-stock-list/packaging-stock-list.component';
import { VehicleInformationListComponent } from './components/vehicle-information/vehicle-information-list/vehicle-information-list.component';
import { permissionGuard } from 'app/core/auth/guards/permission.guard';
import { componentRegister } from '../shared/services/component-register';
import { ProductsListComponent } from './components/products/products-list/products-list.component';
import { ExpenseCategoryListComponent } from './components/expense-category/expense-category-list/expense-category-list.component';
import { ExpenseDrListComponent } from './components/expense-dr/expense-dr-list/expense-dr-list.component';
import { FlavorStockListComponent } from './components/flavor-stock/flavor-stock-list/flavor-stock-list.component';
import { PayrollListComponent } from './components/payroll-management/payroll-list/payroll-list.component';
import { EmployeeAttendanceListComponent } from './components/employee-attendance/employee-attendance-list/employee-attendance-list.component';

export default [
    {
        path: 'item-type-list', component: ItemTypeListComponent, data: { SCode: componentRegister.itemType.SCode },
        canActivate: [permissionGuard]
    },
    // {
    //     path: 'customer-list', component: CustomerInformationListComponent, data: { SCode: componentRegister.customer.SCode },
    //     canActivate: [permissionGuard]
    // },
    {
        path: 'vehicle-list', component: VehicleInformationListComponent, data: { SCode: componentRegister.vehicle.SCode },
        canActivate: [permissionGuard],
    },
    {
        path: 'employee-management-list',
        component: EmployeeManagementListComponent,
        data: { SCode: 'set_13' },
        canActivate: [permissionGuard],
    },
    {
        path: 'expense-list',
        component: ExpenseListComponent,
        data: { SCode: componentRegister.expense.SCode },
        canActivate: [permissionGuard],
    },
    {
        path: 'customer-management-list',
        component: CustomerManagementListComponent,
        data: { SCode: componentRegister.customer.SCode },
        canActivate: [permissionGuard],
    },

    {
        path: 'supplier-management-list',
        component: SuppliersListComponent,
        data: { SCode: componentRegister.supplier.SCode },
        canActivate: [permissionGuard],
    },
        
    {
        path:'packaging-stock-list', component: PackagingStockListComponent, data: { SCode: "set_17" },
      
    },
    {
          path:'product-list', component: ProductsListComponent, data: { SCode: "set_16" },
        canActivate: [permissionGuard]
    },
    {
          path:'expense-category-list', component:ExpenseCategoryListComponent, data: { SCode: componentRegister.expenseCategory.SCode },
        canActivate: [permissionGuard]
    },
    {
        path:'expense-dr-list', component:ExpenseDrListComponent, data: { SCode: componentRegister.expenseDr.SCode },
        canActivate: [permissionGuard]
    },
    {
        path:'flavor-stock-list', component:FlavorStockListComponent, data: { SCode: componentRegister.flavorStock.SCode },
        canActivate: [permissionGuard]
    },
    {
        path:'emp-payroll-list', component:PayrollListComponent, data: { SCode: componentRegister.payroll.SCode },
        canActivate: [permissionGuard]
    },
    {
        path:'emp-attendance', component:EmployeeAttendanceListComponent, data: { SCode: componentRegister.employeeAttendance.SCode },
        canActivate: [permissionGuard]
    }
] as Routes;
