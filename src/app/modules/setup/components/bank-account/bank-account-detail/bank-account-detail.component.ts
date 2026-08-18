import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { ListService } from 'app/modules/shared/services/list.service';
import { ExportService } from 'app/modules/shared/services/export.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BankAccountFormComponent } from '../bank-account-form.component';
import { AccountTransferFormComponent } from '../account-transfer-form.component';

@Component({
    selector: 'app-bank-account-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, NzDatePickerModule, NzTabsModule, NzSelectModule, CurrencyPipe, DatePipe, BftButtonComponent],
    templateUrl: './bank-account-detail.component.html',
    styleUrl: './bank-account-detail.component.scss',
})
export class BankAccountDetailComponent implements OnInit {
    private _listService = inject(ListService);
    private _modalService = inject(ModalService);
    private _exportService = inject(ExportService);
    private _route = inject(ActivatedRoute);
    private _router = inject(Router);

    accountId: number = 0;
    summary: any = null;
    ledger: any[] = [];
    isLoading = false;
    dateRange: Date[] = [];
    selectedCounterparty: string | null = null;

    get uniqueCounterparties(): string[] {
        return [...new Set(this.ledger.map(r => r.Counterparty).filter(Boolean))].sort();
    }

    get ledgerWithBalance(): any[] {
        let balance = +(this.summary?.OpeningBalance || 0);
        return this.ledger.map(r => {
            balance += (+r.Credit || 0) - (+r.Debit || 0);
            return { ...r, Balance: balance };
        });
    }

    get filteredLedger(): any[] {
        return this.selectedCounterparty
            ? this.ledgerWithBalance.filter(r => r.Counterparty === this.selectedCounterparty)
            : this.ledgerWithBalance;
    }

    get totalCredits(): number {
        return this.filteredLedger.reduce((s, r) => s + (+r.Credit || 0), 0);
    }

    get totalDebits(): number {
        return this.filteredLedger.reduce((s, r) => s + (+r.Debit || 0), 0);
    }

    get exportColumns() {
        return [
            { header: 'Date', name: 'Date', type: 'date' },
            { header: 'Description', name: 'Description', type: 'text' },
            { header: 'Counterparty', name: 'Counterparty', type: 'text' },
            { header: 'Payment Type', name: 'PaymentType', type: 'text' },
            { header: 'Notes', name: 'Notes', type: 'text' },
            { header: 'Credit', name: 'Credit', type: 'currency' },
            { header: 'Debit', name: 'Debit', type: 'currency' },
            { header: 'Balance', name: 'Balance', type: 'currency' },
        ];
    }

    exportToExcel() {
        const accountName = this.summary?.Name;
        const fileName = [accountName, this.selectedCounterparty].filter(Boolean).join(' - ') || 'Bank Account Ledger';
        this._exportService.exportToExcel(this.exportColumns, this.filteredLedger, fileName);
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
        this.loadSummary();
        this.loadLedger();
    }

    loadSummary() {
        const from = this.dateRange?.[0]?.toISOString() || '';
        const to   = this.dateRange?.[1]?.toISOString() || '';
        this._listService.getBankAccountSummary(this.accountId, from, to).subscribe({
            next: (res: any[]) => { this.summary = res?.[0] || null; },
        });
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
        this.loadSummary();
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
