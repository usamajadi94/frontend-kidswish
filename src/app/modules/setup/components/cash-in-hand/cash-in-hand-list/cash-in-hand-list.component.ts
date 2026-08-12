import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ListService } from 'app/modules/shared/services/list.service';
import { ExportService } from 'app/modules/shared/services/export.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { LocalStorageService } from 'app/core/auth/localStorage.service';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { CashInHandFormComponent } from '../cash-in-hand-form.component';
import { PaymentReceivedFormComponent } from '../../payment-received/payment-received-form.component';
import { AccountTransferFormComponent } from '../../bank-account/account-transfer-form.component';

const CATEGORY_COLORS = [
    { bg: 'bg-blue-100',   text: 'text-blue-700'   },
    { bg: 'bg-purple-100', text: 'text-purple-700' },
    { bg: 'bg-orange-100', text: 'text-orange-700' },
    { bg: 'bg-teal-100',   text: 'text-teal-700'   },
    { bg: 'bg-pink-100',   text: 'text-pink-700'   },
    { bg: 'bg-indigo-100', text: 'text-indigo-700' },
    { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    { bg: 'bg-cyan-100',   text: 'text-cyan-700'   },
];

@Component({
    selector: 'app-cash-in-hand-list',
    standalone: true,
    imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe,
              NzDatePickerModule, NzButtonModule,
              BftButtonComponent, WrapperAddComponent],
    templateUrl: './cash-in-hand-list.component.html',
})
export class CashInHandListComponent extends BaseRoutedComponent {
    private _listService = inject(ListService);
    private _modalService = inject(ModalService);
    private _exportService = inject(ExportService);
    private _localStorage = inject(LocalStorageService);
    title = componentRegister.cashInHand.Title;
    summary: any = null;
    ledger: any[] = [];
    isLoading = false;
    dateRange: Date[] = [];
    selectedCategories: string[] = [];
    selectedSubCategories: string[] = [];
    minDate: Date | null = null;

    disabledDate = (d: Date): boolean => !!this.minDate && d < this.minDate;

    private _colorMap = new Map<string, (typeof CATEGORY_COLORS)[0]>();
    private _colorIndex = 0;

    getCategoryColor(cat: string): (typeof CATEGORY_COLORS)[0] {
        if (!cat) return CATEGORY_COLORS[0];
        if (!this._colorMap.has(cat)) {
            this._colorMap.set(cat, CATEGORY_COLORS[this._colorIndex % CATEGORY_COLORS.length]);
            this._colorIndex++;
        }
        return this._colorMap.get(cat);
    }

    get uniqueCategories(): string[] {
        return [...new Set(this.ledger.map(r => r.Category).filter(Boolean))];
    }

    get uniqueSubCategories(): string[] {
        return [...new Set(this.ledger.map(r => r.SubCategory).filter(Boolean))];
    }

    get filteredLedger(): any[] {
        let rows = this.ledger;
        if (this.selectedCategories?.length)
            rows = rows.filter(r => this.selectedCategories.includes(r.Category));
        if (this.selectedSubCategories?.length)
            rows = rows.filter(r => this.selectedSubCategories.includes(r.SubCategory));
        return rows;
    }

    get exportColumns() {
        return [
            { header: 'Date', name: 'Date', type: 'date' },
            { header: 'Party', name: 'Vendor', type: 'text' },
            { header: 'Category', name: 'Category', type: 'text' },
            { header: 'Sub Category', name: 'SubCategory', type: 'text' },
            { header: 'Notes', name: 'Notes', type: 'text' },
            { header: 'Cash In', name: 'CashIn', type: 'currency' },
            { header: 'Cash Out', name: 'CashOut', type: 'currency' },
            { header: 'Balance', name: 'Balance', type: 'currency' },
        ];
    }

    exportToExcel() {
        this._exportService.exportToExcel(this.exportColumns, this.filteredLedger, this.title);
    }

