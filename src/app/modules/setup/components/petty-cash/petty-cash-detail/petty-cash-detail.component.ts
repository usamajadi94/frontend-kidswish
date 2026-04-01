import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { PettyCashFormComponent } from '../petty-cash-form.component';
import { PettyCashFundComponent } from '../petty-cash-fund.component';
import { ExpenseFormComponent } from '../../expense/expense-form.component';
import { componentRegister } from 'app/modules/shared/services/component-register';

@Component({
    selector: 'app-petty-cash-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, NzDatePickerModule, NzTabsModule, CurrencyPipe, DatePipe, BftButtonComponent],
    templateUrl: './petty-cash-detail.component.html',
    styleUrl: './petty-cash-detail.component.scss',
})
export class PettyCashDetailComponent implements OnInit {
    private _listService = inject(ListService);
    private _modalService = inject(ModalService);
    private _route = inject(ActivatedRoute);
    private _router = inject(Router);

    pettyCashId: number = 0;
    summary: any = null;
    expenses: any[] = [];
    funding: any[] = [];
    isLoading = false;
    dateRange: Date[] = [];

    get totalExpenses(): number {
        return this.expenses.reduce((s, r) => s + (+r.Amount || 0), 0);
    }

    ngOnInit() {
        this.pettyCashId = +this._route.snapshot.params['id'];
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        this.dateRange = [firstDay, today];
        this.loadAll();
    }

    loadAll() {
        this.isLoading = true;
        this._listService.getPettyCashSummary(this.pettyCashId).subscribe({
            next: (res: any[]) => { this.summary = res?.[0] || null; },
        });
        this.loadExpenses();
        this._listService.getPettyCashFunding(this.pettyCashId).subscribe({
            next: (res: any[]) => { this.funding = res || []; this.isLoading = false; },
            error: () => { this.isLoading = false; },
        });
    }

    loadExpenses() {
        const from = this.dateRange?.[0]?.toISOString() || '';
        const to   = this.dateRange?.[1]?.toISOString() || '';
        this._listService.getPettyCashExpenses(this.pettyCashId, from, to).subscribe({
            next: (res: any[]) => { this.expenses = res || []; },
        });
    }

    onDateChange(dates: Date[]) {
        this.dateRange = dates || [];
        this.loadExpenses();
    }

    openAddFunds() {
        this._modalService.openModal({ component: PettyCashFundComponent, title: 'Add Funds to Petty Cash' }, 700)
            .afterClose.subscribe((res: boolean) => { if (res) this.loadAll(); });
    }

    openAddExpense() {
        this._modalService.openModal({ component: ExpenseFormComponent, title: componentRegister.expense.Title, Data: { PettyCashID: this.pettyCashId } }, 1000)
            .afterClose.subscribe((res: boolean) => { if (res) this.loadExpenses(); });
    }

    viewExpense(row: any) {
        this._modalService.openModal({ component: ExpenseFormComponent, title: componentRegister.expense.Title, ID: row.ID }, 1000)
            .afterClose.subscribe((res: boolean) => { if (res) this.loadExpenses(); });
    }

    openEdit() {
        this._modalService.openModal({ component: PettyCashFormComponent, title: 'Edit Petty Cash', ID: this.pettyCashId })
            .afterClose.subscribe((res: boolean) => { if (res) this.loadAll(); });
    }

    goBack() {
        this._router.navigate(['/setup/petty-cash-list']);
    }
}
