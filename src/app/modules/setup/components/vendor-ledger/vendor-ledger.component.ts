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
    selector: 'app-vendor-ledger',
    standalone: true,
    imports: [CommonModule, FormsModule, NzDatePickerModule, NzSelectModule, CurrencyPipe, DatePipe],
    templateUrl: './vendor-ledger.component.html',
    styleUrl: './vendor-ledger.component.scss',
})
export class VendorLedgerComponent extends BaseRoutedComponent implements OnInit {
    private _http         = inject(HttpClient);
    private _localStorage = inject(LocalStorageService);
    private _drpService   = inject(DrpService);

    title = componentRegister.vendorLedger.Title;

    vendors: any[]          = [];
    selectedVendor: any     = null;
    dateRange: Date[]       = [];
    isLoadingFinancial      = false;
    isLoadingBalances       = false;
    vendorBalances: any[]   = [];
    financialRows: any[]    = [];

    get headers() {
        return new HttpHeaders({
            uid: this._localStorage.uid,
            cid: this._localStorage.cid,
            eid: this._localStorage.eid,
        });
    }

    get totalExpenses(): number  { return this.financialRows.reduce((s, r) => s + (+r.Debit  || 0), 0); }
    get totalPaid(): number      { return this.financialRows.reduce((s, r) => s + (+r.Credit || 0), 0); }
    get outstanding(): number    { return this.totalExpenses - this.totalPaid; }
    get balanceTotalOutstanding(): number { return this.vendorBalances.reduce((s, v) => s + (+v.Outstanding || 0), 0); }

    ngOnInit() {
        const now = new Date();
        this.dateRange = [new Date(now.getFullYear(), now.getMonth(), 1), now];
        this._drpService.getVendorDrp().subscribe({ next: (res: any) => { this.vendors = res || []; } });
        this.loadBalances();
        this.loadFinancial();
    }

    loadBalances() {
        this.isLoadingBalances = true;
        this._http.get<any[]>(
            `${apiUrls.server}${apiUrls.vendorLedgerController}`,
            { headers: this.headers }
        ).subscribe({
            next: (res) => { this.vendorBalances = res || []; this.isLoadingBalances = false; },
            error: () => { this.isLoadingBalances = false; },
        });
    }

    selectVendorFromBalances(vendorId: number) {
        this.selectedVendor = vendorId;
        this.loadFinancial();
    }

    onVendorChange() {
        this.loadFinancial();
    }

    onDateChange(dates: Date[]) {
        this.dateRange = dates || [];
        this.loadFinancial();
    }

    loadFinancial() {
        this.isLoadingFinancial = true;
        const from = this.dateRange?.[0]?.toISOString() || '';
        const to   = this.dateRange?.[1]?.toISOString() || '';
        const base = this.selectedVendor
            ? `${apiUrls.server}${apiUrls.vendorLedgerController}/${this.selectedVendor}/financial?`
            : `${apiUrls.server}${apiUrls.vendorLedgerController}/all/financial?`;
        let url = base;
        if (from) url += `from=${encodeURIComponent(from)}&`;
        if (to)   url += `to=${encodeURIComponent(to)}&`;
        this._http.get<any[]>(url, { headers: this.headers }).subscribe({
            next: (res) => { this.financialRows = res || []; this.isLoadingFinancial = false; },
            error: () => { this.isLoadingFinancial = false; },
        });
    }
}
