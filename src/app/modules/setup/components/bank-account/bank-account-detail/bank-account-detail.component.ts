import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BankAccountFormComponent } from '../bank-account-form.component';
import { AccountTransferFormComponent } from '../account-transfer-form.component';

@Component({
    selector: 'app-bank-account-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, NzDatePickerModule, NzTabsModule, CurrencyPipe, DatePipe, BftButtonComponent],
    templateUrl: './bank-account-detail.component.html',
    styleUrl: './bank-account-detail.component.scss',
})
export class BankAccountDetailComponent implements OnInit {
    private _listService = inject(ListService);
    private _modalService = inject(ModalService);
    private _route = inject(ActivatedRoute);
    private _router = inject(Router);

    accountId: number = 0;
    summary: any = null;
    ledger: any[] = [];
    isLoading = false;
    dateRange: Date[] = [];

    get totalCredits(): number {
        return this.ledger.reduce((s, r) => s + (+r.Credit || 0), 0);
    }

    get totalDebits(): number {
        return this.ledger.reduce((s, r) => s + (+r.Debit || 0), 0);
    }

    ngOnInit() {
        this.accountId = +this._route.snapshot.params['id'];
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        this.dateRange = [firstDay, today];
        this.loadAll();
    }

    loadAll() {
        this.isLoading = true;
        this._listService.getBankAccountSummary(this.accountId).subscribe({
            next: (res: any[]) => { this.summary = res?.[0] || null; },
        });
        this.loadLedger();
    }

    loadLedger() {
        const from = this.dateRange?.[0]?.toISOString() || '';
        const to   = this.dateRange?.[1]?.toISOString() || '';
        this._listService.getBankAccountLedger(this.accountId, from, to).subscribe({
            next: (res: any[]) => { this.ledger = res || []; this.isLoading = false; },
            error: () => { this.isLoading = false; },
        });
    }

    onDateChange(dates: Date[]) {
        this.dateRange = dates || [];
        this.loadLedger();
    }

    openTransfer() {
        this._modalService.openModal({ component: AccountTransferFormComponent, title: 'Account Transfer' }, 700)
            .afterClose.subscribe((res: boolean) => { if (res) this.loadAll(); });
    }

    openEdit() {
        this._modalService.openModal({ component: BankAccountFormComponent, title: 'Edit Bank Account', ID: this.accountId })
            .afterClose.subscribe((res: boolean) => { if (res) this.loadAll(); });
    }

    goBack() {
        this._router.navigate(['/setup/bank-account-list']);
    }
}
