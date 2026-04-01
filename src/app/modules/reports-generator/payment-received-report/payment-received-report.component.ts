import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ReportService } from 'app/modules/shared/services/report.service';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { BftButtonComponent } from '../../shared/components/buttons/bft-button/bft-button.component';
import { BftInputDateComponent } from '../../shared/components/fields/bft-input-date/bft-input-date.component';
import { ReportViewerToolComponent } from '../report-viewer-tool/report-viewer-tool.component';

@Component({
    selector: 'app-payment-received-report',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        BftInputDateComponent,
        BftButtonComponent,
        NzDrawerModule,
        ReportViewerToolComponent,
        MatIconModule,
    ],
    providers: [CurrencyPipe],
    templateUrl: './payment-received-report.component.html',
})
export class PaymentReceivedReportComponent {
    private _ReportService = inject(ReportService);

    records: any[] = [];
    fromDate: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    endDate: Date = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    IsFilterDrawerVisible = false;
    currentPageIndex = 0;

    get grandTotal(): number {
        return this.records.reduce((sum, r) => sum + (r.Amount || 0), 0);
    }

    ngOnInit(): void {
        this.onGenerate();
    }

    onGenerate(): void {
        this._ReportService.getPaymentReceivedReport(this.fromDate, this.endDate).subscribe({
            next: (res: any) => {
                this.records = res;
                this.IsFilterDrawerVisible = false;
            },
        });
    }

    onReset(): void {
        this.fromDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        this.endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
        this.onGenerate();
    }

    open(event: boolean): void { if (event) this.IsFilterDrawerVisible = true; }
    close(): void { this.IsFilterDrawerVisible = false; }
    onPageIndexChanged(i: number): void { this.currentPageIndex = i; }
}
