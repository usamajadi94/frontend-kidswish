import { inject, Injectable } from '@angular/core';
import { QueryService } from 'app/core/Base/services/query.service';

@Injectable({
    providedIn: 'root',
})
export class ListService {
    private _QueryService = inject(QueryService);

    getItemType() {
        return this._QueryService.getQuery('getItemType');
    }
    getCityInformation() {
        return this._QueryService.getQuery('getCityInformation');
    }
    getAreaInformation() {
        return this._QueryService.getQuery('getAreaInformation');
    }
    getRouteInformation() {
        return this._QueryService.getQuery('GetRouteInformation');
    }

    getCompanyInformation() {
        return this._QueryService.getQuery('getCompanyInformation');
    }
    getSupplierInformation() {
        return this._QueryService.getQuery('getSupplierInformation');
    }

    getItemProfile() {
        return this._QueryService.getQuery('getItemProfile');
    }

    getPurchaseInvoice() {
        return this._QueryService.getQuery('getPurchaseInvoiceInformation');
    }
    getPurchaseInvoiceReturn() {
        return this._QueryService.getQuery('getRetPurchaseInvoiceInformation');
    }

    getMemberTypeInformation() {
        return this._QueryService.getQuery('getMemberTypeInformation');
    }

    getOrderBookerInformation() {
        return this._QueryService.getQuery('getOrderBookerInformation');
    }

    getSalesmanInformation() {
        return this._QueryService.getQuery('getSalesmanInformation');
    }

    getVehicleInformation() {
        return this._QueryService.getQuery('getVehicleInformation');
    }

    getCustomerInformation() {
        return this._QueryService.getQuery('getCustomerInformation');
    }
    getOpeningStock() {
        return this._QueryService.getQuery('getOpeningStock');
    }

    getOrders() {
        return this._QueryService.getQuery('getOrders');
    }
    getSaleInovices() {
        return this._QueryService.getQuery('getSaleInovices');
    }
    getSaleInovicesRet() {
        return this._QueryService.getQuery('getSaleInovicesRet');
    }

    getGroups() {
        return this._QueryService.getQuery('getGroups');
    }

    getUsers() {
        return this._QueryService.getQuery('getUsers');
    }

    getExpense(fromdate: any, todate: any) {
        return this._QueryService.getQuery('getExpense',{
            fromdate: fromdate || '',
            todate: todate || '',
        });
    }
    getEmployee() {
        return this._QueryService.getQuery('getEmployee');
    }
    getProduct() {
        return this._QueryService.getQuery('getProducts');
    }
    getProductWithFlavor() {
        return this._QueryService.getQuery('getProductsWithFlavor');
    }
    getFlavorOrder(fromDate: Date, endDate: Date, SupplierID:string , StatusID: string) {
        return this._QueryService.getQuery('getFlavorOrder',{
        fromdate: fromDate || '',
        enddate: endDate || '',
        supplierid: SupplierID || '',
        statusid: StatusID || ''
    });
    }
    
    getCustomerOrders() {
        return this._QueryService.getQuery('getCustomerOrders');
    }
    getExpenseCategory() {
        return this._QueryService.getQuery('getExpenseCategory');
    }
    
    getInvoices() {
        return this._QueryService.getQuery('getInvoices');
    }

    getExpenseDR(fromdate: any, todate: any) {
        return this._QueryService.getQuery('getExpenseDR',{
            fromdate: fromdate || '',
            todate: todate || '',
        });
    }

    getFlavorStock() {
        return this._QueryService.getQuery('getFlavorStock');
    }

    getEmployeePayRoll(month: Date | null) {
        return this._QueryService.getQuery('getEmployeePayRoll', {
            month: month || '',
        });
    }
}
