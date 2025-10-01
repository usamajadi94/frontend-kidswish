import { Routes } from '@angular/router';
import { AreaInformationListComponent } from './components/area-information/area-information-list/area-information-list.component';
import { CityInformationListComponent } from './components/city-information/city-information-list/city-information-list.component';
import { CompanyInformationListComponent } from './components/company-information/company-information-list/company-information-list.component';
import { CustomerInformationListComponent } from './components/customer-information/customer-information-list/customer-information-list.component';
import { CustomerManagementListComponent } from './components/customer-management/customer-management-list/customer-management-list.component';
import { EmployeeManagementListComponent } from './components/employee-mangement/employee-management-list/employee-management-list.component';
import { ExpenseListComponent } from './components/expense/expense-list/expense-list.component';
import { ItemProfileListComponent } from './components/item-profile/item-profile-list/item-profile-list.component';
import { ItemTypeListComponent } from './components/item-type/item-type-list/item-type-list.component';
import { MemberTypeInformationListComponent } from './components/member-type-information/member-type-information-list/member-type-information-list.component';
import { OrderBookerInformationListComponent } from './components/order-booker-information/order-booker-information-list/order-booker-information-list.component';
import { RouteInformationListComponent } from './components/route-information/route-information-list/route-information-list.component';
import { SalesmanInformationListComponent } from './components/salesman-information/salesman-information-list/salesman-information-list.component';
import { SupplierInformationListComponent } from './components/supplier-information/supplier-information-list/supplier-information-list.component';
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

export default [
    {
        path: 'company-list', component: CompanyInformationListComponent, data: { SCode: componentRegister.company.SCode },
        canActivate: [permissionGuard]
    },
    // {
    //     path: 'supplier-list', component: SupplierInformationListComponent, data: { SCode: componentRegister.supplier.SCode },
    //     canActivate: [permissionGuard]
    // },
    {
        path: 'item-type-list', component: ItemTypeListComponent, data: { SCode: componentRegister.itemType.SCode },
        canActivate: [permissionGuard]
    },
    {
        path: 'item-profile-list', component: ItemProfileListComponent, data: { SCode: componentRegister.itemProfile.SCode },
        canActivate: [permissionGuard]
    },
    {
        path: 'city-list', component: CityInformationListComponent, data: { SCode: componentRegister.city.SCode },
        canActivate: [permissionGuard]
    },
    {
        path: 'area-list', component: AreaInformationListComponent, data: { SCode: componentRegister.area.SCode },
        canActivate: [permissionGuard]
    },
    {
        path: 'route-list', component: RouteInformationListComponent, data: { SCode: componentRegister.route.SCode },
        canActivate: [permissionGuard]
    },
    // {
    //     path: 'customer-list', component: CustomerInformationListComponent, data: { SCode: componentRegister.customer.SCode },
    //     canActivate: [permissionGuard]
    // },
    {
        path: 'member-type-list', component: MemberTypeInformationListComponent, data: { SCode: componentRegister.memberType.SCode },
        canActivate: [permissionGuard]
    },
    {
        path: 'order-booker-list', component: OrderBookerInformationListComponent, data: { SCode: componentRegister.orderBooker.SCode },
        canActivate: [permissionGuard]
    },
    {
        path: 'salesman-list', component: SalesmanInformationListComponent, data: { SCode: componentRegister.salesman.SCode },
        canActivate: [permissionGuard]
    },
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
    }
] as Routes;
