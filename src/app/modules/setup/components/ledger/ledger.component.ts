import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { LocalStorageService } from 'app/core/auth/localStorage.service';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { DistributorFormComponent } from 'app/modules/setup/components/distributor/distributor-form.component';
import { BftInputDateComponent } from 'app/modules/shared/components/fields/bft-input-date/bft-input-date.component';
import { BftInputCurrencyComponent } from 'app/modules/shared/components/fields/bft-input-currency/bft-input-currency.component';
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { BftTextareaComponent } from 'app/modules/shared/components/fields/bft-textarea/bft-textarea.component';

@Component({
    selector: 'app-ledger',
    standalone: true,
    imports: [CommonModule, FormsModule, NzDatePickerModule, NzSelectModule, CurrencyPipe, DatePipe,
              BftInputDateComponent, BftInputCurrencyComponent, BftSelectComponent, BftTextareaComponent],
    templateUrl: './ledger.component.html',
    styleUrl: './ledger.component.scss',
})
export class LedgerComponent extends BaseRoutedComponent implements OnInit {
    private _http         = inject(HttpClient);
    private _localStorage = inject(LocalStorageService);
    private _drpService   = inject(DrpService);
    private _modal        = inject(ModalService);

    title = 'Distributor Ledger';

    // Distributor filter
    distributors: any[] = [];
    selectedDistributor: number | null = null;
    isDistributorUser = false;
    isLoadingCustomers = false;

    // Customer select
    allCustomers: any[] = [];
    selectedCustomer: number | null = null;

    get distributorCustomers(): any[] {
        if (!this.selectedDistributor) return [];
        return this.allCustomers.filter(c => Number(c.DistributorID) === this.selectedDistributor);
    }

    // Cash In / Cash Out modal
    bankAccounts: any[] = [];
    vendors: any[] = [];
    paymentTypes = [
        { ID: 'Bank Transfer',   Name: 'Bank Transfer' },
        { ID: 'Cheque',          Name: 'Cheque' },
        { ID: 'Online Transfer', Name: 'Online Transfer' },
    ];
    toTypes = [
        { ID: 'vendor',       Name: 'Vendor' },
        { ID: 'bank_account', Name: 'Bank Account' },
    ];
    cashModal: {
        show: boolean;
        type: 'Cash In' | 'Cash Out';
        editId: number | null;
        date: Date | null;
        amount: number | null;
        paymentType: string | null;
        accountId: number | null;
        vendorId: number | null;
        toBankId: number | null;
        toType: 'vendor' | 'bank_account' | null;
        fromCustomerId: number | null;
        notes: string;
    } = { show: false, type: 'Cash In', editId: null, date: null, amount: null, paymentType: null, accountId: null, vendorId: null, toBankId: null, toType: null, fromCustomerId: null, notes: '' };
    isSavingCash = false;
    isDeletingCash = false;

    dateRange: Date[] = [];
    isLoadingFinancial = false;
    isLoadingOrders    = false;
    orderError         = '';

    financialRows: any[] = [];
    orderItems:    any[] = [];
    selectedProducts: number[] = [];
    selectedStatuses: string[] = [];
    selectedTypes: string[] = [];

    get uniqueTypes(): string[] {
        return [...new Set(this.financialRows.map(r => r.Type).filter(Boolean))];
    }

    toggleType(t: string) {
        this.selectedTypes = this.selectedTypes.includes(t)
            ? this.selectedTypes.filter(x => x !== t)
            : [...this.selectedTypes, t];
    }

    selectedOrderID: number | null = null;

    // Invoice edit modal
    editingPtId: number | null = null;
    editItems: any[]   = [];
    isLoadingEdit      = false;
    isSavingEdit       = false;

    get bankAccountsNoCash(): any[] {
        return this.bankAccounts.filter(b => b.Type !== 'Cash');
    }

    get toBankAccountsFiltered(): any[] {
        return this.bankAccounts.filter(b => b.Type !== 'Cash' && b.ID !== this.cashModal.accountId);
    }

    get editTotal(): number {
        return this.editItems.reduce((s, i) => s + ((+i.Carton || 0) * (+i.Rate || 0)), 0);
    }

    get headers() {
        return new HttpHeaders({ uid: this._localStorage.uid, cid: this._localStorage.cid, eid: this._localStorage.eid });
    }

