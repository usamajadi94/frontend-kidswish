import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { ListService } from 'app/modules/shared/services/list.service';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { LocalStorageService } from 'app/core/auth/localStorage.service';

interface ExpenseRow {
    Date: string;
    ExpenseCategoryID: number | null;
    VendorID: number | null;
    Amount: number | null;
    Notes: string;
}

@Component({
    selector: 'app-expense-multi-form',
    standalone: true,
    imports: [CommonModule, FormsModule, NzDatePickerModule, NzSelectModule, MatIconModule],
    template: `
<div class="flex flex-col gap-4 p-2">

    <!-- Petty Cash Info -->
    <div class="rounded-lg bg-blue-50 border border-blue-100 px-4 py-2 text-sm text-blue-700 font-medium">
        Adding expenses to: {{ pettyCashName || 'Petty Cash' }}
    </div>

    <!-- Table -->
    <div class="overflow-x-auto rounded-lg border border-gray-200">
        <table class="w-full text-sm">
            <thead class="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                    <th class="px-3 py-2 text-left w-36">Date *</th>
                    <th class="px-3 py-2 text-left w-44">Category *</th>
                    <th class="px-3 py-2 text-left w-44">Vendor</th>
                    <th class="px-3 py-2 text-left w-32">Amount (PKR) *</th>
                    <th class="px-3 py-2 text-left">Notes</th>
                    <th class="px-3 py-2 w-10"></th>
                </tr>
            </thead>
            <tbody>
                @for (row of rows; track $index) {
                <tr class="border-t border-gray-100 hover:bg-gray-50">
                    <!-- Date -->
                    <td class="px-2 py-1.5">
                        <input type="date" [(ngModel)]="row.Date"
                            class="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:border-blue-400 focus:outline-none"
                            [class.border-red-400]="submitted && !row.Date" />
                    </td>
                    <!-- Category -->
                    <td class="px-2 py-1.5">
                        <nz-select [(ngModel)]="row.ExpenseCategoryID"
                            nzPlaceHolder="Select"
                            [nzShowSearch]="true"
                            class="w-full text-sm"
                            [class.ng-invalid]="submitted && !row.ExpenseCategoryID">
                            @for (c of categories; track c.ID) {
                                <nz-option [nzValue]="c.ID" [nzLabel]="c.Description" />
                            }
                        </nz-select>
                    </td>
                    <!-- Vendor -->
                    <td class="px-2 py-1.5">
                        <nz-select [(ngModel)]="row.VendorID"
                            nzPlaceHolder="Optional"
                            [nzShowSearch]="true"
                            [nzAllowClear]="true"
                            class="w-full text-sm">
                            @for (v of vendors; track v.ID) {
                                <nz-option [nzValue]="v.ID" [nzLabel]="v.DisplayName" />
                            }
                        </nz-select>
                    </td>
                    <!-- Amount -->
                    <td class="px-2 py-1.5">
                        <input type="number" [(ngModel)]="row.Amount" min="0" placeholder="0"
                            class="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:border-blue-400 focus:outline-none"
                            [class.border-red-400]="submitted && !row.Amount" />
                    </td>
                    <!-- Notes -->
                    <td class="px-2 py-1.5">
                        <input type="text" [(ngModel)]="row.Notes" placeholder="Optional"
                            class="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:border-blue-400 focus:outline-none" />
                    </td>
                    <!-- Remove -->
                    <td class="px-2 py-1.5 text-center">
                        @if (rows.length > 1) {
                            <button (click)="removeRow($index)"
                                class="text-gray-400 hover:text-red-500 transition-colors">
                                <mat-icon class="icon-size-4" svgIcon="mat_outline:delete"></mat-icon>
                            </button>
                        }
                    </td>
                </tr>
                }
            </tbody>
        </table>
    </div>

    <!-- Add Row -->
    <div class="flex items-center justify-between">
        <button (click)="addRow()"
            class="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
            <mat-icon class="icon-size-4" svgIcon="mat_outline:add_circle"></mat-icon>
            Add Another Row
        </button>
        <span class="text-xs text-gray-400">{{ rows.length }} row{{ rows.length > 1 ? 's' : '' }}</span>
    </div>

    <!-- Validation error -->
    @if (submitted && validationError) {
        <div class="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
            {{ validationError }}
        </div>
    }

    <!-- Footer buttons -->
    <div class="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <button (click)="cancel()"
            class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
        </button>
        <button (click)="save()" [disabled]="isSaving"
            class="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {{ isSaving ? 'Saving...' : 'Save ' + rows.length + ' Expense' + (rows.length > 1 ? 's' : '') }}
        </button>
    </div>
</div>
    `,
})
export class ExpenseMultiFormComponent implements OnInit {
    private _modalRef = inject(NzModalRef);
    private _drp = inject(DrpService);
    private _list = inject(ListService);
    private _http = inject(HttpClient);
    private _localStorage = inject(LocalStorageService);
    readonly nzModalData = inject(NZ_MODAL_DATA);

    pettyCashId: number = 0;
    pettyCashName: string = '';
    categories: any[] = [];
    vendors: any[] = [];
    rows: ExpenseRow[] = [];
    submitted = false;
    isSaving = false;
    validationError = '';

    ngOnInit() {
        this.pettyCashId = this.nzModalData?.Data?.PettyCashID || 0;
        this.pettyCashName = this.nzModalData?.Data?.PettyCashName || '';
        this.addRow();
        this.loadDropdowns();
    }

    loadDropdowns() {
        this._list.getExpenseCategory().subscribe({ next: (r: any[]) => { this.categories = r; } });
        this._drp.getVendorDrp().subscribe({
            next: (r: any[]) => {
                this.vendors = r.map(v => ({ ...v, DisplayName: v.ContactName ? `${v.Name} - ${v.ContactName}` : v.Name }));
            }
        });
    }

    addRow() {
        const today = new Date().toISOString().split('T')[0];
        this.rows.push({ Date: today, ExpenseCategoryID: null, VendorID: null, Amount: null, Notes: '' });
    }

    removeRow(index: number) {
        this.rows.splice(index, 1);
    }

    validate(): boolean {
        for (let i = 0; i < this.rows.length; i++) {
            const r = this.rows[i];
            if (!r.Date) { this.validationError = `Row ${i + 1}: Date is required.`; return false; }
            if (!r.ExpenseCategoryID) { this.validationError = `Row ${i + 1}: Category is required.`; return false; }
            if (!r.Amount || r.Amount <= 0) { this.validationError = `Row ${i + 1}: Amount must be greater than 0.`; return false; }
        }
        this.validationError = '';
        return true;
    }

    save() {
        this.submitted = true;
        if (!this.validate()) return;

        this.isSaving = true;
        const headers = new HttpHeaders({
            uid: this._localStorage.uid,
            cid: this._localStorage.cid,
            eid: this._localStorage.eid,
        });

        const items = this.rows.map(r => ({
            Date: r.Date,
            ExpenseCategoryID: r.ExpenseCategoryID,
            VendorID: r.VendorID || null,
            Amount: r.Amount,
            Notes: r.Notes || '',
            PettyCashID: this.pettyCashId || null,
        }));

        this._http.post<any>(`${apiUrls.server}api/expense/bulk`, { items }, { headers }).subscribe({
            next: (res) => {
                this.isSaving = false;
                if (res.Success) {
                    this._modalRef.destroy(true);
                } else {
                    this.validationError = res.Message || 'Save failed.';
                }
            },
            error: () => {
                this.isSaving = false;
                this.validationError = 'Server error. Please try again.';
            },
        });
    }

    cancel() {
        this._modalRef.destroy(false);
    }
}
