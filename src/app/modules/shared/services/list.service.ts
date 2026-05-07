import { inject, Injectable } from '@angular/core';
import { QueryService } from 'app/core/Base/services/query.service';

@Injectable({
    providedIn: 'root',
})
export class ListService {
    private _QueryService = inject(QueryService);

    getDepartment() {
        return this._QueryService.getQuery('getDepartment');
    }

    getDistributor() {
        return this._QueryService.getQuery('getDistributor');
    }

    getGroups() {
        return this._QueryService.getQuery('getGroups');
    }

    getUsers() {
        return this._QueryService.getQuery('getUsers');
    }

    getExpense(fromdate: any, todate: any) {
        return this._QueryService.getQuery('getExpense', {
            fromdate: fromdate || '',
            todate: todate || '',
        });
    }

    getExpenseCategory() {
        return this._QueryService.getQuery('getExpenseCategory');
    }

    getPaymentCategory() {
        return this._QueryService.getQuery('getPaymentCategory');
    }

    getCustomerInformation() {
        return this._QueryService.getQuery('getCustomerInformation');
    }

    getVendor() {
        return this._QueryService.getQuery('getVendor');
    }

    getVendorType() {
        return this._QueryService.getQuery('getVendorType');
    }

    getBankAccount() {
        return this._QueryService.getQuery('getBankAccount');
    }

    getBankAccountSummary(id: number) {
        return this._QueryService.getQuery('getBankAccountSummary', { id });
    }

    getBankAccountLedger(id: number, fromdate: string = '', todate: string = '') {
        return this._QueryService.getQuery('getBankAccountLedger', { id, fromdate, todate });
    }

    getLegalEntity() {
        return this._QueryService.getQuery('getLegalEntity');
    }

    getProduct() {
        return this._QueryService.getQuery('getProduct');
    }

    getPaymentReceived() {
        return this._QueryService.getQuery('getPaymentReceived');
    }

    getMakePayment() {
        return this._QueryService.getQuery('getMakePayment');
    }

    getPettyCash() {
        return this._QueryService.getQuery('getPettyCash');
    }

    getPettyCashSummary(id: number) {
        return this._QueryService.getQuery('getPettyCashSummary', { id });
    }

    getPettyCashExpenses(id: number, fromdate: string = '', todate: string = '') {
        return this._QueryService.getQuery('getPettyCashExpenses', { id, fromdate, todate });
    }

    getPettyCashFunding(id: number) {
        return this._QueryService.getQuery('getPettyCashFunding', { id });
    }

    getAdminDashboardSummary(fromdate: string = '', todate: string = '') {
        return this._QueryService.getQuery('getAdminDashboardSummary', { fromdate, todate });
    }

    getAdminBankBalances() {
        return this._QueryService.getQuery('getAdminBankBalances');
    }

    getAdminPettyCashStatus() {
        return this._QueryService.getQuery('getAdminPettyCashStatus');
    }

    getAdminExpenseByCategory(fromdate: string = '', todate: string = '') {
        return this._QueryService.getQuery('getAdminExpenseByCategory', { fromdate, todate });
    }

    getAdminMonthlyFlow() {
        return this._QueryService.getQuery('getAdminMonthlyFlow');
    }

    getAdminRecentTransactions() {
        return this._QueryService.getQuery('getAdminRecentTransactions');
    }

    getLedger(fromdate: any, todate: any, txtype: string = '', accountid: any = '') {
        return this._QueryService.getQuery('getLedger', {
            fromdate: fromdate || '',
            todate: todate || '',
            txtype: txtype || '',
            accountid: accountid || '',
        });
    }

    getAccountStatementReport(accountid: any, fromdate: any, todate: any) {
        return this._QueryService.getQuery('getAccountStatementReport', {
            accountid: accountid || '',
            fromdate: fromdate || '',
            todate: todate || '',
        });
    }

    getPettyCashReport(pettycashid: any, fromdate: any, todate: any) {
        return this._QueryService.getQuery('getPettyCashReport', {
            pettycashid: pettycashid || '',
            fromdate: fromdate || '',
            todate: todate || '',
        });
    }

    // Used by main module
    getCustomerOrders() {
        return this._QueryService.getQuery('getCustomerOrders');
    }

    getInvoices(fromdate: any, todate: any) {
        return this._QueryService.getQuery('getInvoices', {
            fromdate: fromdate || '',
            todate: todate || '',
        });
    }

    getCashInHand(fromdate: any, todate: any) {
        return this._QueryService.getQuery('getCashInHand', {
            fromdate: fromdate || '',
            todate: todate || '',
        });
    }

}
