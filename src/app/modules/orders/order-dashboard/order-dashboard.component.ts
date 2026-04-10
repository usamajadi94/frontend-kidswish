import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LocalStorageService } from 'app/core/auth/localStorage.service';
import { apiUrls } from 'app/modules/shared/services/api-url';

@Component({
    selector: 'app-order-dashboard',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule],
    templateUrl: './order-dashboard.component.html',
})
export class OrderDashboardComponent implements OnInit {
    private _http = inject(HttpClient);
    private _localStorage = inject(LocalStorageService);
    private _router = inject(Router);

    isLoading = true;
    cards: any = {};
    recentOrders: any[] = [];
    stockAlerts: any[] = [];
    todayDispatch: any = {};

    get authHeaders() {
        return new HttpHeaders({ uid: this._localStorage.uid, cid: this._localStorage.cid, eid: this._localStorage.eid });
    }

    ngOnInit() { this.load(); }

    load() {
        this.isLoading = true;
        this._http.get<any>(`${apiUrls.server}${apiUrls.distributorOrderController}/dashboard`, { headers: this.authHeaders }).subscribe({
            next: (res) => {
                this.cards = res.cards || {};
                this.recentOrders = res.recentOrders || [];
                this.stockAlerts = res.stockAlerts || [];
                this.todayDispatch = res.todayDispatch || {};
                this.isLoading = false;
            },
            error: () => { this.isLoading = false; },
        });
    }

    goOrder(id: number) { this._router.navigate(['/orders/order-detail', id]); }
    goList() { this._router.navigate(['/orders/order-list']); }
    goDispatch() { this._router.navigate(['/orders/dispatch-list']); }
    goStock() { this._router.navigate(['/orders/stock-master']); }
}