    get openingAsOf(): string {
        const d = this.dateRange?.[0];
        if (!d) return '';
        const prev = new Date(d);
        prev.setDate(prev.getDate() - 1);
        return `${('0'+prev.getDate()).slice(-2)}/${('0'+(prev.getMonth()+1)).slice(-2)}/${prev.getFullYear()}`;
    }

    get totalCashIn(): number  { return this.filteredLedger.reduce((s, r) => s + (+r.CashIn  || 0), 0); }
    get totalCashOut(): number { return this.filteredLedger.reduce((s, r) => s + (+r.CashOut || 0), 0); }
    get currentBalance(): number {
        return (+this.summary?.OpeningBalance || 0) + this.totalCashIn - this.totalCashOut;
    }

    ngOnInit() {
        const cid = this._localStorage.cid;
        const today = new Date();
        this._listService.getSystemConfig().subscribe({
            next: (cfg) => {
                const raw = cfg[`cih_start_date_${cid}`]
                    || (String(cid) === '24' ? '2026-08-01' : null);
                if (raw) {
                    this.minDate = new Date(raw);
                    this.dateRange = [this.minDate, today];
                } else {
                    this.dateRange = [new Date(today.getFullYear(), today.getMonth(), 1), today];
                }
                this.loadAll();
            },
            error: () => {
                if (String(cid) === '24') {
                    this.minDate = new Date('2026-08-01');
                    this.dateRange = [this.minDate, today];
                } else {
                    this.dateRange = [new Date(today.getFullYear(), today.getMonth(), 1), today];
                }
                this.loadAll();
            },
        });
    }

    loadAll() {
        this.isLoading = true;
        const from = this.fmt(this.dateRange?.[0]);
        const to   = this.fmt(this.dateRange?.[1]);
        this._listService.getCashInHandSummary(from, to).subscribe({
            next: (res: any[]) => { this.summary = res?.[0] || null; },
        });
        this._listService.getCashInHandLedger(from, to).subscribe({
            next: (res: any[]) => { this.ledger = res || []; this.isLoading = false; },
            error: () => { this.isLoading = false; },
        });
    }

    onDateChange(dates: Date[]) {
        this.dateRange = dates || [];
        this.loadAll();
    }

    onView(row: any) {
        if (row.Source === 'dist_cash_in') return;
        if (row.Source === 'payment') {
            this._modalService.openModal({
                component: PaymentReceivedFormComponent,
                title: 'Payment Received',
                ID: row.ID - 3000000000,
            }).afterClose.subscribe((res: boolean) => { if (res) this.loadAll(); });
        } else if (row.Source === 'transfer') {
            const transferId = row.ID >= 5000000000 ? row.ID - 5000000000 : row.ID - 4000000000;
            this._modalService.openModal({
                component: AccountTransferFormComponent,
                title: 'Account Transfer',
                ID: transferId,
            }).afterClose.subscribe((res: boolean) => { if (res) this.loadAll(); });
        } else {
            this._modalService.openModal({
                component: CashInHandFormComponent,
                title: this.title,
                ID: row.ID,
            }).afterClose.subscribe((res: boolean) => { if (res) this.loadAll(); });
        }
    }

    addNew() {
        this._modalService.openModal({
            component: CashInHandFormComponent,
            title: this.title,
            ID: null,
        }).afterClose.subscribe((res: boolean) => { if (res) this.loadAll(); });
    }

    toggleCategory(cat: string) {
        if (this.selectedCategories.includes(cat)) {
            this.selectedCategories = this.selectedCategories.filter(c => c !== cat);
        } else {
            this.selectedCategories = [...this.selectedCategories, cat];
        }
    }

    toggleSubCategory(sub: string) {
        if (this.selectedSubCategories.includes(sub)) {
            this.selectedSubCategories = this.selectedSubCategories.filter(s => s !== sub);
        } else {
            this.selectedSubCategories = [...this.selectedSubCategories, sub];
        }
    }

    private fmt(d: Date): string {
        if (!d) return '';
        return `${d.getFullYear()}-${('0'+(d.getMonth()+1)).slice(-2)}-${('0'+d.getDate()).slice(-2)}`;
    }
}
