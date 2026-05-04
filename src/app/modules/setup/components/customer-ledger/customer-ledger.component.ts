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
    private _http        = inject(HttpClient);
    private _localStorage = inject(LocalStorageService);
    private _drpService  = inject(DrpService);

    title = componentRegister.customerLedger.Title;

    customers: any[] = [];
    selectedCustomer: any = null;
    dateRange: Date[] = [];
    rows: any[] = [];
    isLoading = false;

    get authHeaders() {
        return new HttpHeaders({
            uid: this._localStorage.uid,
            cid: this._localStorage.cid,
            eid: this._localStorage.eid,
        });
    }

    get totalInvoiced(): number  { return this.rows.reduce((s, r) => s + (+r.Invoiced  || 0), 0); }
    get totalReceived(): number  { return this.rows.reduce((s, r) => s + (+r.Received  || 0), 0); }
    get closingBalance(): number { return this.totalInvoiced - this.totalReceived; }

    ngOnInit() {
        this._drpService.getCustomerInformationDrp().subscribe({ next: (res: any) => { this.customers = res || []; } });
        this.load();
    }

    load() {
        this.isLoading = true;
        const from = this.dateRange?.[0]?.toISOString() || '';
        const to   = this.dateRange?.[1]?.toISOString() || '';

        let url = `${apiUrls.server}${apiUrls.receivableController}/ledger?`;
        if (this.selectedCustomer) url += `customerId=${this.selectedCustomer}&`;
        if (from) url += `from=${encodeURIComponent(from)}&`;
        if (to)   url += `to=${encodeURIComponent(to)}&`;

        this._http.get<any[]>(url, { headers: this.authHeaders }).subscribe({
            next: (res) => {
                let balance = 0;
                this.rows = (res || []).map(r => {
                    const inv = r.Type === 'Receivable' ? (+r.Amount || 0) : 0;
                    const pay = r.Type === 'Payment'    ? (+r.Amount || 0) : 0;
                    balance += inv - pay;
                    return { ...r, Invoiced: inv, Received: pay, Balance: balance };
                });
                this.isLoading = false;
            },
            error: () => { this.isLoading = false; },
        });
    }

    onCustomerChange() { this.load(); }
    onDateChange(dates: Date[]) { this.dateRange = dates || []; this.load(); }

    clearFilters() {
        this.selectedCustomer = null;
        this.dateRange = [];
        this.load();
    }

    typeBadgeClass(type: string): string {
        return type === 'Receivable'
            ? 'bg-red-100 text-red-800'
            : 'bg-green-100 text-green-800';
    }

    typeLabel(type: string): string {
        return type === 'Receivable' ? 'Invoice' : 'Payment';
    }
}
