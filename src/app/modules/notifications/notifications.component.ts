import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { LocalStorageService } from 'app/core/auth/localStorage.service';
import { apiUrls } from 'app/modules/shared/services/api-url';

@Component({
    selector: 'app-notifications',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule],
    templateUrl: './notifications.component.html',
})
export class NotificationsComponent implements OnInit {
    private _http = inject(HttpClient);
    private _localStorage = inject(LocalStorageService);
    private _router = inject(Router);

    notifications: any[] = [];
    isLoading = false;

    get authHeaders() {
        return new HttpHeaders({ uid: this._localStorage.uid, cid: this._localStorage.cid, eid: this._localStorage.eid });
    }

    ngOnInit() { this.load(); }

    load() {
        this.isLoading = true;
        this._http.get<any[]>(`${apiUrls.server}${apiUrls.notificationController}`, { headers: this.authHeaders }).subscribe({
            next: (res) => { this.notifications = res || []; this.isLoading = false; },
            error: () => { this.isLoading = false; },
        });
    }

    markAllRead() {
        this._http.post<any>(`${apiUrls.server}${apiUrls.notificationController}/read-all`, {}, { headers: this.authHeaders }).subscribe({
            next: () => { this.notifications.forEach(n => n.IsRead = true); },
        });
    }

    isRead(n: any): boolean {
        return n.IsRead === true;
    }

    open(n: any) {
        if (!this.isRead(n)) {
            this._http.post<any>(`${apiUrls.server}${apiUrls.notificationController}/read/${n.ID}`, {}, { headers: this.authHeaders }).subscribe({
                next: () => { n.IsRead = true; },
            });
        }
        if (n.RefType === 'distributor_order' && n.RefID) {
            this._router.navigate(['/orders/order-detail', n.RefID]);
        }
    }
}
