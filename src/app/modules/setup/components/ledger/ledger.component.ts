import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { LocalStorageService } from 'app/core/auth/localStorage.service';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-ledger',
    standalone: true,
    imports: [CommonModule, FormsModule, NzSelectModule, CurrencyPipe, DatePipe, MatButtonModule, MatIconModule],
    templateUrl: './ledger.component.html',
    styleUrl: './ledger.component.scss',
})
export class LedgerComponent extends BaseRoutedComponent implements OnInit {
    private _http          = inject(HttpClient);
    private _localStorage  = inject(LocalStorageService);
    private _drpService    = inject(DrpService);

    distributors: any[] = [];
    selectedDistributor: number | null = null;
    isDistributorUser = false;

    customers: any[] = [];
    selectedCustomer: any = null;
    isLoadingList = false;
    isLoadingLedger = false;
    isSaving = false;
    errorMsg = '';
    showPaymentForm = false;
    filterOrder = '';

    ledger: any[] = [];

    payForm = { CustomerID: null as any, Amount: null as any, PaymentType: 'Cash', Date: '', Notes: '' };

    get authHeaders() {
        return new HttpHeaders({ uid: this._localStorage.uid, cid: this._localStorage.cid, eid: this._localStorage.eid });
    }

    get orderOptions(): string[] {
        return [...new Set(
            this.ledger.filter(r => r.EntryType === 'Order').map(r => r.Reference).filter(Boolean)
        )];
    }

    get filteredLedger(): any[] {
        if (!this.filterOrder) return this.ledger;
        return this.ledger.filter(r => r.EntryType !== 'Order' || r.Reference === this.filterOrder);
    }

    get runningLedger(): any[] {
        let balance = 0;
        return this.filteredLedger.map(row => {
            balance += (+row.Debit || 0) - (+row.Credit || 0);
            return { ...row, Balance: balance };
        });
    }

    get totalDebit(): number  { return this.filteredLedger.reduce((s, r) => s + (+r.Debit  || 0), 0); }
    get totalCredit(): number { return this.filteredLedger.reduce((s, r) => s + (+r.Credit || 0), 0); }
    get outstanding(): number { return this.totalDebit - this.totalCredit; }

    ngOnInit() {
        this.isDistributorUser = this._localStorage.isDistributor === 'true';
        this._drpService.getDistributorDrp().subscribe({
            next: (res: any) => {
                this.distributors = res || [];
                if (this.isDistributorUser && this._localStorage.distributorId) {
                    this.selectedDistributor = +this._localStorage.distributorId;
                }
                this.loadCustomers();
            },
        });
    }

    onDistributorChange() {
        this.selectedCustomer = null;
        this.ledger = [];
        this.filterOrder = '';
        this.showPaymentForm = false;
        this.loadCustomers();
    }

    loadCustomers() {
        this.isLoadingList = true;
        let url = `${apiUrls.server}${apiUrls.customerLedgerController}`;
        if (this.selectedDistributor) url += `?distributorId=${this.selectedDistributor}`;
        this._http.get<any[]>(url, { headers: this.authHeaders }).subscribe({
            next: (res) => { this.customers = res || []; this.isLoadingList = false; },
            error: () => { this.isLoadingList = false; },
        });
    }

    selectCustomer(c: any) {
        this.selectedCustomer = c;
        this.ledger = [];
        this.filterOrder = '';
        this.showPaymentForm = false;
        this.isLoadingLedger = true;
        this._http.get<any[]>(
            `${apiUrls.server}${apiUrls.customerLedgerController}/${c.CustomerID}`,
            { headers: this.authHeaders }
        ).subscribe({
            next: (res) => { this.ledger = res || []; this.isLoadingLedger = false; },
            error: () => { this.isLoadingLedger = false; },
        });
    }

    openPaymentForm() {
        this.payForm = {
            CustomerID: this.selectedCustomer?.CustomerID,
            Amount: null,
            PaymentType: 'Cash',
            Date: new Date().toISOString().split('T')[0],
            Notes: '',
        };
        this.errorMsg = '';
        this.showPaymentForm = true;
    }

    savePayment() {
        if (!this.payForm.Amount || this.payForm.Amount <= 0) {
            this.errorMsg = 'Amount must be greater than 0'; return;
        }
        this.isSaving = true;
        this._http.post<any>(
            `${apiUrls.server}${apiUrls.customerLedgerController}/payment`,
            this.payForm,
            { headers: this.authHeaders }
        ).subscribe({
            next: () => {
                this.isSaving = false;
                this.showPaymentForm = false;
                this.selectCustomer(this.selectedCustomer);
                this.loadCustomers();
            },
            error: (e) => { this.isSaving = false; this.errorMsg = e?.error?.message || 'Failed'; },
        });
    }

    back() {
        this.selectedCustomer = null;
        this.ledger = [];
        this.filterOrder = '';
        this.showPaymentForm = false;
    }
}
