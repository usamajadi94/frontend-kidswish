import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { CashInHandFormComponent } from '../cash-in-hand-form.component';

@Component({
    selector: 'app-cash-in-hand-list',
    standalone: true,
    imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe,
              NzDatePickerModule, NzDropDownModule, NzButtonModule, NzIconModule,
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

    get totalCashIn(): number  { return this.ledger.reduce((s, r) => s + (+r.CashIn  || 0), 0); }
    get totalCashOut(): number { return this.ledger.reduce((s, r) => s + (+r.CashOut || 0), 0); }
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
