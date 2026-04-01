import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexOptions } from 'ng-apexcharts';
import { forkJoin } from 'rxjs';
import { ListService } from 'app/modules/shared/services/list.service';
import { MatIconModule } from '@angular/material/icon';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, CurrencyPipe, DatePipe, NgApexchartsModule, MatIconModule, NzDatePickerModule, FormsModule],
    templateUrl: './admin-dashboard.component.html',
    styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
    private _listService = inject(ListService);
    private _router = inject(Router);

    isLoading = true;
    today = new Date();

    dateRange: [Date, Date] = [
        new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        new Date(),
    ];

    summary: any = {};
    bankAccounts: any[] = [];
    pettyCashAccounts: any[] = [];
    recentTransactions: any[] = [];

    monthlyFlowSeries: any[] = [];
    monthlyFlowOptions: ApexOptions = {} as ApexOptions;

    expenseSeries: any[] = [];
    expenseOptions: ApexOptions = {} as ApexOptions;
    hasExpenseData = false;

    ngOnInit() {
        this.load();
    }

    private fmtDate(d: Date): string {
        return d.toISOString().split('T')[0];
    }

    onDateRangeChange(dates: [Date, Date] | null) {
        if (dates && dates[0] && dates[1]) {
            this.dateRange = dates;
            this.load();
        }
    }

    load() {
        this.isLoading = true;
        const from = this.dateRange?.[0] ? this.fmtDate(this.dateRange[0]) : '';
        const to   = this.dateRange?.[1] ? this.fmtDate(this.dateRange[1]) : '';
        forkJoin({
            summary:  this._listService.getAdminDashboardSummary(from, to),
            banks:    this._listService.getAdminBankBalances(),
            petty:    this._listService.getAdminPettyCashStatus(),
            expenses: this._listService.getAdminExpenseByCategory(from, to),
            flow:     this._listService.getAdminMonthlyFlow(),
            recent:   this._listService.getAdminRecentTransactions(),
        }).subscribe({
            next: (res: any) => {
                this.summary          = res.summary?.[0] || {};
                this.bankAccounts     = res.banks   || [];
                this.pettyCashAccounts= res.petty   || [];
                this.recentTransactions = res.recent || [];
                this.buildFlowChart(res.flow || []);
                this.buildExpenseChart(res.expenses || []);
                this.isLoading = false;
            },
            error: () => { this.isLoading = false; },
        });
    }

    buildFlowChart(data: any[]) {
        const months = data.map(r => r.Month);
        this.monthlyFlowSeries = [
            { name: 'Received',  data: data.map(r => +r.Received  || 0) },
            { name: 'Payments',  data: data.map(r => +r.Payments  || 0) },
            { name: 'Expenses',  data: data.map(r => +r.Expenses  || 0) },
        ];
        this.monthlyFlowOptions = {
            chart: { type: 'bar', height: 280, toolbar: { show: false }, fontFamily: 'inherit' },
            plotOptions: { bar: { horizontal: false, columnWidth: '55%', borderRadius: 3 } },
            dataLabels: { enabled: false },
            xaxis: { categories: months, labels: { style: { fontSize: '11px' } } },
            yaxis: { labels: { formatter: (v) => 'PKR ' + (+v / 1000).toFixed(0) + 'k', style: { fontSize: '11px' } } },
            legend: { position: 'top', fontSize: '12px' },
            grid: { borderColor: '#f0f0f0' },
            colors: ['#22c55e', '#ef4444', '#f97316'],
            tooltip: { y: { formatter: (v) => 'PKR ' + (+v).toLocaleString() } },
        } as ApexOptions;
    }

    buildExpenseChart(data: any[]) {
        this.hasExpenseData = data.length > 0 && data.some(r => +r.Amount > 0);
        this.expenseSeries = data.map(r => +r.Amount || 0);
        this.expenseOptions = {
            chart: { type: 'donut', height: 280, fontFamily: 'inherit' },
            labels: data.map(r => r.Category || 'Uncategorized'),
            legend: { position: 'bottom', fontSize: '11px' },
            dataLabels: { enabled: true, formatter: (_v: any, opts: any) => opts.w.globals.labels[opts.seriesIndex] },
            tooltip: { y: { formatter: (v) => 'PKR ' + (+v).toLocaleString() } },
            colors: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6', '#f43f5e', '#a855f7'],
            plotOptions: { pie: { donut: { size: '60%', labels: { show: true, total: { show: true, label: 'Total', formatter: (w: any) => 'PKR ' + w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toLocaleString() } } } } },
        } as ApexOptions;
    }

    pettyCashPercent(a: any): number {
        const funded = +a.TotalFunded || 0;
        const balance = +a.Balance || 0;
        if (funded <= 0) return 0;
        return Math.min(100, Math.round((balance / funded) * 100));
    }

    txBadge(type: string): string {
        const m: Record<string, string> = {
            received: 'bg-green-100 text-green-700',
            payment: 'bg-red-100 text-red-700',
            topup: 'bg-blue-100 text-blue-700',
            transfer: 'bg-purple-100 text-purple-700',
        };
        return m[type] || 'bg-gray-100 text-gray-600';
    }

    txLabel(type: string): string {
        const m: Record<string, string> = {
            received: 'Received',
            payment: 'Payment',
            topup: 'Topup',
            transfer: 'Transfer',
        };
        return m[type] || type;
    }

    go(path: string) {
        this._router.navigate([path]);
    }
}
