import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { ListService } from 'app/modules/shared/services/list.service';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { componentRegister } from 'app/modules/shared/services/component-register';

@Component({
    selector: 'app-ledger',
    standalone: true,
    imports: [CommonModule, FormsModule, NzDatePickerModule, NzSelectModule, CurrencyPipe, DatePipe],
    templateUrl: './ledger.component.html',
    styleUrl: './ledger.component.scss',
})
export class LedgerComponent extends BaseRoutedComponent implements OnInit {
    private _listService = inject(ListService);
    private _drpService  = inject(DrpService);

    title = componentRegister.ledger.Title;
    dateRange: Date[] = [];
    selectedTxType: string = '';
    selectedAccount: any = null;
    bankAccounts: any[] = [];
    rows: any[] = [];
    isLoading = false;

    txTypes = [
        { id: '',         label: 'All Types' },
        { id: 'received', label: 'Payment Received' },
        { id: 'payment',  label: 'Payment Made' },
        { id: 'topup',    label: 'Petty Cash Topup' },
        { id: 'transfer', label: 'Account Transfer' },
    ];

    get totalReceived(): number { return this.rows.reduce((s, r) => s + (+r.Received || 0), 0); }
    get totalPayment():  number { return this.rows.reduce((s, r) => s + (+r.Payment  || 0), 0); }
    get closingBalance(): number { return this.totalReceived - this.totalPayment; }

    ngOnInit() {
        this._drpService.getBankAccountDrp().subscribe({ next: (res: any) => { this.bankAccounts = res || []; } });
        this.load();
    }

    load() {
        this.isLoading = true;
        const from = this.dateRange?.[0]?.toISOString() || null;
        const to   = this.dateRange?.[1]?.toISOString() || null;
        this._listService.getLedger(from, to, this.selectedTxType, this.selectedAccount).subscribe({
            next: (res: any[]) => {
                let balance = 0;
                this.rows = (res || []).map(r => {
                    balance += (+r.Received || 0) - (+r.Payment || 0);
                    return { ...r, Balance: balance };
                });
                this.isLoading = false;
            },
            error: () => { this.isLoading = false; },
        });
    }

    onDateChange(dates: Date[]) { this.dateRange = dates || []; this.load(); }
    onTxTypeChange()  { this.load(); }
    onAccountChange() { this.load(); }

    clearFilters() {
        this.dateRange       = [];
        this.selectedTxType  = '';
        this.selectedAccount = null;
        this.load();
    }

    txBadgeClass(type: string): string {
        const m: Record<string, string> = {
            received: 'bg-green-100 text-green-800',
            payment:  'bg-red-100 text-red-800',
            topup:    'bg-blue-100 text-blue-800',
            transfer: 'bg-purple-100 text-purple-800',
            opening:  'bg-gray-100 text-gray-600',
        };
        return m[type] || 'bg-gray-100 text-gray-700';
    }

    txLabel(type: string): string {
        const m: Record<string, string> = {
            received: 'Received', payment: 'Payment',
            topup: 'PC Topup', transfer: 'Transfer',
            opening: 'Opening Bal.',
        };
        return m[type] || type;
    }
}
