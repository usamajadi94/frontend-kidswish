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
    
    static readonly shipmentFetch = `${apiUrls.server}api/GetShipmentByClient`;
    static readonly shipmentUpdate = `${apiUrls.server}api/ShipmentByClient`;

    static readonly navigation = `${apiUrls.server}api/GetNavigation`;
    // Query service
    static readonly query = `${apiUrls.server}api/query`;

    // Setup Module Controllers
    static readonly supplierInformationController = `api/supplierinformation`;
    static readonly supplierItemsController = `api/supplieritems`;
    static readonly supplierOrderLedgerController = `api/supplierorderledger`;
    static readonly itemTypeController = `api/itemtype`;
    static readonly customerInformatonController = `api/customerniformation`;
    static readonly vehicleInformationController = `api/vehicleinformation`;
    static readonly expenseController = `api/expense`;
    static readonly employeeController = `api/employee`;
    static readonly payrollController = `api/payroll`;
    static readonly employeeAttendanceController = `api/empattendance`;
    static readonly productController = `api/product`;
    static readonly flavorOrder = `api/flavor/order`;
    static readonly flavorOrderStatus = `${apiUrls.server}api/flavor/order/status`;
    static readonly expenseDrController = `api/expensedr`;

    static readonly expenseCategoryController = `api/expensecategory`;
    // DMS
    static readonly invoiceController = `api/invoicemaster`;
    static readonly flavorStockController = `api/flavorstock`;
    
    // Security
    static readonly rbacGroupsController = `api/group`;
    static readonly moduleGetController = `api/group/getmodulesections`;
    static readonly userController = `api/user`;
    
    // Main
    static readonly customerOrderController = `api/customerorder`;
    
    // Factory
    static readonly productionOrder = `${apiUrls.server}api/factoryproduction`;
    static readonly shipmentController = `api/shipment`;
    
    static readonly supplierOrderController = `api/supplierorder`;
}
