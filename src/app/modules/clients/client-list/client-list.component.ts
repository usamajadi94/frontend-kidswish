import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalStorageService } from 'app/core/auth/localStorage.service';
import { apiUrls } from 'app/modules/shared/services/api-url';

@Component({
    selector: 'app-client-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MatButtonModule],
    templateUrl: './client-list.component.html',
})
export class ClientListComponent implements OnInit {
    private _localStorage = inject(LocalStorageService);
    private _http = inject(HttpClient);

    clients: any[] = [];
    isLoading = false;
    showForm = false;
    isSaving = false;
    errorMsg = '';
    successMsg = '';

    form = {
        Name: '', Code: '', ContactNo: '',
        AdminName: '', AdminUsername: '', AdminEmail: '', AdminPassword: '',
    };

    private get authHeaders() {
        return new HttpHeaders({ uid: this._localStorage.uid, cid: this._localStorage.cid, eid: this._localStorage.eid });
    }

    ngOnInit() { this.load(); }

    load() {
        this.isLoading = true;
        this._http.get<any[]>(`${apiUrls.server}${apiUrls.clientManagementController}`, { headers: this.authHeaders })
            .subscribe({
                next: (res) => { this.clients = res || []; this.isLoading = false; },
                error: (e) => { this.errorMsg = e?.error?.message || 'Failed to load clients'; this.isLoading = false; },
            });
    }

    openForm() {
        this.form = { Name: '', Code: '', ContactNo: '', AdminName: '', AdminUsername: '', AdminEmail: '', AdminPassword: '' };
        this.errorMsg = '';
        this.successMsg = '';
        this.showForm = true;
    }

    save() {
        this.isSaving = true;
        this.errorMsg = '';
        this._http.post<any>(`${apiUrls.server}${apiUrls.clientManagementController}`, this.form, { headers: this.authHeaders })
            .subscribe({
                next: (res) => {
                    this.isSaving = false;
                    this.showForm = false;
                    this.successMsg = `Client "${this.form.Name}" created! Client ID: ${res.clientId}`;
                    this.load();
                },
                error: (e) => { this.isSaving = false; this.errorMsg = e?.error?.message || 'Failed to create client'; },
            });
    }
}
