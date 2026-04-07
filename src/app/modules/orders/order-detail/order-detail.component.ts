import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalStorageService } from 'app/core/auth/localStorage.service';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';

@Component({
    selector: 'app-order-detail',
    standalone: true,
    imports: [CommonModule, BftButtonComponent],
    templateUrl: './order-detail.component.html',
})
export class OrderDetailComponent implements OnInit {
    private _route = inject(ActivatedRoute);
    private _router = inject(Router);
    private _localStorage = inject(LocalStorageService);
    private _http = inject(HttpClient);
    order: any = null;
    isLoading = true;

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

    ngOnInit() {
        const id = this._route.snapshot.params['id'];
        this.loadOrder(id);
    }

    loadOrder(id: number) {
        const headers = new HttpHeaders({
            uid: this._localStorage.uid,
            cid: this._localStorage.cid,
            eid: this._localStorage.eid,
        });
        this._http.get(`${apiUrls.server}${apiUrls.distributorOrderController}/${id}`, { headers }).subscribe({
            next: (res: any) => { this.order = res; this.isLoading = false; },
            error: () => { this.isLoading = false; },
        });
    }

    goBack() {
        this._router.navigate([window.history.length > 1 ? '..' : '/orders/order-list'], { relativeTo: this._route });
    }
}
