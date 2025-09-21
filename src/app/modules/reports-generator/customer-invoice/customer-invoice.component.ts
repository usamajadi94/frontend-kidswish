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
    selector: 'app-customer-invoice',
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
    templateUrl: './customer-invoice.component.html',
    styleUrl: './customer-invoice.component.scss',
})
export class CustomerInvoiceComponent {
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
            .getInvoiceByCustomer(this.fromDate, this.endDate)
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

        this._pdfService.print(docDefinition, 'Customer Invoice.pdf');
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

        this._pdfService.generatePdf(docDefinition, 'Customer Invoice.pdf');
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
                                    text: 'Customer Invoice',
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
                         widths: [
                            '25%',
                            '12%',
                            '15%',
                            '5%',
                            '8%',
                            '5%',
                            '15%',
                            '15%',
                        ],
                        body: [
                            [
                                {
                                    text: 'Customer',
                                    bold: true,
                                    style: 'TableHeaderFontSize',
                                },
                                {
                                    text: 'Invoice No',
                                    alignment: 'center',
                                    bold: true,
                                    style: 'TableHeaderFontSize',
                                },
                                {
                                    text: 'Invoice Date',
                                    bold: true,
                                    style: 'TableHeaderFontSize',
                                },
                                {
                                    text: 'Pcs',
                                    alignment: 'center',
                                    bold: true,
                                    style: 'TableHeaderFontSize',
                                },
                                {
                                    text: 'Packs',
                                    alignment: 'center',
                                    bold: true,
                                    style: 'TableHeaderFontSize',
                                },
                                {
                                    text: 'Ctn',
                                    alignment: 'center',
                                    bold: true,
                                    style: 'TableHeaderFontSize',
                                },
                                {
                                    text: 'Cost Price',
                                    bold: true,
                                    style: 'TableHeaderFontSize',
                                },
                                {
                                    text: 'Sale Price',
                                    bold: true,
                                    style: 'TableHeaderFontSize',
                                },
                            ],
                            ...element.items.map((ed: any, index: number) => {
                                return [
                                    {
                                         text: ed?.Customer
                                            ? ed?.Customer?.toString().toLocaleUpperCase()
                                            : '',
                                        style: 'TableFontSize',
                                    },
                                    {
                                        text: ed?.InvoiceNo
                                            ? ed?.InvoiceNo?.toString().toLocaleUpperCase()
                                            : '',
                                        style: 'TableFontSize',
                                          alignment: 'center',
                                    },
                                    {
                                        text: formatDate(ed.InvoiceDate, 'MM/dd/yyyy', 'en-US'),
                                        style: 'TableFontSize',
                                    },
                                     {
                                        text: ed.TotalPcs,
                                        style: 'TableFontSize',
                                        alignment: 'center',
                                    },
                                     {
                                        text: ed.TotalPacks,
                                        style: 'TableFontSize',
                                        alignment: 'center',
                                    },
                                     {
                                        text: ed.TotalCtn,
                                        style: 'TableFontSize',
                                        alignment: 'center',
                                    },
                                    {
                                        text: this._CurrencyPipe.transform(
                                            ed?.PurchasePrice,
                                            '',
                                            ''
                                        ),
                                        style: 'TableFontSize',
                                    },
                                    {
                                        text: this._CurrencyPipe.transform(
                                            ed?.InvoiceTotal,
                                            '',
                                            ''
                                        ),
                                        style: 'TableFontSize',
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
                         widths: [
                            '25%',
                            '12%',
                            '15%',
                            '5%',
                            '8%',
                            '5%',
                            '15%',
                            '15%',
                        ],
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
                                '',
                                '',
                                '',
                                {
                                    text: this._CurrencyPipe.transform(
                                        this.getTotal(
                                            element,
                                            'PurchasePrice'
                                        ),
                                        ' ',
                                        ''
                                    ),
                                    style: 'TotalStyle',
                                },
                                {
                                    text: this._CurrencyPipe.transform(
                                        this.getTotal(
                                            element,
                                            'InvoiceTotal'
                                        ),
                                        ' ',
                                        ''
                                    ),
                                    style: 'TotalStyle',
                                },
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
