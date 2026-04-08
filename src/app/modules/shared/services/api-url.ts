import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class apiUrls {
    static server = environment.apiRoot;

    // Login
    static readonly me = `${apiUrls.server}api/me`;
    static readonly changePassword = `${apiUrls.server}api/me/changepassword`;
    // API contract requires capitalized Login and token refresh
    static readonly login = `${apiUrls.server}api/Login`;
    static readonly signup = `${apiUrls.server}api/signup`;
    static readonly tokenRefresh = `${apiUrls.server}api/token/refresh`;
    static readonly entity = `${apiUrls.server}api/GetUserEntities`;
    static readonly settings = `${apiUrls.server}api/me/settings`;
    static readonly companyFetch = `${apiUrls.server}api/GetCompanyByClient`;
    
static readonly navigation = `${apiUrls.server}api/GetNavigation`;
    // Query service
    static readonly query = `${apiUrls.server}api/query`;

    // Setup Module Controllers
    static readonly departmentController = `api/department`;
    static readonly customerController = `api/customer`;
    static readonly vendorController = `api/vendor`;
    static readonly vendorTypeController = `api/vendortype`;
    static readonly bankAccountController = `api/bankaccount`;
    static readonly paymentTransactionController = `api/paymenttransaction`;
    static readonly legalEntityController = `api/legalentity`;
    static readonly productController = `api/product`;
    static readonly distributorController = `api/distributor`;
    static readonly expenseController = `api/expense`;
    static readonly expenseCategoryController = `api/expensecategory`;
    static readonly pettyCashController = `api/pettycash`;
    // DMS
    static readonly invoiceController = `api/invoicemaster`;

    // Security
    static readonly rbacGroupsController = `api/group`;
    static readonly moduleGetController = `api/group/getmodulesections`;
    static readonly userController = `api/user`;
    
    // Main
    static readonly customerOrderController = `api/customerorder`;
    static readonly distributorOrderController = `api/distributor-order`;
    static readonly stockMasterController = `api/stock-master`;
    static readonly dispatchController = `api/dispatch`;
    static readonly clientManagementController = `api/client-management`;

}
