import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { BftInputDateComponent } from 'app/modules/shared/components/fields/bft-input-date/bft-input-date.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexOptions } from 'ng-apexcharts';
import { ListService } from 'app/modules/shared/services/list.service';
import { DateTime } from 'luxon';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        MatIconModule,
        BftInputDateComponent,
        FormsModule,
        MatMenuModule,
        NgApexchartsModule,
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
    private _listService = inject(ListService);

    currentMonth: Date = new Date();
    
    // Dashboard totals
    totalInvoice: number = 0;
    totalCustomerOrders: number = 0;
    expenseUS: number = 0;
    expenseDR: number = 0;
    
    // Chart options
    expenseUSChartOptions: ApexOptions = {} as ApexOptions;
    expenseDRChartOptions: ApexOptions = {} as ApexOptions;
    top3ProductsChartOptions: ApexOptions = {} as ApexOptions;
    
    // Chart series
    expenseUSSeries: any[] = [];
    expenseDRSeries: any[] = [];
    top3ProductsSeries: any[] = [];

    ngOnInit() {
        this.loadDashboardData();
    }

    onMonthChange() {
        this.loadDashboardData();
    }

    loadDashboardData() {
        this._listService.getDashboardData(this.currentMonth).subscribe({
            next: (res: any) => {
                // Process value array for totals
                if (res?.value && res.value.length > 0) {
                    const data = res.value[0];
                    this.totalInvoice = data.TotalInvoice || 0;
                    this.totalCustomerOrders = data.TotalCustomerOrders || 0;
                    this.expenseUS = data.TotalExpense || 0;
                    this.expenseDR = data.TotalExpenseDR || 0;
                }

                // Process Table1 - Expense by Category (US)
                const table1 = res?.Table1 || [];
                this.loadExpenseUSChart(table1);

                // Process Table2 - Expense by Category (DR)
                const table2 = res?.Table2 || [];
                this.loadExpenseDRChart(table2);

                // Process Table3 - Top 3 Products
                const table3 = res?.Table3 || [];
                this.loadTop3ProductsChart(table3);
            },
            error: (err) => {
                console.error('Error fetching dashboard data:', err);
            }
        });
    }

    loadExpenseUSChart(data: any[]) {
        const categories = data.map(item => item.CategoryName || 'Uncategorized');
        const amounts = data.map(item => item.TotalExpense || 0);

        this.expenseUSSeries = [{
            name: 'Expense',
            data: amounts
        }];

        this.expenseUSChartOptions = {
            chart: {
                type: 'bar',
                height: 350,
                toolbar: {
                    show: false
                }
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    borderRadius: 4
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent']
            },
            xaxis: {
                categories: categories
            },
            yaxis: {
                title: {
                    text: 'Amount ($)'
                }
            },
            fill: {
                opacity: 1,
                colors: ['#ef4444']
            },
            tooltip: {
                y: {
                    formatter: (val: number) => `$${val.toLocaleString()}`
                }
            },
            colors: ['#ef4444']
        } as ApexOptions;
    }

    loadExpenseDRChart(data: any[]) {
        const categories = data.map(item => item.CategoryName || 'Uncategorized');
        const amounts = data.map(item => item.TotalExpense || 0);

        this.expenseDRSeries = [{
            name: 'Expense',
            data: amounts
        }];

        this.expenseDRChartOptions = {
            chart: {
                type: 'bar',
                height: 350,
                toolbar: {
                    show: false
                }
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    borderRadius: 4
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent']
            },
            xaxis: {
                categories: categories
            },
            yaxis: {
                title: {
                    text: 'Amount ($)'
                }
            },
            fill: {
                opacity: 1,
                colors: ['#dc2626']
            },
            tooltip: {
                y: {
                    formatter: (val: number) => `$${val.toLocaleString()}`
                }
            },
            colors: ['#dc2626']
        } as ApexOptions;
    }

    loadTop3ProductsChart(data: any[]) {
        // Get top 3 products
        const sortedProducts = [...data]
            .sort((a, b) => (b.TotalSales || 0) - (a.TotalSales || 0))
            .slice(0, 3);

        const productNames = sortedProducts.map(p => p.ProductName || 'Unknown');
        const sales = sortedProducts.map(p => p.TotalSales || 0);

        this.top3ProductsSeries = [{
            name: 'Sales',
            data: sales
        }];

        this.top3ProductsChartOptions = {
            chart: {
                type: 'bar',
                height: 300,
                toolbar: {
                    show: false
                }
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    borderRadius: 4
                }
            },
            dataLabels: {
                enabled: true,
                formatter: (val: number) => val.toString()
            },
            xaxis: {
                categories: productNames,
                title: {
                    text: 'Sales'
                }
            },
            yaxis: {
                title: {
                    // text: 'Products'
                    text: 'Flavors'
                }
            },
            fill: {
                opacity: 1,
                colors: ['#f59e0b']
            },
            tooltip: {
                y: {
                    formatter: (val: number) => `${val} units`
                }
            },
            colors: ['#f59e0b']
        } as ApexOptions;
    }
}
