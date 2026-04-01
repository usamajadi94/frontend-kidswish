import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { ListService } from 'app/modules/shared/services/list.service';
import { DrpService } from 'app/modules/shared/services/drp.service';

@Component({
    selector: 'app-account-statement',
    standalone: true,
    imports: [CommonModule, FormsModule, NzDatePickerModule, NzSelectModule, CurrencyPipe, DatePipe],
    templateUrl: './account-statement.component.html',
})
export class AccountStatementComponent implements OnInit {
    private _listService = inject(ListService);
    private _drpService  = inject(DrpService);

    bankAccounts: any[] = [];
    selectedAccount: any = null;
    dateRange: Date[] = [];
    rows: any[] = [];
    openingBalance = 0;
    isLoading = false;

    get totalCredit(): number  { return this.rows.reduce((s, r) => s + (+r.Credit || 0), 0); }
    get totalDebit():  number  { return this.rows.reduce((s, r) => s + (+r.Debit  || 0), 0); }
    get closingBalance(): number { return this.openingBalance + this.totalCredit - this.totalDebit; }

    txBadgeClass(type: string): string {
        const m: Record<string, string> = {
            received: 'bg-green-100 text-green-800', payment: 'bg-red-100 text-red-800',
            topup: 'bg-blue-100 text-blue-800', transfer: 'bg-purple-100 text-purple-800',
        };
        return m[type] || 'bg-gray-100 text-gray-700';
    }

    txLabel(type: string): string {
        const m: Record<string, string> = { received: 'Received', payment: 'Payment', topup: 'PC Topup', transfer: 'Transfer' };
        return m[type] || type;
    }

    ngOnInit() {
        this._drpService.getBankAccountDrp().subscribe({ next: (res: any) => { this.bankAccounts = res || []; } });
    }

    load() {
        if (!this.selectedAccount) { this.rows = []; return; }
        this.isLoading = true;
        const from = this.dateRange?.[0]?.toISOString() || '';
        const to   = this.dateRange?.[1]?.toISOString() || '';
        this._listService.getAccountStatementReport(this.selectedAccount, from, to).subscribe({
            next: (res: any[]) => {
                let balance = this.openingBalance;
                this.rows = (res || []).map(r => {
                    balance += (+r.Credit || 0) - (+r.Debit || 0);
                    return { ...r, RunningBalance: balance };
                });
                this.isLoading = false;
            },
            error: () => { this.isLoading = false; },
        });
        // fetch opening balance from summary
        this._listService.getBankAccountSummary(this.selectedAccount).subscribe({
            next: (res: any[]) => { this.openingBalance = +(res?.[0]?.OpeningBalance || 0); },
        });
    }

    onAccountChange() { this.load(); }
    onDateChange(dates: Date[]) { this.dateRange = dates || []; this.load(); }

    get selectedAccountName(): string {
        return this.bankAccounts.find(a => a.ID === this.selectedAccount)?.Name || '';
    }
}
