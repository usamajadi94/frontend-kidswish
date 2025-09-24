import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class apiUrls {
    static server = environment.apiRoot;

    // Login
    static readonly me = `${apiUrls.server}api/me`;
    static readonly changePassword = `${apiUrls.server}api/me/changepassword`;
    static readonly login = `${apiUrls.server}api/login`;
    static readonly entity = `${apiUrls.server}api/GetUserEntities`;
    static readonly settings = `${apiUrls.server}api/me/settings`;
    static readonly companyFetch = `${apiUrls.server}api/GetCompanyByClient`;

    static readonly navigation = `${apiUrls.server}api/GetNavigation`;
    // Query service
    static readonly query = `${apiUrls.server}api/query`;

    // Setup Module Controllers
    static readonly companyInformationController = `api/companyinformation`;
    static readonly supplierInformationController = `api/supplierinformation`;
    static readonly itemTypeController = `api/itemtype`;
    static readonly itemProfileController = `api/itemprofile`;
    static readonly cityInformatonController = `api/cityinformation`;
    static readonly areaInformatonController = `api/areainformation`;
    static readonly routeInformatonController = `api/routeinformation`;
    static readonly customerInformatonController = `api/customerniformation`;
    static readonly memberTypeInformatonController = `api/membertypeinformation`;
    static readonly orderBookerInformatonController = `api/orderbookerinformation`;
    static readonly salesmanInformationController = `api/salesmaninformation`;
    static readonly vehicleInformationController = `api/vehicleinformation`;
    static readonly expenseController = `api/expense`;
    static readonly employeeController = `api/employee`;
    static readonly productController = `api/product`;
    static readonly flavorOrder = `api/flavor/order`;
    static readonly flavorOrderStatus = `${apiUrls.server}api/flavor/order/status`;
    static readonly expenseDrController = `api/expensedr`;

    static readonly expenseCategoryController = `api/expensecategory`;
    // DMS
    static readonly purchaseInvoiceController = `api/purchaseinvoice`;
    static readonly purchaseInvoiceGetController = `api/purchaseinvoice/getpurchasebyinvoicenumber?InvoiceNo=`;
    static readonly purchaseReturnInvoiceController = `api/returnpurchaseinvoice`;
    static readonly itemProfilePriceHistory = `api/itemprofilehistory`;
    static readonly openingStockController = `api/openingstock`;
    static readonly orderController = `api/order`;
    static readonly saleInvoiceController = `api/saleinvoice`;
    static readonly billCollectionController = `api/billcollection`;
    static readonly saleInvoiceReturnController = `api/returnsaleinvoice`;
    static readonly orderGetController = `api/order/getorderbyordernumber?OrderNo=`;
    static readonly saleInvoiceGetController = `api/saleinvoice/getinvoicebyinvoicenumber?InvoiceNo=`;
    static readonly invoiceController = `api/invoicemaster`;
    static readonly flavorStockController = `api/flavorstock`;
    
    // Security
    static readonly rbacGroupsController = `api/group`;
    static readonly moduleGetController = `api/group/getmodulesections`;
    static readonly userController = `api/user`;
    
    // Main
    static readonly customerOrderController = `api/customerorder`;
}
