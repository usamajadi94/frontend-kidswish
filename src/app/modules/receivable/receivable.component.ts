import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalStorageService } from 'app/core/auth/localStorage.service';
import { apiUrls } from 'app/modules/shared/services/api-url';

@Component({
    selector: 'app-receivable',
    standalone: true,
    imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule],
    templateUrl: './receivable.component.html',
})
export class ReceivableComponent implements OnInit {
    private _localStorage = inject(LocalStorageService);
    private _http = inject(HttpClient);

    cards: any = {};
    customers: any[] = [];
    ledger: any[] = [];
    isLoading = false;
    selectedCustomer: any = null;
    showPaymentForm = false;
    isSaving = false;
    errorMsg = '';
    successMsg = '';

    payForm = { CustomerID: null as any, Amount: null as any, PaymentType: 'Cash', Date: new Date().toISOString().split('T')[0], Notes: '' };

    get authHeaders() {
        return new HttpHeaders({ uid: this._localStorage.uid, cid: this._localStorage.cid, eid: this._localStorage.eid });
    }

    ngOnInit() { this.loadAll(); }

    loadAll() {
        this.isLoading = true;
        Promise.all([
            this._http.get<any>(`${apiUrls.server}${apiUrls.receivableController}/cards`, { headers: this.authHeaders }).toPromise(),
            this._http.get<any[]>(`${apiUrls.server}${apiUrls.receivableController}/by-customer`, { headers: this.authHeaders }).toPromise(),
        ]).then(([cards, customers]) => {
            this.cards = cards || {};
            this.customers = customers || [];
            this.isLoading = false;
        }).catch(() => { this.isLoading = false; });
    }

    selectCustomer(c: any) {
        this.selectedCustomer = c;
        this._http.get<any[]>(`${apiUrls.server}${apiUrls.receivableController}/ledger?customerId=${c.CustomerID}`, { headers: this.authHeaders }).subscribe({
            next: (res) => { this.ledger = res || []; },
        });
    }

    openPayment(c?: any) {
        this.errorMsg = '';
        this.successMsg = '';
        this.payForm = { CustomerID: c?.CustomerID || null, Amount: 0, PaymentType: 'Cash', Date: new Date().toISOString().split('T')[0], Notes: '' };
        this.showPaymentForm = true;
    }

    savePayment() {
        if (!this.payForm.CustomerID || !this.payForm.Amount) { this.errorMsg = 'Customer and amount required'; return; }
        this.isSaving = true;
        this._http.post<any>(`${apiUrls.server}${apiUrls.receivableController}/payment`, this.payForm, { headers: this.authHeaders }).subscribe({
            next: () => {
                this.isSaving = false;
                this.showPaymentForm = false;
                this.successMsg = 'Payment recorded';
                this.loadAll();
                if (this.selectedCustomer) this.selectCustomer(this.selectedCustomer);
            },
            error: (e) => { this.isSaving = false; this.errorMsg = e?.error?.message || 'Failed'; },
        });
    }
}
