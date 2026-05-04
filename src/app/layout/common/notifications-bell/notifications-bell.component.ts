import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalStorageService } from 'app/core/auth/localStorage.service';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { Router } from '@angular/router';

@Component({
    selector: 'app-notifications-bell',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule],
    templateUrl: './notifications-bell.component.html',
})
export class NotificationsBellComponent implements OnInit, OnDestroy {
    private _http = inject(HttpClient);
    private _localStorage = inject(LocalStorageService);
    private _router = inject(Router);

    unreadCount = 0;
    notifications: any[] = [];
    showPanel = false;
    private _pollInterval: any;

    get authHeaders() {
        return new HttpHeaders({ uid: this._localStorage.uid, cid: this._localStorage.cid, eid: this._localStorage.eid });
    }

    ngOnInit() {
        this.loadCount();
        // Poll every 30s
        this._pollInterval = setInterval(() => this.loadCount(), 30000);
    }

    ngOnDestroy() {
        clearInterval(this._pollInterval);
    }

    loadCount() {
        if (!this._localStorage.uid) return;
        this._http.get<any>(`${apiUrls.server}${apiUrls.notificationController}/unread-count`, { headers: this.authHeaders }).subscribe({
            next: (res) => { this.unreadCount = res?.Count || 0; },
            error: () => {},
        });
    }

    togglePanel() {
        this.showPanel = !this.showPanel;
        if (this.showPanel) this.loadNotifications();
    }

    loadNotifications() {
        this._http.get<any[]>(`${apiUrls.server}${apiUrls.notificationController}`, { headers: this.authHeaders }).subscribe({
            next: (res) => { this.notifications = res || []; },
        });
    }

    markRead(n: any) {
        if (this.isRead(n)) return;
        this._http.post<any>(`${apiUrls.server}${apiUrls.notificationController}/read/${n.ID}`, {}, { headers: this.authHeaders }).subscribe({
            next: () => { n.IsRead = true; this.unreadCount = Math.max(0, this.unreadCount - 1); },
        });
    }

    markAllRead() {
        this._http.post<any>(`${apiUrls.server}${apiUrls.notificationController}/read-all`, {}, { headers: this.authHeaders }).subscribe({
            next: () => { this.notifications.forEach(n => n.IsRead = true); this.unreadCount = 0; },
        });
    }

    isRead(n: any): boolean {
        return n.IsRead === true;
    }

    goToOrder(n: any) {
        if (n.RefType === 'distributor_order' && n.RefID) {
            this._router.navigate(['/orders/order-detail', n.RefID]);
            this.showPanel = false;
        }
        this.markRead(n);
    }
}