    get filteredFinancialRows(): any[] {
        let rows = this.financialRows;

        if (this.selectedStatuses.length) {
            const matchingIds = new Set(
                this.orderItems.filter(i => this.selectedStatuses.includes(i.Status)).map(i => i.OrderID)
            );
            rows = rows.filter(r =>
                r.Type === 'Payment' || r.Type === 'Opening Balance' || matchingIds.has(r.OrderID)
            );
        }

        if (this.selectedTypes.length) {
            rows = rows.filter(r => this.selectedTypes.includes(r.Type));
        }

        if (this.selectedProducts.length) {
            const matchingOrderIds = new Set(
                this.orderItems
                    .filter(i => this.selectedProducts.includes(i.ProductID))
                    .map(i => i.OrderID)
            );
            rows = rows.filter(r => r.Type !== 'Invoice' || matchingOrderIds.has(r.OrderID));
        }

        let balance = 0;
        return rows.map(r => {
            balance += (+r.Debit || 0) - (+r.Credit || 0);
            return { ...r, Balance: balance };
        });
    }

    get totalInvoiced(): number  { return this.filteredFinancialRows.reduce((s, r) => s + (+r.Debit  || 0), 0); }
    get totalReceived(): number  { return this.filteredFinancialRows.reduce((s, r) => s + (+r.Credit || 0), 0); }
    get closingBalance(): number { return this.totalInvoiced - this.totalReceived; }

    get uniqueProducts(): { id: number; name: string }[] {
        const map = new Map<number, string>();
        this.orderItems.forEach(i => map.set(i.ProductID, i.ProductName));
        return [...map.entries()].map(([id, name]) => ({ id, name }));
    }

    get uniqueStatuses(): string[] {
        return [...new Set(this.orderItems.map(i => i.Status).filter(Boolean))];
    }

    get allOrdersForDrp(): { id: number; label: string }[] {
        const map = new Map<number, string>();
        this.orderItems.forEach(i => {
            if (!map.has(i.OrderID)) map.set(i.OrderID, i.InvoiceNo || ('#' + i.OrderID));
        });
        return [...map.entries()].map(([id, label]) => ({ id, label }));
    }

    get groupedOrders(): any[] {
        const preFiltered = this.selectedOrderID
            ? this.orderItems.filter(i => i.OrderID === this.selectedOrderID)
            : this.orderItems;
        const filtered = this.selectedProducts.length
            ? preFiltered.filter(i => this.selectedProducts.includes(i.ProductID))
            : preFiltered;
        const map = new Map<number, any>();
        for (const item of filtered) {
            if (!map.has(item.OrderID)) {
                map.set(item.OrderID, {
                    OrderID: item.OrderID, InvoiceNo: item.InvoiceNo,
                    OrderDate: item.OrderDate, Status: item.Status,
                    items: [], total: 0, dispatched: 0,
                });
            }
            const order = map.get(item.OrderID);
            order.items.push(item);
            order.total      += +item.Cartons    || 0;
            order.dispatched += +item.Dispatched || 0;
        }
        let orders = [...map.values()];
        if (this.selectedStatuses.length) {
            orders = orders.filter(o => this.selectedStatuses.includes(o.Status));
        }
        return orders;
    }

    ngOnInit() {
        const now = new Date();
        this.dateRange = [new Date(now.getFullYear(), now.getMonth(), 1), now];
        this.isDistributorUser = this._localStorage.isDistributor === 'true';

        this._drpService.getDistributorDrp().subscribe({
            next: (res: any) => {
                this.distributors = res || [];
                if (this.isDistributorUser && this._localStorage.distributorId) {
                    this.selectedDistributor = +this._localStorage.distributorId;
                    this.loadAll();
                }
            },
        });
        this._drpService.getBankAccountDrp().subscribe({ next: (res: any) => { this.bankAccounts = res || []; } });
        this._drpService.getVendorDrp().subscribe({ next: (res: any) => { this.vendors = res || []; } });
        this._drpService.getCustomerInformationDrp().subscribe({ next: (res: any) => { this.allCustomers = res || []; } });

        if (!this.isDistributorUser) {
            this.loadAll();
        }
    }

    openCashModal(type: 'Cash In' | 'Cash Out') {
        this.cashModal = {
            show: true, type, editId: null,
            date: new Date(), amount: null,
            paymentType: null, accountId: null, vendorId: null, toBankId: null,
            toType: null,
            fromCustomerId: null,
            notes: '',
        };
    }

