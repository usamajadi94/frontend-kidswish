import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalStorageService } from 'app/core/auth/localStorage.service';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';

@Component({
    selector: 'app-order-list',
    standalone: true,
    imports: [CommonModule, BftButtonComponent],
    templateUrl: './order-list.component.html',
})
export class OrderListComponent implements OnInit {
    private _localStorage = inject(LocalStorageService);
    private _http = inject(HttpClient);
    private _router = inject(Router);

    orders: any[] = [];
    isLoading = false;

    // Override title/mode for distributor "My Orders" vs admin "Orders"
    title = 'Orders';
    showSubmitBtn = false;

    private _route = inject(ActivatedRoute);
    router = inject(Router);

    ngOnInit() {
        const data = this._route.snapshot.data;
        if (data['title']) this.title = data['title'];
        if (data['showSubmitBtn']) this.showSubmitBtn = true;
        this.loadOrders();
    }

    loadOrders() {
        this.isLoading = true;
        const headers = new HttpHeaders({
            uid: this._localStorage.uid,
            cid: this._localStorage.cid,
            eid: this._localStorage.eid,
        });
        this._http.get<any[]>(`${apiUrls.server}${apiUrls.distributorOrderController}`, { headers }).subscribe({
            next: (res: any) => { this.orders = res || []; this.isLoading = false; },
            error: () => { this.isLoading = false; },
        });
    }

    viewOrder(row: any) {
        this._router.navigate(['/orders/order-detail', row.ID]);
    }
}
