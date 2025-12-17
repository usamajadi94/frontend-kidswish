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

    getSupplierInformation() {
        return this._QueryService.getQuery('getSupplierInformation');
    }

    getVehicleInformation() {
        return this._QueryService.getQuery('getVehicleInformation');
    }

    getCustomerInformation() {
        return this._QueryService.getQuery('getCustomerInformation');
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
    getEmployee(active:string = "") {
        return this._QueryService.getQuery('getEmployee',{
            active:active
        });
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
    
    getInvoices(fromdate: any, todate: any) {
        return this._QueryService.getQuery('getInvoices',{
            fromdate: fromdate || '',
            todate: todate || '', 
        });
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

    getEmployeeAttendance(month:Date) {
        return this._QueryService.getQuery('getEmployeeAttendance',{
            month:month
        });
    }
    
    getEmployeeAbsentSummary(salarytypeid:number,fromdate:Date = new Date(),todate:Date = new Date() ){
        return this._QueryService.getQuery('getEmployeeAbsentSummary',{
            salarytypeid:salarytypeid,
            fromdate:fromdate,
            todate:todate
        });

    }

    getPipeLineOrder(month: Date | null) {
        return this._QueryService.getQuery('getPipeLineOrder', {
            month: month || '',
        });
    }

        getProductionDetail(month: Date | null) {
        return this._QueryService.getQuery('getProductionInformation', {
            month: month || '',
        });
    }

    getShipmentDetail(month: Date | null) {
        return this._QueryService.getQuery('GetShipmentInformation', {
            month: month || '',
        });
    }
  
    getSupplierItems() {
        return this._QueryService.getQuery('getSupplierItems');
    }

    getSupplierOrders() {
        return this._QueryService.getQuery('getSupplierOrders');
    }

    getShipments(month: Date | null) {
        return this._QueryService.getQuery('getShipments', {
            month: month || '',
        });
    }
}
