import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LocalStorageService } from 'app/core/auth/localStorage.service';
import { apiUrls } from 'app/modules/shared/services/api-url';

@Component({
    selector: 'app-customer-ledger',
    standalone: true,
    imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule],
    templateUrl: './customer-ledger.component.html',
})
export class CustomerLedgerComponent implements OnInit {
    private _localStorage = inject(LocalStorageService);
    private _http = inject(HttpClient);

    customers: any[] = [];
    ledger: any[] = [];
    selectedCustomer: any = null;
    isLoadingList = false;
    isLoadingLedger = false;
    isSaving = false;
    errorMsg = '';
    showPaymentForm = false;

    filterOrder = '';

    payForm = { CustomerID: null as any, Amount: null as any, PaymentType: 'Cash', Date: '', Notes: '' };

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

    get totalDebit(): number { return this.filteredLedger.reduce((s, r) => s + (+r.Debit || 0), 0); }
    get totalCredit(): number { return this.filteredLedger.reduce((s, r) => s + (+r.Credit || 0), 0); }
    get outstanding(): number { return this.totalDebit - this.totalCredit; }

    private get authHeaders() {
        return new HttpHeaders({ uid: this._localStorage.uid, cid: this._localStorage.cid, eid: this._localStorage.eid });
    }

    ngOnInit() { this.loadCustomers(); }

    loadCustomers() {
        this.isLoadingList = true;
        this._http.get<any[]>(`${apiUrls.server}${apiUrls.customerLedgerController}`, { headers: this.authHeaders }).subscribe({
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

    back() { this.selectedCustomer = null; this.ledger = []; this.filterOrder = ''; this.showPaymentForm = false; }
}
