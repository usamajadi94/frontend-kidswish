import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
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
    imports: [CommonModule, FormsModule, NzSelectModule, DatePipe, MatButtonModule, MatIconModule],
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
    selectedCustomerId: number | null = null;
    isLoadingCustomers = false;

    selectedCustomer: any = null;
    ledger: any[] = [];
    isLoadingLedger = false;
    filterOrder = '';
    showPaymentForm = false;
    isSaving = false;
    errorMsg = '';

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
                    this.loadCustomers();
                }
            },
        });
    }

    onDistributorChange() {
        this.customers = [];
        this.selectedCustomerId = null;
        this.selectedCustomer = null;
        this.ledger = [];
        this.filterOrder = '';
        this.showPaymentForm = false;
        if (this.selectedDistributor) this.loadCustomers();
    }

    loadCustomers() {
        this.isLoadingCustomers = true;
        let url = `${apiUrls.server}${apiUrls.customerLedgerController}`;
        if (this.selectedDistributor) url += `?distributorId=${this.selectedDistributor}`;
        this._http.get<any[]>(url, { headers: this.authHeaders }).subscribe({
            next: (res) => { this.customers = res || []; this.isLoadingCustomers = false; },
            error: () => { this.isLoadingCustomers = false; },
        });
    }

    onCustomerChange() {
        this.selectedCustomer = null;
        this.ledger = [];
        this.filterOrder = '';
        this.showPaymentForm = false;
        if (!this.selectedCustomerId) return;
        const found = this.customers.find(c => c.CustomerID === this.selectedCustomerId);
        this.selectedCustomer = found || null;
        this.loadLedger();
    }

    loadLedger() {
        if (!this.selectedCustomerId) return;
        this.isLoadingLedger = true;
        this._http.get<any[]>(
            `${apiUrls.server}${apiUrls.customerLedgerController}/${this.selectedCustomerId}`,
            { headers: this.authHeaders }
        ).subscribe({
            next: (res) => { this.ledger = res || []; this.isLoadingLedger = false; },
            error: () => { this.isLoadingLedger = false; },
        });
    }

    openPaymentForm() {
        this.payForm = {
            CustomerID: this.selectedCustomerId,
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
                this.loadLedger();
                this.loadCustomers();
            },
            error: (e) => { this.isSaving = false; this.errorMsg = e?.error?.message || 'Failed'; },
        });
    }
}
