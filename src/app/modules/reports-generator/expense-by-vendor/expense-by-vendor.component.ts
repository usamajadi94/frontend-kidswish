import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { ReportService } from 'app/modules/shared/services/report.service';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { BftButtonComponent } from '../../shared/components/buttons/bft-button/bft-button.component';
import { BftInputDateComponent } from '../../shared/components/fields/bft-input-date/bft-input-date.component';
import { BftSelectComponent } from '../../shared/components/fields/bft-select/bft-select.component';
import { ReportViewerToolComponent } from '../report-viewer-tool/report-viewer-tool.component';

@Component({
    selector: 'app-expense-by-vendor',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        BftInputDateComponent,
        BftSelectComponent,
        BftButtonComponent,
        NzDrawerModule,
        ReportViewerToolComponent,
        MatIconModule,
    ],
    providers: [CurrencyPipe],
    templateUrl: './expense-by-vendor.component.html',
})
export class ExpenseByVendorComponent {
    private _DrpService = inject(DrpService);
    private _ReportService = inject(ReportService);
    private _currencyPipe = inject(CurrencyPipe);

    records: any[] = [];
    fromDate: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    endDate: Date = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    vendorID: number = null;
    vendors: any[] = [];
    IsFilterDrawerVisible = false;
    currentPageIndex = 0;

    get grandTotal(): number {
        return this.records.reduce((sum, r) => sum + (r.TotalAmount || 0), 0);
    }

    ngOnInit(): void {
        this._DrpService.getVendorDrp().subscribe({ next: (res: any) => { this.vendors = res; } });
        this.onGenerate();
    }

    onGenerate(): void {
        this._ReportService.getExpenseByVendorReport(this.fromDate, this.endDate, this.vendorID).subscribe({
            next: (res: any) => {
                this.records = res;
                this.IsFilterDrawerVisible = false;
            },
        });
    }

    onReset(): void {
        this.fromDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        this.endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
        this.vendorID = null;
        this.onGenerate();
    }

    open(event: boolean): void { if (event) this.IsFilterDrawerVisible = true; }
    close(): void { this.IsFilterDrawerVisible = false; }
    onPageIndexChanged(i: number): void { this.currentPageIndex = i; }
}
