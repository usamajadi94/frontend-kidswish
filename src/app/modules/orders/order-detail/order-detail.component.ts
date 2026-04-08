import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalStorageService } from 'app/core/auth/localStorage.service';
import { apiUrls } from 'app/modules/shared/services/api-url';

@Component({
    selector: 'app-order-detail',
    standalone: true,
    imports: [CommonModule, MatButtonModule],
    templateUrl: './order-detail.component.html',
})
export class OrderDetailComponent implements OnInit {
    private _route = inject(ActivatedRoute);
    private _router = inject(Router);
    private _localStorage = inject(LocalStorageService);
    private _http = inject(HttpClient);

    order: any = null;
    isLoading = true;
    isUpdatingStatus = false;
    statusError = '';

    get isAdmin(): boolean { return this._localStorage.isDistributor !== 'true'; }

    get customerGroups(): { customerName: string; invoiceNo: string; items: any[] }[] {
        if (!this.order?.Items) return [];
        const map = new Map<string, { invoiceNo: string; items: any[] }>();
        for (const item of this.order.Items) {
            const key = item.CustomerName || '(No Customer)';
            if (!map.has(key)) map.set(key, { invoiceNo: item.InvoiceNo || '', items: [] });
            map.get(key)!.items.push(item);
        }
        return Array.from(map.entries()).map(([customerName, v]) => ({ customerName, invoiceNo: v.invoiceNo, items: v.items }));
    }

    get hasInsufficientStock(): boolean {
        return this.order?.Items?.some((i: any) => i.StockStatus === 'Insufficient') ?? false;
    }

    ngOnInit() {
        const id = this._route.snapshot.params['id'];
        this.loadOrder(id);
    }

    loadOrder(id: number) {
        const h = this.authHeaders;
        this._http.get(`${apiUrls.server}${apiUrls.distributorOrderController}/${id}`, { headers: h }).subscribe({
            next: (res: any) => { this.order = res; this.isLoading = false; },
            error: () => { this.isLoading = false; },
        });
    }

    markInProcess() {
        this.isUpdatingStatus = true;
        this.statusError = '';
        this._http.patch(
            `${apiUrls.server}${apiUrls.distributorOrderController}/${this.order.ID}/status`,
            { Status: 'In Process' },
            { headers: this.authHeaders }
        ).subscribe({
            next: (res: any) => { this.order = res; this.isUpdatingStatus = false; },
            error: (e) => { this.isUpdatingStatus = false; this.statusError = e?.error?.message || e?.message || `Error ${e?.status}`; },
        });
    }

    private get authHeaders() {
        return new HttpHeaders({ uid: this._localStorage.uid, cid: this._localStorage.cid, eid: this._localStorage.eid });
    }

    goBack() {
        this._router.navigate([window.history.length > 1 ? '..' : '/orders/order-list'], { relativeTo: this._route });
    }
}
