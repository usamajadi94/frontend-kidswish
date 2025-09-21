import { CommonModule, CurrencyPipe, formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftInputDateComponent } from 'app/modules/shared/components/fields/bft-input-date/bft-input-date.component';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { ReportService } from 'app/modules/shared/services/report.service';
import { ReportViewerToolComponent } from "../report-viewer-tool/report-viewer-tool.component";
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { ReportPdfService } from 'app/modules/shared/services/report-pdf.service';
import { CurrentUser } from 'app/core/user/user.types';
import { UserService } from 'app/core/user/user.service';
import { Subject, takeUntil } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-pur-invoicereport',
    standalone: true,
    imports: [CommonModule,
        BftInputTextComponent,
        BftInputDateComponent,
        BftSelectComponent,
        BftButtonComponent,
        FormsModule,
        NzModalModule,
        NzDrawerModule,
        MatIconModule,
        ReportViewerToolComponent],
    providers: [CurrencyPipe],
    templateUrl: './pur-invoice-report.component.html',
    styleUrl: './pur-invoice-report.component.scss'
})
export class PurInvoiceReportComponent implements OnInit {
    private _DrpService = inject(DrpService);
    private _ReportService = inject(ReportService);
    private _pdfService = inject(ReportPdfService);

    records: any[] = [];
    invoiceNo: string = '';
    fromDate: Date = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
    ); // 1st of current month
    endDate: Date = new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0
    );
    supplierID: number = null;

    suppliers: any[] = [];
    user: CurrentUser;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _userService: UserService,
        private currencyPipe: CurrencyPipe
    ) { }

    ngOnInit(): void {
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: CurrentUser) => {
                this.user = user;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        this.getSuppliers();
        this.onGenerate();
    }

    getSuppliers() {
        this._DrpService.getSuppliersDrp().subscribe({
            next: (res: any) => {
                this.suppliers = res;
            },
            error: (err) => {
                console.error('Error fetching items:', err);
            },
        });
    }



    onGenerate() {
        this._ReportService.getPurchaseInvoiceReport(this.invoiceNo,
            this.supplierID,
            this.fromDate,
            this.endDate).subscribe({
                next: (res: any) => {
                    const groupedInvoices = res.reduce((acc, curr) => {
                        const existing = acc.find(inv => inv.InvoiceNo === curr.InvoiceNo);
                        if (existing) {
                            existing.items.push(curr);
                        } else {
                            acc.push({
                                InvoiceNo: curr.InvoiceNo,
                                InvoiceDate: curr.InvoiceDate,
                                Supplier: curr.Supplier,
                                ClientName: curr.ClientName,
                                ClientAddress: curr.ClientAddress,
                                ClientContactNo: curr.ClientContactNo,
                                items: [curr]
                            });
                        }
                        return acc;
                    }, []);
                    this.records = groupedInvoices;
                    this.IsFilterDrawerVisible = false;
                },
                error: (err) => {
                    console.error('Error fetching salesmans:', err);
                },
            }
            );
    }

    onReset() {
        this.invoiceNo = '';
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
        this.supplierID = null;
        this.records = [];
        this.onGenerate();
    }

    IsFilterDrawerVisible: boolean = false;
    close(): void {
        this.IsFilterDrawerVisible = false;
    }
    open(event: boolean): void {
        if (event) {
            this.IsFilterDrawerVisible = true;
        }
    }

    getInvoiceTotalPrice(element: any): number {
        return element.items?.reduce((sum, item) => sum + (item.Cost || 0), 0);
    }

    getInvoiceTotalQty(element: any): number {
        return element.items?.reduce((sum, item) => sum + (item.Qty || 0), 0);
    }

    getInvoiceTotalAmount(element: any): number {
        return element.items?.reduce((sum, item) => sum + (item.NetAmt || 0), 0);
    }

    getTotal(element: any, columnName: string): number {
        return element.items?.reduce((sum, item) => sum + (item[columnName] || 0), 0);
    }

    currentPageIndex: number = 0;
    onPageIndexChanged(pageIndex: number) {
        this.currentPageIndex = pageIndex;
    }

    async onPrintReport() {
        const base64Logo = await this._pdfService.convertImageUrlToBase64("images/logo/trackcloud/icon.png");

        const docDefinition: any = {
            content: this.getPdfcontent(base64Logo, true),
            styles: {
                companyTitle: {
                    fontSize: 13.5,
                    bold: true,
                    alignment: 'left'
                },
                invoiceTitle: {
                    fontSize: 15,
                    bold: true,
                    alignment: 'right'
                },
                FontStyle: {
                    fontSize: 9,
                },
                TableHeaderFontSize: {
                    fontSize: 9,
                },
                TableFontSize: {
                    fontSize: 8,
                },
                Signature: {
                    fontSize: 9,
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

        this._pdfService.print(docDefinition, 'PurchaseInvoice.pdf');
    }

    async onPdfGenerate() {
        const base64Logo = await this._pdfService.convertImageUrlToBase64("images/logo/trackcloud/icon.png");

        const docDefinition: any = {
            content: this.getPdfcontent(base64Logo),
            styles: {
                companyTitle: {
                    fontSize: 13.5,
                    bold: true,
                    alignment: 'left'
                },
                invoiceTitle: {
                    fontSize: 15,
                    bold: true,
                    alignment: 'right'
                },
                FontStyle: {
                    fontSize: 9,
                },
                TableHeaderFontSize: {
                    fontSize: 9,
                },
                TableFontSize: {
                    fontSize: 8,
                },
                Signature: {
                    fontSize: 9,
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

        this._pdfService.generatePdf(docDefinition, 'PurchaseInvoice.pdf');
    }


    getPdfcontent(logo: string, print = false): any[] {
        var content: any[] = [];
        let record: any[] = [];

        if (print) {
            const current = this.records[this.currentPageIndex];
            record = Array.isArray(current) ? [...current] : [current];  // Safe
        } else {
            record = [...this.records];
        }
        record.forEach((element: any, index) => {
            if (index > 0) {
                content.push({ text: '', pageBreak: 'before' });
            }
            content.push(
                [
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
                                        border: [false, false, false, false], style: 'companyTitle'
                                    },
                                    {
                                        text: 'PURCHASE INVOICE',
                                        style: 'invoiceTitle',
                                        alignment: 'right',
                                        border: [false, false, false, false]
                                    }
                                ],
                                [
                                    '', // image rowSpan

                                    {
                                        text: `Address: ${element.ClientAddress ? element.ClientAddress : '-'}`,
                                        fontSize: 9,
                                        margin: [10, 0, 0, 0]
                                    },
                                    {
                                        text: element.InvoiceNo,
                                        bold: true,
                                        alignment: 'right',
                                        border: [false, false, false, false], style: 'FontStyle'
                                    }
                                ],
                                [
                                    '', // image rowSpan

                                    {
                                        text: `Contact: ${element.ClientContactNo ? element.ClientContactNo : '-'}`,
                                        fontSize: 9,
                                        margin: [10, 0, 0, 0]
                                    },
                                    {
                                        text: `Invoice Date: ${formatDate(element?.InvoiceDate, 'MM/dd/yyyy', 'en-US')}`,
                                        alignment: 'right',
                                        border: [false, false, false, false], style: 'FontStyle'
                                    }
                                ]
                            ]
                        },
                        layout: 'noBorders',
                        margin: [0, 0, 0, 20]
                    },
                    {
                        table: {
                            widths: ['12%', '88%'],
                            body: [

                                [
                                    { text: 'Supplier: ', bold: true, border: [false, false, false, false], style: 'FontStyle' },
                                    { text: element?.Supplier ? element?.Supplier?.toString().toLocaleUpperCase() : '', border: [false, false, false, false], style: 'FontStyle' },
                                ],

                            ]
                        },
                        layout: 'noBorders',
                        margin: [0, 0, 0, 20]
                    },
                    {
                        table: {
                            widths: ['6%', '24%', '15%', '20%', '15%', '20%'],
                            body: [
                                [
                                    { text: 'S.No', bold: true, style: 'TableHeaderFontSize' },
                                    { text: 'Item', bold: true, style: 'TableHeaderFontSize' },
                                    { text: 'Buy In', bold: true, style: 'TableHeaderFontSize' },
                                    { text: 'Cost Price', bold: true, style: 'TableHeaderFontSize' },
                                    { text: 'Qty', bold: true, style: 'TableHeaderFontSize' },
                                    { text: 'Net Amt', bold: true, style: 'TableHeaderFontSize' }
                                ],
                                ...element.items.map((ed: any, index: number) => {
                                    return [
                                        { text: (index + 1).toString(), style: 'TableFontSize' },
                                        { text: ed?.Item ? ed?.Item?.toString().toLocaleUpperCase() : '', style: 'TableFontSize' },
                                        { text: ed?.BuyIn ? ed?.BuyIn?.toString().toLocaleUpperCase() : '', style: 'TableFontSize' },
                                        { text: this.currencyPipe.transform(ed?.Cost, '', ''), style: 'TableFontSize' },
                                        { text: ed?.Qty, style: 'TableFontSize' },
                                        { text: this.currencyPipe.transform(ed?.NetAmt, '', ''), style: 'TableFontSize' }
                                    ]
                                }),
                            ]
                        },
                        layout: 'allBorders',
                        margin: [0, 0, 0, 10]
                    },
                    {
                        table: {
                            widths: ['6%', '24%', '15%', '20%', '15%', '20%'],
                            body: [
                                [
                                    { text: 'TOTAL (PKR)', colSpan: 3, style: 'TotalStyle', margin: [5, 0, 0, 0] },
                                    '',
                                    '',
                                    { text: this.currencyPipe.transform(this.getTotal(element, 'Cost'), ' ', ''), style: 'TotalStyle' },
                                    { text: this.getTotal(element, 'Qty'), style: 'TotalStyle' },
                                    { text: this.currencyPipe.transform(this.getTotal(element, 'NetAmt'), ' ', ''), style: 'TotalStyle', margin: [0, 0, 0, 2] }
                                ]
                            ]
                        },
                        layout: 'lightHorizontalLines',
                        margin: [0, 0, 0, 10],

                        fillColor: '#F1F5F9',
                    },
                    {
                        table: {
                            widths: ['14%', '22%', '12%', '20%', '12%', '20%',],
                            body: [
                                [
                                    { text: 'ACCOUNTANT:', style: 'Signature', bold: true },
                                    { text: this.user?.FullName, style: 'Signature', bold: true },

                                    { text: 'SUPPLIER:', style: 'Signature', bold: true },
                                    { text: '_____________', style: 'Signature' },
                                    { text: 'RECEIVER:', style: 'Signature', bold: true },
                                    { text: '_____________', style: 'Signature' }
                                ]
                            ]
                        },
                        layout: 'noBorders',
                        margin: [0, 0, 0, 20],
                    },
                ]
            )
        })

        return content;
    }

}
