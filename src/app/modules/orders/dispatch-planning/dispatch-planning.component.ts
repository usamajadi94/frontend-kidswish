import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalStorageService } from 'app/core/auth/localStorage.service';
import { apiUrls } from 'app/modules/shared/services/api-url';

@Component({
    selector: 'app-dispatch-planning',
    standalone: true,
    imports: [CommonModule, FormsModule, MatButtonModule],
    templateUrl: './dispatch-planning.component.html',
})
export class DispatchPlanningComponent implements OnInit {
    private _localStorage = inject(LocalStorageService);
    private _http = inject(HttpClient);

    inProcessOrders: any[] = [];
    selectedOrderId: number | null = null;
    orderItems: any[] = [];
    isLoadingOrders = false;
    isLoadingItems = false;
    isSaving = false;
    successMsg = '';
    errorMsg = '';

    // dispatch date for all entries in this plan batch
    dispatchDate: string = new Date().toISOString().split('T')[0];

    // per-item planned qty (keyed by ItemID)
    plannedQtys: { [itemId: number]: number } = {};
    plannedNotes: { [itemId: number]: string } = {};

    get authHeaders() {
        return new HttpHeaders({ uid: this._localStorage.uid, cid: this._localStorage.cid, eid: this._localStorage.eid });
    }

    ngOnInit() {
        this.loadOrders();
    }

    loadOrders() {
        this.isLoadingOrders = true;
        this._http.get<any[]>(`${apiUrls.server}${apiUrls.dispatchController}/in-process-orders`, { headers: this.authHeaders }).subscribe({
            next: (res: any) => { this.inProcessOrders = res || []; this.isLoadingOrders = false; },
            error: () => { this.isLoadingOrders = false; },
        });
    }

    onOrderChange() {
        if (!this.selectedOrderId) { this.orderItems = []; return; }
        this.isLoadingItems = true;
        this.plannedQtys = {};
        this.plannedNotes = {};
        this._http.get<any[]>(`${apiUrls.server}${apiUrls.dispatchController}/order-items/${this.selectedOrderId}`, { headers: this.authHeaders }).subscribe({
            next: (res: any) => {
                this.orderItems = (res || []).filter((i: any) => parseFloat(i.RemainingQty) > 0);
                this.orderItems.forEach(i => { this.plannedQtys[i.ItemID] = 0; this.plannedNotes[i.ItemID] = ''; });
                this.isLoadingItems = false;
            },
            error: () => { this.isLoadingItems = false; },
        });
    }

    get hasEntries(): boolean {
        return this.orderItems.some(i => (this.plannedQtys[i.ItemID] || 0) > 0);
    }

    savePlan() {
        this.errorMsg = '';
        this.successMsg = '';
        const entries = this.orderItems
            .filter(i => (this.plannedQtys[i.ItemID] || 0) > 0)
            .map(i => ({
                CustomerID: i.CustomerID,
                ProductID: i.ProductID,
                ProductName: i.ProductName,
                PlannedQty: this.plannedQtys[i.ItemID],
                DispatchDate: this.dispatchDate,
                Notes: this.plannedNotes[i.ItemID] || null,
            }));

        if (!entries.length) { this.errorMsg = 'Enter dispatch qty for at least one item'; return; }

        this.isSaving = true;
        this._http.post<any>(`${apiUrls.server}${apiUrls.dispatchController}/plan`,
            { OrderID: this.selectedOrderId, entries },
            { headers: this.authHeaders }
        ).subscribe({
            next: (res) => {
                this.isSaving = false;
                this.successMsg = `${res.created} dispatch plan entries saved for ${this.dispatchDate}`;
                this.onOrderChange(); // reload items
            },
            error: (e) => { this.isSaving = false; this.errorMsg = e?.error?.message || 'Failed to save plan'; },
        });
    }
}
