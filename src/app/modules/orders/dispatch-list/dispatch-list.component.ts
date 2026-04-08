import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalStorageService } from 'app/core/auth/localStorage.service';
import { apiUrls } from 'app/modules/shared/services/api-url';

@Component({
    selector: 'app-dispatch-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MatButtonModule],
    templateUrl: './dispatch-list.component.html',
})
export class DispatchListComponent implements OnInit {
    private _localStorage = inject(LocalStorageService);
    private _http = inject(HttpClient);

    dispatchList: any[] = [];
    isLoading = false;
    confirmingId: number | null = null;
    errorMsg = '';
    successMsg = '';
    filterDate: string = new Date().toISOString().split('T')[0];

    get authHeaders() {
        return new HttpHeaders({ uid: this._localStorage.uid, cid: this._localStorage.cid, eid: this._localStorage.eid });
    }

    get planned() { return this.dispatchList.filter(d => d.Status === 'Planned'); }
    get confirmed() { return this.dispatchList.filter(d => d.Status === 'Confirmed'); }

    ngOnInit() { this.load(); }

    load() {
        this.isLoading = true;
        this.errorMsg = '';
        this._http.get<any[]>(
            `${apiUrls.server}${apiUrls.dispatchController}/list?date=${this.filterDate}`,
            { headers: this.authHeaders }
        ).subscribe({
            next: (res: any) => { this.dispatchList = res || []; this.isLoading = false; },
            error: () => { this.isLoading = false; },
        });
    }

    confirm(id: number) {
        this.confirmingId = id;
        this.errorMsg = '';
        this.successMsg = '';
        this._http.post<any>(
            `${apiUrls.server}${apiUrls.dispatchController}/confirm/${id}`,
            {},
            { headers: this.authHeaders }
        ).subscribe({
            next: () => {
                this.confirmingId = null;
                this.successMsg = 'Dispatch confirmed. Stock reduced and invoice generated.';
                this.load();
            },
            error: (e) => {
                this.confirmingId = null;
                this.errorMsg = e?.error?.message || 'Failed to confirm dispatch';
            },
        });
    }

    deletePlan(id: number) {
        if (!confirm('Remove this dispatch plan entry?')) return;
        this._http.delete<any>(
            `${apiUrls.server}${apiUrls.dispatchController}/plan/${id}`,
            { headers: this.authHeaders }
        ).subscribe({
            next: () => this.load(),
            error: (e) => { this.errorMsg = e?.error?.message || 'Cannot delete'; },
        });
    }
}