    onToTypeChange() {
        this.cashModal.vendorId  = null;
        this.cashModal.accountId = null;
        this.cashModal.toBankId  = null;
    }

    onRowClick(row: any) {
        if (row.Type === 'Cash In' || row.Type === 'Cash Out') {
            this.openCashEdit(row);
        } else if (row.Type === 'Invoice') {
            this.openInvoiceEdit(row);
        } else if (row.Type === 'Payment') {
            this.openPaymentEdit(row);
        }
        // Opening Balance: not editable inline
    }

    openCashEdit(row: any) {
        if (row.Type !== 'Cash In' && row.Type !== 'Cash Out') return;
        this._http.get<any>(
            `${apiUrls.server}${apiUrls.customerLedgerController}/distributor-cash/${row.ID}`,
            { headers: this.headers }
        ).subscribe({
            next: (res) => {
                this.cashModal = {
                    show: true,
                    type: res.CashType,
                    editId: res.ID,
                    date: res.Date ? new Date(res.Date) : new Date(),
                    amount: +res.Amount,
                    paymentType: res.PaymentType || null,
                    accountId: res.AccountID || null,
                    vendorId: res.VendorID || null,
                    toBankId: res.ToBankID || null,
                    toType: res.CashType === 'Cash Out' ? (res.VendorID ? 'vendor' : 'bank_account') : null,
                    fromCustomerId: res.CustomerID || null,
                    notes: res.Notes || '',
                };
            },
            error: () => { alert('Could not load entry for editing.'); },
        });
    }

    openPaymentEdit(row: any) {
        if (!row.ID) return;
        this._http.get<any>(
            `${apiUrls.server}${apiUrls.customerLedgerController}/distributor-cash/${row.ID}`,
            { headers: this.headers }
        ).subscribe({
            next: (res) => {
                this.cashModal = {
                    show: true,
                    type: res.CashType,
                    editId: res.ID,
                    date: res.Date ? new Date(res.Date) : new Date(),
                    amount: +res.Amount,
                    paymentType: res.PaymentType || null,
                    accountId: res.AccountID || null,
                    vendorId: res.VendorID || null,
                    toBankId: res.ToBankID || null,
                    toType: res.CashType === 'Cash Out' ? (res.VendorID ? 'vendor' : 'bank_account') : null,
                    fromCustomerId: res.CustomerID || null,
                    notes: res.Notes || '',
                };
            },
            error: () => { /* Payment entries from customer side are managed in Customer Ledger */ },
        });
    }

    deleteCash() {
        if (!this.cashModal.editId) return;
        this.isDeletingCash = true;
        this._http.delete(
            `${apiUrls.server}${apiUrls.customerLedgerController}/distributor-cash/${this.cashModal.editId}`,
            { headers: this.headers }
        ).subscribe({
            next: () => {
                this.isDeletingCash = false;
                this.cashModal.show = false;
                this.loadFinancial();
            },
            error: () => { this.isDeletingCash = false; },
        });
    }

    get selectedDistributorName(): string {
        return this.distributors.find(d => d.ID === this.selectedDistributor)?.Name || '';
    }

    saveCash() {
        if (!this.cashModal.amount || this.cashModal.amount <= 0) return;
        this.isSavingCash = true;
        const payload = {
            CashType: this.cashModal.type,
            DistributorID: this.selectedDistributor,
            Date: this.cashModal.date,
            Amount: this.cashModal.amount,
            PaymentType: this.cashModal.paymentType,
            Notes: this.cashModal.notes || null,
            AccountType: this.cashModal.accountId ? 'bank_account' : null,
            AccountID: this.cashModal.accountId || null,
            VendorID: this.cashModal.vendorId || null,
            ToBankID: this.cashModal.toBankId || null,
            FromCustomerID: this.cashModal.fromCustomerId || null,
        };
        const url = `${apiUrls.server}${apiUrls.customerLedgerController}/distributor-cash`;
        const req = this.cashModal.editId
            ? this._http.patch(`${url}/${this.cashModal.editId}`, payload, { headers: this.headers })
            : this._http.post(url, payload, { headers: this.headers });
        req.subscribe({
            next: () => {
                this.isSavingCash = false;
                this.cashModal.show = false;
                this.loadFinancial();
            },
            error: () => { this.isSavingCash = false; },
        });
    }

    onDistributorChange() {
        this.financialRows = [];
        this.orderItems = [];
        this.selectedProducts = [];
        this.selectedStatuses = [];
        this.loadAll();
    }

