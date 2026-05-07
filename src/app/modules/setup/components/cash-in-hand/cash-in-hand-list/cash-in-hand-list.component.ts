import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { CashInHandFormComponent } from '../cash-in-hand-form.component';

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
              NzDatePickerModule, NzDropDownModule, NzButtonModule, NzIconModule, NzSelectModule,
              BftButtonComponent, WrapperAddComponent],
    templateUrl: './cash-in-hand-list.component.html',
})
export class CashInHandListComponent extends BaseRoutedComponent {
    private _listService = inject(ListService);
    private _modalService = inject(ModalService);
    private _drp = inject(DrpService);

    title = componentRegister.cashInHand.Title;
    paymentCategories: any[] = [];
    summary: any = null;
    ledger: any[] = [];
    isLoading = false;
    dateRange: Date[] = [];
    selectedCategories: string[] = [];

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

    get filteredLedger(): any[] {
        if (!this.selectedCategories?.length) return this.ledger;
        return this.ledger.filter(r => this.selectedCategories.includes(r.Category));
    }

    get totalCashIn(): number  { return this.filteredLedger.reduce((s, r) => s + (+r.CashIn  || 0), 0); }
    get totalCashOut(): number { return this.filteredLedger.reduce((s, r) => s + (+r.CashOut || 0), 0); }
    get currentBalance(): number {
        return (+this.summary?.OpeningBalance || 0) + this.totalCashIn - this.totalCashOut;
    }

    ngOnInit() {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        this.dateRange = [firstDay, today];
        this._drp.getPaymentCategoryDrp().subscribe({ next: (res: any) => { this.paymentCategories = res; } });
        this.loadAll();
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
        this._modalService.openModal({
            component: CashInHandFormComponent,
            title: this.title,
            ID: row.ID,
        }).afterClose.subscribe((res: boolean) => { if (res) this.loadAll(); });
    }

    addNew(categoryID: number) {
        this._modalService.openModal({
            component: CashInHandFormComponent,
            title: this.title,
            ID: null,
            Data: { PaymentCategoryID: categoryID },
        }).afterClose.subscribe((res: boolean) => { if (res) this.loadAll(); });
    }

    private fmt(d: Date): string {
        if (!d) return '';
        return `${d.getFullYear()}-${('0'+(d.getMonth()+1)).slice(-2)}-${('0'+d.getDate()).slice(-2)}`;
    }
}
