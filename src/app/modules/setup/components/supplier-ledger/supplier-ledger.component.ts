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
import { ExportService } from 'app/modules/shared/services/export.service';

@Component({
    selector: 'app-supplier-ledger',
    standalone: true,
    imports: [CommonModule, FormsModule, NzDatePickerModule, NzSelectModule, CurrencyPipe, DatePipe],
    templateUrl: './supplier-ledger.component.html',
    styleUrl: './supplier-ledger.component.scss',
})
export class SupplierLedgerComponent extends BaseRoutedComponent implements OnInit {
    private _http         = inject(HttpClient);
    private _localStorage = inject(LocalStorageService);
    private _drpService   = inject(DrpService);
    private _exportService = inject(ExportService);

    title = componentRegister.supplierLedger.Title;

    suppliers: any[]        = [];
    selectedSupplier: any   = null;
    dateRange: Date[]       = [];
    isLoadingFinancial      = false;
    isLoadingBalances       = false;
    supplierBalances: any[] = [];
    financialRows: any[]    = [];

    get headers() {
        return new HttpHeaders({
            uid: this._localStorage.uid,
            cid: this._localStorage.cid,
            eid: this._localStorage.eid,
        });
    }

    get totalBilled(): number    { return this.financialRows.reduce((s, r) => s + (+r.Debit  || 0), 0); }
    get totalPaid(): number      { return this.financialRows.reduce((s, r) => s + (+r.Credit || 0), 0); }
    get outstanding(): number    { return this.totalBilled - this.totalPaid; }
    get balanceTotalOutstanding(): number { return this.supplierBalances.reduce((s, v) => s + (+v.Outstanding || 0), 0); }

    get exportColumns() {
        return [
            { header: 'Date', name: 'Date', type: 'date' },
            { header: 'Supplier', name: 'SupplierName', type: 'text' },
            { header: 'Type', name: 'Type', type: 'text' },
            { header: 'Notes', name: 'Notes', type: 'text' },
            { header: 'Account', name: 'AccountName', type: 'text' },
            { header: 'Bill (Dr)', name: 'Debit', type: 'currency' },
            { header: 'Payment (Cr)', name: 'Credit', type: 'currency' },
            { header: 'Balance', name: 'Balance', type: 'currency' },
        ];
    }

    exportToExcel() {
        const supplierName = this.suppliers.find(s => s.ID === this.selectedSupplier)?.Name;
        const fileName = supplierName ? `${this.title} - ${supplierName}` : this.title;
        const rows = supplierName
            ? this.financialRows.map(r => ({ ...r, SupplierName: r.SupplierName || supplierName }))
            : this.financialRows;
        this._exportService.exportToExcel(this.exportColumns, rows, fileName);
    }

    ngOnInit() {
        const now = new Date();
        this.dateRange = [new Date(now.getFullYear(), now.getMonth(), 1), now];
        this._drpService.getSupplierDrp().subscribe({ next: (res: any) => { this.suppliers = res || []; } });
        this.loadBalances();
        this.loadFinancial();
    }

    loadBalances() {
        this.isLoadingBalances = true;
        this._http.get<any[]>(
            `${apiUrls.server}${apiUrls.supplierLedgerController}`,
            { headers: this.headers }
        ).subscribe({
            next: (res) => { this.supplierBalances = res || []; this.isLoadingBalances = false; },
            error: () => { this.isLoadingBalances = false; },
        });
    }

    selectSupplierFromBalances(supplierId: number) {
        this.selectedSupplier = supplierId;
        this.loadFinancial();
    }

    onSupplierChange() {
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
        const base = this.selectedSupplier
            ? `${apiUrls.server}${apiUrls.supplierLedgerController}/${this.selectedSupplier}/financial?`
            : `${apiUrls.server}${apiUrls.supplierLedgerController}/all/financial?`;
        let url = base;
        if (from) url += `from=${encodeURIComponent(from)}&`;
        if (to)   url += `to=${encodeURIComponent(to)}&`;
        this._http.get<any[]>(url, { headers: this.headers }).subscribe({
            next: (res) => { this.financialRows = res || []; this.isLoadingFinancial = false; },
            error: () => { this.isLoadingFinancial = false; },
        });
    }
}