    openDistributor() {
        if (!this.selectedDistributor) return;
        this._modal.openModal({
            component: DistributorFormComponent,
            title: componentRegister.distributor?.Title || 'Distributor',
            ID: this.selectedDistributor,
        }).afterClose.subscribe((saved: boolean) => {
            if (!saved) return;
            this._drpService.getDistributorDrp().subscribe({ next: (res: any) => { this.distributors = res || []; } });
        });
    }

    onDateChange(dates: Date[]) {
        this.dateRange = dates || [];
        this.loadFinancial();
        this.loadOrders();
    }

    onOrderChange() { this.loadFinancial(); }

    loadAll() { this.loadFinancial(); this.loadOrders(); }

    loadFinancial() {
        this.isLoadingFinancial = true;
        const from = this.dateRange?.[0]?.toISOString() || '';
        const to   = this.dateRange?.[1]?.toISOString() || '';
        let url = `${apiUrls.server}${apiUrls.customerLedgerController}/all/financial?basePricing=true&`;
        if (from) url += `from=${encodeURIComponent(from)}&`;
        if (to)   url += `to=${encodeURIComponent(to)}&`;
        if (this.selectedDistributor) url += `distributorId=${this.selectedDistributor}&`;
        this._http.get<any[]>(url, { headers: this.headers }).subscribe({
            next: (res) => { this.financialRows = res || []; this.isLoadingFinancial = false; },
            error: () => { this.isLoadingFinancial = false; },
        });
    }

    loadOrders() {
        this.isLoadingOrders = true;
        this.orderError = '';
        const from = this.dateRange?.[0]?.toISOString() || '';
        const to   = this.dateRange?.[1]?.toISOString() || '';
        let url = `${apiUrls.server}${apiUrls.customerLedgerController}/all/orders?`;
        if (from) url += `from=${encodeURIComponent(from)}&`;
        if (to)   url += `to=${encodeURIComponent(to)}&`;
        if (this.selectedDistributor) url += `distributorId=${this.selectedDistributor}&`;
        this._http.get<any>(url, { headers: this.headers }).subscribe({
            next: (res: any) => {
                if (res?.__error) { this.orderError = res.__error; this.orderItems = []; }
                else { this.orderItems = res || []; }
                this.isLoadingOrders = false;
            },
            error: (err) => {
                this.orderError = err?.error?.message || err?.message || 'HTTP error';
                this.isLoadingOrders = false;
            },
        });
    }

    openInvoiceEdit(row: any) {
        if (row.Type !== 'Invoice' || !row.ID) return;
        this.editingPtId = row.ID;
        this.editItems = [];
        this.isLoadingEdit = true;
        this._http.get<any[]>(
            `${apiUrls.server}${apiUrls.customerLedgerController}/invoice/${row.ID}/items?base=true`,
            { headers: this.headers }
        ).subscribe({
            next: (res) => { this.editItems = res || []; this.isLoadingEdit = false; },
            error: () => { this.isLoadingEdit = false; },
        });
    }

    closeEdit() { this.editingPtId = null; this.editItems = []; }

    saveEdit() {
        this.isSavingEdit = true;
        this._http.patch(
            `${apiUrls.server}${apiUrls.customerLedgerController}/invoice/${this.editingPtId}/items?base=true`,
            { Items: this.editItems },
            { headers: this.headers }
        ).subscribe({
            next: () => { this.isSavingEdit = false; this.closeEdit(); this.loadAll(); },
            error: (err) => { this.isSavingEdit = false; alert('Save failed: ' + (err?.error?.message || err?.message || 'Unknown error')); },
        });
    }

    toggleProduct(id: number) {
        this.selectedProducts = this.selectedProducts.includes(id)
            ? this.selectedProducts.filter(p => p !== id)
            : [...this.selectedProducts, id];
    }

    toggleStatus(status: string) {
        this.selectedStatuses = this.selectedStatuses.includes(status)
            ? this.selectedStatuses.filter(s => s !== status)
            : [...this.selectedStatuses, status];
    }

    statusClass(status: string): string {
        switch (status) {
            case 'In Process':  return 'bg-blue-100 text-blue-700';
            case 'Submitted':   return 'bg-yellow-100 text-yellow-700';
            case 'Completed':   return 'bg-green-100 text-green-700';
            case 'Cancelled':   return 'bg-red-100 text-red-700';
            default:            return 'bg-gray-100 text-gray-600';
        }
    }
}
