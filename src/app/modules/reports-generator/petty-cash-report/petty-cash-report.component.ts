import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { ListService } from 'app/modules/shared/services/list.service';
import { DrpService } from 'app/modules/shared/services/drp.service';

@Component({
    selector: 'app-petty-cash-report',
    standalone: true,
    imports: [CommonModule, FormsModule, NzDatePickerModule, NzSelectModule, CurrencyPipe, DatePipe],
    templateUrl: './petty-cash-report.component.html',
})
export class PettyCashReportComponent implements OnInit {
    private _listService = inject(ListService);
    private _drpService  = inject(DrpService);

    pettyCashList: any[] = [];
    selectedPettyCash: any = null;
    dateRange: Date[] = [];
    rows: any[] = [];
    isLoading = false;

    get grandTotal(): number { return this.rows.reduce((s, r) => s + (+r.Amount || 0), 0); }

    ngOnInit() {
        this._drpService.getPettyCashDrp().subscribe({ next: (res: any) => { this.pettyCashList = res || []; } });
        const today = new Date();
        this.dateRange = [new Date(today.getFullYear(), today.getMonth(), 1), today];
        this.load();
    }

    load() {
        this.isLoading = true;
        const from = this.dateRange?.[0]?.toISOString() || '';
        const to   = this.dateRange?.[1]?.toISOString() || '';
        this._listService.getPettyCashReport(this.selectedPettyCash, from, to).subscribe({
            next: (res: any[]) => { this.rows = res || []; this.isLoading = false; },
            error: () => { this.isLoading = false; },
        });
    }

    onFilterChange() { this.load(); }
    onDateChange(dates: Date[]) { this.dateRange = dates || []; this.load(); }
}
