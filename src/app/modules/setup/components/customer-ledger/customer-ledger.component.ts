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
import { componentRegister } from 'app/modules/shared/services/component-register';

@Component({
    selector: 'app-customer-ledger',
    standalone: true,
    imports: [CommonModule, FormsModule, NzDatePickerModule, NzSelectModule, CurrencyPipe, DatePipe],
    templateUrl: './customer-ledger.component.html',
    styleUrl: './customer-ledger.component.scss',
})
export class CustomerLedgerComponent extends BaseRoutedComponent implements OnInit {
    private _http         = inject(HttpClient);
    private _localStorage = inject(LocalStorageService);
    private _drpService   = inject(DrpService);

    title = componentRegister.customerLedger.Title;

    customers: any[] = [];
    selectedCustomer: any = null;
    dateRange: Date[] = [];
    isLoadingFinancial = false;
    isLoadingOrders    = false;
    orderError         = '';

    financialRows: any[] = [];
    orderItems: any[]    = [];
    selectedProducts: number[] = [];
    selectedStatuses: string[] = [];
    selectedOrderID: number | null = null;

    get headers() {
        return new HttpHeaders({
            uid: this._localStorage.uid,
            cid: this._localStorage.cid,
            eid: this._localStorage.eid,
        });
    }

    // ── Summary ──────────────────────────────────────────────────────────────
    get totalInvoiced(): number  { return this.financialRows.reduce((s, r) => s + (+r.Debit   || 0), 0); }
    get totalReceived(): number  { return this.financialRows.reduce((s, r) => s + (+r.Credit  || 0), 0); }
    get closingBalance(): number { return this.totalInvoiced - this.totalReceived; }

    // ── Order ledger helpers ──────────────────────────────────────────────────
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
                    OrderID:   item.OrderID,
                    InvoiceNo: item.InvoiceNo,
                    OrderDate: item.OrderDate,
                    Status:    item.Status,
                    items:     [],
                    total:     0,
                });
            }
            const order = map.get(item.OrderID);
            order.items.push(item);
            order.total += +item.Cartons || 0;
        }
        let orders = [...map.values()];
        if (this.selectedStatuses.length) {
            orders = orders.filter(o => this.selectedStatuses.includes(o.Status));
        }
        return orders;
    }

    ngOnInit() {
        this._drpService.getCustomerInformationDrp().subscribe({ next: (res: any) => { this.customers = res || []; } });
    }

    onCustomerChange() {
        this.selectedProducts = [];
        this.selectedStatuses = [];
        this.selectedOrderID = null;
        this.loadAll();
    }

    onDateChange(dates: Date[]) {
        this.dateRange = dates || [];
        this.loadFinancial();
    }

    loadAll() {
        if (!this.selectedCustomer) { this.financialRows = []; this.orderItems = []; return; }
        this.loadFinancial();
        this.loadOrders();
    }

    onOrderChange() {
        this.loadFinancial();
    }

    loadFinancial() {
        if (!this.selectedCustomer) return;
        this.isLoadingFinancial = true;
        const from = this.dateRange?.[0]?.toISOString() || '';
        const to   = this.dateRange?.[1]?.toISOString() || '';
        let url = `${apiUrls.server}${apiUrls.customerLedgerController}/${this.selectedCustomer}/financial?`;
        if (from) url += `from=${encodeURIComponent(from)}&`;
        if (to)   url += `to=${encodeURIComponent(to)}&`;
        if (this.selectedOrderID) url += `orderId=${this.selectedOrderID}&`;
        this._http.get<any[]>(url, { headers: this.headers }).subscribe({
            next: (res) => { this.financialRows = res || []; this.isLoadingFinancial = false; },
            error: () => { this.isLoadingFinancial = false; },
        });
    }

    loadOrders() {
        if (!this.selectedCustomer) return;
        this.isLoadingOrders = true;
        this.orderError = '';
        this._http.get<any>(
            `${apiUrls.server}${apiUrls.customerLedgerController}/${this.selectedCustomer}/orders`,
            { headers: this.headers }
        ).subscribe({
            next: (res: any) => {
                if (res?.__error) {
                    this.orderError = res.__error;
                    this.orderItems = [];
                } else {
                    this.orderItems = res || [];
                }
                this.isLoadingOrders = false;
            },
            error: (err) => {
                this.orderError = err?.error?.message || err?.message || 'HTTP error';
                this.isLoadingOrders = false;
            },
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
