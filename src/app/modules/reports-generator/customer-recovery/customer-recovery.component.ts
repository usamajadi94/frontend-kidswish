import { CommonModule, CurrencyPipe, formatDate } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftInputDateComponent } from 'app/modules/shared/components/fields/bft-input-date/bft-input-date.component';
import { ReportPdfService } from 'app/modules/shared/services/report-pdf.service';
import { ReportService } from 'app/modules/shared/services/report.service';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { ReportViewerToolComponent } from '../report-viewer-tool/report-viewer-tool.component';

@Component({
    selector: 'app-customer-recovery',
    standalone: true,
    imports: [
        CommonModule,
        ReportViewerToolComponent,
        NzDrawerModule,
        BftInputDateComponent,
        BftButtonComponent,
        FormsModule,
        MatIconModule,
    ],
    providers: [CurrencyPipe],
    templateUrl: './customer-recovery.component.html',
    styleUrl: './customer-recovery.component.scss',
})
export class CustomerRecoveryComponent {
    private _ReportService = inject(ReportService);
    private _pdfService = inject(ReportPdfService);

    private _CurrencyPipe = inject(CurrencyPipe);
    IsFilterDrawerVisible: boolean = false;
    records: any[] = [];
    fromDate: Date = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
    ); // 1st of current month
    endDate: Date = new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0
    ); // last day of current month

    currentPageIndex: number = 0;

    ngOnInit(): void {
        this.onGenerate();
    }

    close(): void {
        this.IsFilterDrawerVisible = false;
    }
    open(event: boolean): void {
        if (event) {
            this.IsFilterDrawerVisible = true;
        }
    }

    // -- PDF
    onGenerate() {
        this._ReportService
            .getCustomerRecovery(this.fromDate, this.endDate)
            .subscribe({
                next: (res: any) => {
                    const groupedRecovery = res.reduce((acc, curr) => {
                        const existing = acc.find(
                            (inv) => inv.ClientName === curr.ClientName
                        );
                        if (existing) {
                            existing.items.push(curr);
                        } else {
                            acc.push({
                                ClientName: curr.ClientName,
                                ClientAddress: curr.ClientAddress,
                                ClientContactNo: curr.ClientContactNo,
                                items: [curr],
                            });
                        }
                        return acc;
                    }, []);
                    this.records = groupedRecovery;
                    this.IsFilterDrawerVisible = false;
                },
                error: (err) => {
                    console.error(
                        'Error fetching Customer Recovery Report:',
                        err
                    );
                },
            });
    }

    onReset() {
        this.fromDate = new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1
        ); // 1st of current month
        this.endDate = new Date(
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            0
        );
        this.records = [];
        this.onGenerate();
        this.IsFilterDrawerVisible = false;
    }

    onPageIndexChanged(pageIndex: number) {
        this.currentPageIndex = pageIndex;
    }

    getTotal(element: any, columnName: string): number {
        return element.items?.reduce(
            (sum, item) => sum + (item[columnName] || 0),
            0
        );
    }

    async onPrintReport() {
        const base64Logo = await this._pdfService.convertImageUrlToBase64(
            'images/logo/trackcloud/icon.png'
        );

        const docDefinition: any = {
            content: this.getPdfcontent(base64Logo, true),
            styles: {
                companyTitle: {
                    fontSize: 13.5,
                    bold: true,
                    alignment: 'left',
                },
                invoiceTitle: {
                    fontSize: 15,
                    bold: true,
                    alignment: 'right',
                },

                TableHeaderFontSize: {
                    fontSize: 9,
                },
                TableFontSize: {
                    fontSize: 8,
                },
                TotalStyle: {
                    fontSize: 9,
                    bold: true,
                },
            },
            defaultStyle: {
                font: 'Poppins',
            },
        };

        this._pdfService.print(docDefinition, 'Customer Recovery.pdf');
    }

    async onPdfGenerate() {
        const base64Logo = await this._pdfService.convertImageUrlToBase64(
            'images/logo/trackcloud/icon.png'
        );

        const docDefinition: any = {
            content: this.getPdfcontent(base64Logo),
            styles: {
                companyTitle: {
                    fontSize: 13.5,
                    bold: true,
                    alignment: 'left',
                },
                invoiceTitle: {
                    fontSize: 15,
                    bold: true,
                    alignment: 'right',
                },
                TableHeaderFontSize: {
                    fontSize: 9,
                },
                TableFontSize: {
                    fontSize: 8,
                },
                TotalStyle: {
                    fontSize: 9,
                    bold: true,
                },
            },
            defaultStyle: {
                font: 'Poppins',
            },
        };

        this._pdfService.generatePdf(docDefinition, 'Customer Recovery.pdf');
    }

    getPdfcontent(logo: string, print = false): any[] {
        var content: any[] = [];
        let record: any[] = [];

        if (print) {
            const current = this.records[this.currentPageIndex];
            record = Array.isArray(current) ? [...current] : [current]; // Safe
        } else {
            record = [...this.records];
        }
        record.forEach((element: any, index) => {
            if (index > 0) {
                content.push({ text: '', pageBreak: 'before' });
            }
            content.push([
                {
                    table: {
                        widths: ['8%', '47%', '45%'],
                        body: [
                            [
                                {
                                    image: logo, // logo/image placeholder
                                    rowSpan: 3,
                                    width: 48,
                                    height: 48,
                                    border: [false, false, false, false],
                                },
                                {
                                    text: element?.ClientName,
                                    bold: true,
                                    margin: [10, 0, 0, 0],
                                    border: [false, false, false, false],
                                    style: 'companyTitle',
                                },
                                {
                                    text: 'Recovery',
                                    style: 'invoiceTitle',
                                    alignment: 'right',
                                    border: [false, false, false, false],
                                },
                            ],
                            [
                                '', // image rowSpan
                                {
                                    text: `Address: ${element.ClientAddress ? element.ClientAddress : '-'}`,
                                    fontSize: 9,
                                    margin: [10, 0, 0, 0],
                                },
                                {
                                    text: this.fromDate
                                        ? `Start Date:  ${formatDate(this.fromDate, 'MM/dd/yyyy', 'en-US')}`
                                        : '',
                                    fontSize: 9,
                                    alignment: 'right',
                                },
                            ],
                            [
                                '', // image rowSpan
                                {
                                    text: `Contact: ${element.ClientContactNo ? element.ClientContactNo : '-'}`,
                                    fontSize: 9,
                                    margin: [10, 0, 0, 0],
                                },
                                {
                                    text: this.endDate
                                        ? `End Date: ${formatDate(this.endDate, 'MM/dd/yyyy', 'en-US')}`
                                        : '',
                                    fontSize: 9,
                                    alignment: 'right',
                                },
                            ],
                        ],
                    },
                    layout: 'noBorders',
                    margin: [0, 0, 0, 20],
                },
                {
                    table: {
                        widths: ['10%', '40%', '15%', '25%', '10%'],
                        body: [
                            [
                                {
                                    text: 'S.No',
                                    alignment: 'center',
                                    bold: true,
                                    style: 'TableHeaderFontSize',
                                },
                                {
                                    text: 'Customer Name',
                                    bold: true,
                                    style: 'TableHeaderFontSize',
                                },
                                {
                                    text: 'Bill',
                                    alignment: 'center',
                                    bold: true,
                                    style: 'TableHeaderFontSize',
                                },
                                {
                                    text: 'Amount',
                                    bold: true,
                                    style: 'TableHeaderFontSize',
                                },
                                {
                                    text: 'Days',
                                    alignment: 'center',
                                    bold: true,
                                    style: 'TableHeaderFontSize',
                                },
                            ],
                            ...element.items.map((ed: any, index: number) => {
                                return [
                                    {
                                        text: (index + 1).toString(),
                                        style: 'TableFontSize',
                                        alignment: 'center',
                                    },
                                    {
                                        text: ed?.Customer
                                            ? ed?.Customer?.toString().toLocaleUpperCase()
                                            : '',
                                        style: 'TableFontSize',
                                    },
                                    {
                                        text: ed?.BillNo,
                                        style: 'TableFontSize',
                                        alignment: 'center',
                                    },
                                    {
                                        text: this._CurrencyPipe.transform(
                                            ed?.RemainingAmount,
                                            '',
                                            ''
                                        ),
                                        style: 'TableFontSize',
                                    },
                                    {
                                        text: ed?.Days,
                                        style: 'TableFontSize',
                                        alignment: 'center',
                                    },
                                ];
                            }),
                        ],
                    },
                    layout: 'allBorders',
                    margin: [0, 0, 0, 10],
                },
                {
                    table: {
                        widths: ['10%', '40%', '15%', '25%', '10%'],
                        body: [
                            [
                                {
                                    text: 'TOTAL (PKR)',
                                    colSpan: 3,
                                    style: 'TotalStyle',
                                    margin: [5, 0, 0, 0],
                                },
                                '',
                                '',
                                {
                                    text: this._CurrencyPipe.transform(
                                        this.getTotal(
                                            element,
                                            'RemainingAmount'
                                        ),
                                        ' ',
                                        ''
                                    ),
                                    style: 'TotalStyle',
                                },
                                '',
                            ],
                        ],
                    },
                    layout: 'lightHorizontalLines',
                    margin: [0, 0, 0, 10],

                    fillColor: '#F1F5F9',
                },
            ]);
        });

        return content;
    }
}
