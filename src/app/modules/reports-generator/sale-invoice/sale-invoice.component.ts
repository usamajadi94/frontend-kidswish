import { CommonModule, CurrencyPipe, formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { ApiResponse } from 'app/core/Base/interface/IResponses';
import { UserService } from 'app/core/user/user.service';
import { CurrentUser } from 'app/core/user/user.types';
import { Company } from 'app/modules/admin/pages/models/company';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { ReportPdfService } from 'app/modules/shared/services/report-pdf.service';
import { ReportService } from 'app/modules/shared/services/report.service';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { lastValueFrom, Subject, takeUntil } from 'rxjs';
import { BftButtonComponent } from '../../shared/components/buttons/bft-button/bft-button.component';
import { BftInputDateComponent } from '../../shared/components/fields/bft-input-date/bft-input-date.component';
import { BftInputTextComponent } from '../../shared/components/fields/bft-input-text/bft-input-text.component';
import { BftSelectComponent } from '../../shared/components/fields/bft-select/bft-select.component';
import { ReportViewerToolComponent } from '../report-viewer-tool/report-viewer-tool.component';
@Component({
    selector: 'app-sale-invoice',
    standalone: true,
    imports: [
        CommonModule,
        BftInputTextComponent,
        BftInputDateComponent,
        BftSelectComponent,
        BftButtonComponent,
        FormsModule,
        NzModalModule,
        NzDrawerModule,
        ReportViewerToolComponent,
        MatIconModule,
    ],
    providers: [CurrencyPipe],
    templateUrl: './sale-invoice.component.html',
    styleUrl: './sale-invoice.component.scss',
})
export class SaleInvoiceComponent {
    private _DrpService = inject(DrpService);
    private _ReportService = inject(ReportService);
    private _pdfService = inject(ReportPdfService);
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _userService = inject(UserService);
    private currencyPipe = inject(CurrencyPipe);
    private _http = inject(HttpClient);
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private route = inject(ActivatedRoute);

    user: CurrentUser;
    companyInfo: Company = new Company();
    isPrintViewEnable: boolean = false;
    customerID: number = null;
    customers: any[] = [];
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
    IsFilterDrawerVisible: boolean = false;
    currentPage = 1;
    totalPages = 10; // replace with actual total
    currentPageIndex: number = 0;

    async ngOnInit(): Promise<void> {
        this.route.queryParams.subscribe((params) => {
            this.invoiceNo = params['invoiceNo'] || '';
            if (this.invoiceNo != '') {
                this.isPrintViewEnable = true;
            }
        });
        Promise.all([
            await this.getCompanyInfo(),
            this.getCustomers(),
            this.onGenerate(),
        ]);
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: CurrentUser) => {
                this.user = user;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    async getCompanyInfo() {
        this.companyInfo = new Company();
        this.companyInfo = (await lastValueFrom(this._http.get<ApiResponse<Company>>(apiUrls.companyFetch)))?.Data;
        this.companyInfo.Phone = this.formatPhoneNumber(
            this.companyInfo.Phone
        );
        // await this._http.get<ApiResponse<Company>>(apiUrls.companyFetch).subscribe({
        //     next: (res) => {
        //         this.companyInfo = res.Data;
        //         this.companyInfo.Phone = this.formatPhoneNumber(
        //             this.companyInfo.Phone
        //         );
        //         this._changeDetectorRef.markForCheck();
        //     },
        // });
    }

    getCustomers() {
        this._DrpService.getCustomerInformationDrp().subscribe({
            next: (res: any) => {
                this.customers = res;
            },
            error: (err) => {
                console.error('Error fetching items:', err);
            },
        });
    }

    onGenerate() {
        this._ReportService
            .getSaleInvoiceReport(
                this.invoiceNo,
                this.customerID,
                this.fromDate,
                this.endDate
            )
            .subscribe({
                next: (res: any) => {
                    const groupedInvoices = res.reduce((acc, curr) => {
                        const existing = acc.find(
                            (inv) => inv.InvoiceNo === curr.InvoiceNo
                        );
                        if (existing) {
                            existing.items.push(curr);
                        } else {
                            acc.push({
                                InvoiceNo: curr.InvoiceNo,
                                InvoiceDate: curr.InvoiceDate,
                                Customer: curr.Customer,
                                CustomerAddress: curr.Address,
                                CustomerPhone: this.formatPhoneNumber(
                                    curr.PhoneNo
                                ),
                                CustomerEmail: curr.Email,
                                Taxable: curr.Taxable,
                                TaxRate: curr.TaxRate,
                                Tax: curr.Tax,
                                SH: curr.SH,
                                Notes: curr.Notes,
                                Others: curr.Others,
                                Total: curr.Total,
                                Cases: curr.Cases,
                                TL: curr.TL,
                                InvoiceRegards: curr.InvoiceRegards,
                                items: [curr],
                            });
                        }
                        return acc;
                    }, []);
                    this.records = groupedInvoices;
                    this.IsFilterDrawerVisible = false;
                    if (this.isPrintViewEnable) {
                        this.onPrintReport();
                    }
                    // this.pages   = this.splitIntoPages(this.records);
                    // this.totalPages = this.pages.length;
                    // this.currentPage = 1;
                },
                error: (err) => {
                    console.error('Error fetching salesmans:', err);
                },
            });
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
        this.customerID = null;
        this.records = [];
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

    getInvoiceTotalPrice(element: any): number {
        return element.items?.reduce(
            (sum, item) => sum + (item.SalePrice || 0),
            0
        );
    }

    getInvoiceTotalQty(element: any): number {
        return element.items?.reduce((sum, item) => sum + (item.Qty || 0), 0);
    }

    getInvoiceTotalAmount(element: any): number {
        return element.items?.reduce(
            (sum, item) => sum + (item.NetAmt || 0),
            0
        );
    }

    // getTotal(element: any, columnName: string): number {
    //     return element.items?.reduce(
    //         (sum, item) => sum + (item[columnName] || 0),
    //         0
    //     );
    // }

    getTotal(element: any, columnName: string): number {
    const total = element.items?.reduce(
        (sum, item) => sum + (item[columnName] || 0),
        0
    ) || 0;

    return Math.round(total * 100) / 100; // 2 decimal places
}

    onPageIndexChanged(pageIndex: number) {
        this.currentPageIndex = pageIndex;
    }

    async onPrintReport() {
        const base64Logo = await this._pdfService.convertImageUrlToBase64(
            'images/logo/trackcloud/dabossicon.png'
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
                    fontSize: 18,
                    bold: true,
                    alignment: 'right',
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

        this._pdfService.print(docDefinition, 'SaleInvoice.pdf');
        this.resetParams();
    }

  resetParams() {
    if (this.isPrintViewEnable) {
        setTimeout(() => {
            window.close();
        }, 1); // 0.1 sec delay
    }
}

    async onPdfGenerate() {
        const base64Logo = await this._pdfService.convertImageUrlToBase64(
            'images/logo/trackcloud/dabossicon.png'
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
                    fontSize: 18,
                    bold: true,
                    alignment: 'right',
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

        this._pdfService.generatePdf(docDefinition, 'SaleInvoice.pdf');
    }

    getPdfcontent(logo: string, print = false): any[] {
        var content: any[] = [];
        let record: any[] = [];

        if (print) {
            const current = this.records[this.currentPageIndex];
            record = Array.isArray(current) ? [...current] : [current];
        } else {
            record = [...this.records];
        }

        record.forEach((element: any, index) => {
            if (index > 0) {
                content.push({ text: '', pageBreak: 'before' });
            }

            content.push(
                // Company Info + Invoice Info
                {
                    columns: [
                        {
                            width: '65%',
                            stack: [
                                {
                                    text: `${this.companyInfo.Description}`,
                                    style: 'companyTitle',
                                },
                                {
                                    stack: [
                                        {
                                            text: `${this.companyInfo.Address}`,
                                            style: 'FontStyle',
                                        },
                                        {
                                            text: `${this.companyInfo.City}, ${this.companyInfo.State} ${this.companyInfo.Zip}`,
                                            style: 'FontStyle',
                                        },
                                    ],
                                },
                                {
                                    text:
                                        'Phone: ' +
                                        this.formatPhoneNumber(
                                            this.companyInfo.Phone
                                        ),
                                    style: 'FontStyle',
                                },
                                {
                                    text: 'Email: ' + this.companyInfo.Email,
                                    style: 'FontStyle',
                                },
                                {
                                    text: 'TL: ' + this.companyInfo.TL,
                                    style: 'FontStyle',
                                },
                            ],
                        },
                        {
                            width: '35%',
                            stack: [
                                {
                                        image: logo, // logo/image placeholder
                                        rowSpan: 3,
                                        width: 48,
                                        height: 48,
                                        border: [false, false, false, false],
                                    },
                                { text: 'INVOICE', style: 'invoiceTitle' },
                                {
                                    text: 'Invoice # : ' + element.InvoiceNo,
                                    style: 'FontStyle',
                                    bold: true,
                                },
                                {
                                    text: `Date: ${formatDate(
                                        element?.InvoiceDate,
                                        'MM/dd/yyyy',
                                        'en-US'
                                    )}`,
                                    style: 'FontStyle',
                                },
                            ],
                            alignment: 'right',
                        },
                    ],
                    margin: [0, 0, 0, 10],
                },

                // Ship To
                {
                    stack: [
                        {
                            text: 'Ship To',
                            // style: 'invoiceTitle',
                            color: '#105ec6',
                            fontsize: 14,
                            bold: true,
                        },
                        {
                            text:
                                element?.Customer?.toString().toUpperCase() ||
                                '',
                            style: 'FontStyle',
                            bold: true,
                        },
                        {
                            text:
                                element?.CustomerAddress?.toString().toUpperCase() ||
                                '',
                            style: 'FontStyle',
                        },
                        {
                            text: `Phone: ${element?.CustomerPhone || '-'}`,
                            style: 'FontStyle',
                        },
                        {
                            text: `Email: ${element?.CustomerEmail || '-'}`,
                            style: 'FontStyle',
                        },
                        {
                            text: `TL: ${element?.TL || '-'}`,
                            style: 'FontStyle',
                        },
                    ],
                    margin: [0, 0, 0, 20],
                },

                // Table Header
                {
                    table: {
                        widths: ['8%', '25%','14%', '12%', '15%', '10%', '16%'],
                        body: [
                            [
                                {
                                    text: 'Cases',
                                    style: 'TableHeaderFontSize',
                                    bold: true,
                                },
                                {
                                    text: 'Item',
                                    style: 'TableHeaderFontSize',
                                    bold: true,
                                },
                                {
                                    text: 'Gross Weight',
                                    style: 'TableHeaderFontSize',
                                    bold: true,
                                },
                                {
                                    text: 'Case Qty',
                                    style: 'TableHeaderFontSize',
                                    bold: true,
                                },
                                {
                                    text: 'Total Qty',
                                    style: 'TableHeaderFontSize',
                                    bold: true,
                                },
                                {
                                    text: 'Price',
                                    style: 'TableHeaderFontSize',
                                    bold: true,
                                },
                                {
                                    text: 'Total',
                                    style: 'TableHeaderFontSize',
                                    bold: true,
                                    alignment: 'right',
                                },
                            ],
                            ...element.items.map((item: any, i: number) => [
                                {
                                    text: item?.Cases?.toString() || '',
                                    style: 'TableFontSize',
                                },
                                {
                                    text:
                                        item?.Item?.toString().toUpperCase() ||
                                        '',
                                    style: 'TableFontSize',
                                },
                                { text: item?.NetWeight, style: 'TableFontSize' },
                                { text: item?.CaseQty, style: 'TableFontSize' },
                                { text: item?.Qty, style: 'TableFontSize' },
                                {
                                    text: this.currencyPipe.transform(
                                        item?.Price,
                                    ),
                                    style: 'TableFontSize',
                                },
                                {
                                    text: this.currencyPipe.transform(
                                        item?.NetAmt
                                    ),
                                    style: 'TableFontSize',
                                    alignment: 'right',
                                },
                            ]),
                        ],
                    },
                    layout: 'allborder',
                    margin: [0, 0, 0, 10],
                },

                // Totals Row
                {
                    table: {
                         widths: ['8%', '25%','14%', '12%', '15%', '10%', '16%'],
                        // widths: ['8%', '36%', '15%','15%', '10%', '16%'],
                        body: [
                            [
                                {
                                    text: this.getTotal(element, 'Cases'),
                                    style: 'TotalStyle',
                                },
                               
                                {
                                    text: '',
                                },
                                 {
                                    text: this.getTotal(element, 'NetWeight'),
                                    style: 'TotalStyle',
                                },
                                {
                                    text: '',
                                },
                                {
                                    text: this.getTotal(element, 'Qty'),
                                    style: 'TotalStyle',
                                },
                                {
                                    text: '',
                                    
                                },
                                {
                                    text: this.currencyPipe.transform(
                                        this.getTotal(element, 'NetAmt'),
                                    ),
                                    style: 'TotalStyle',
                                    alignment: 'right',
                                },
                            ],
                        ],
                    },
                    fillColor: '#F1F5F9',
                    margin: [0, 0, 0, 10],
                },

                // Comments + Totals Section
                {
                    columns: [
                        {
                            width: '60%',
                            stack: [
                                {
                                    text: 'Other Comments or Special Instructions',
                                    bold: true,
                                    fillColor: '#E5E7EB',
                                    margin: [0, 0, 0, 5],
                                },
                                {
                                    text: `${element.Notes != null ? element.Notes : '-'}`,
                                    style: 'FontStyle',
                                },
                            ],
                        },
                        {
                            width: '40%',
                            stack: [
                                this.makeTotalRow(
                                    'SUBTOTAL',
                                    this.currencyPipe.transform(
                                        this.getTotal(element, 'NetAmt')
                                    )
                                ),
                                this.makeTotalRow(
                                    'TAXABLE',
                                    this.currencyPipe.transform(element.Taxable)
                                ),
                                this.makeTotalRow(
                                    'TAX RATE',
                                    `${element.TaxRate != null ? element.TaxRate + '%' : '-'}`
                                ),
                                this.makeTotalRow(
                                    'TAX',
                                    this.currencyPipe.transform(element.Tax)
                                ),
                                this.makeTotalRow(
                                    'S & H',
                                    this.currencyPipe.transform(element.SH)
                                ),
                                this.makeTotalRow(
                                    'OTHER',
                                    this.currencyPipe.transform(element.Others)
                                ),
                                {
                                    columns: [
                                        { text: 'TOTAL', bold: true },
                                        {
                                            text: this.currencyPipe.transform(
                                                element.Total
                                            ),
                                            bold: true,
                                            alignment: 'right',
                                            fillColor: '#E0E7FF',
                                            margin: [5, 2, 5, 2],
                                        },
                                    ],
                                    margin: [0, 10, 0, 0],
                                },
                            ],
                        },
                    ],
                    margin: [0, 0, 0, 20],
                },

                // Footer Note
                {
                    alignment: 'center',
                    stack: [
                        {
                            text: element?.InvoiceRegards,
                            style: 'FontStyle',
                        },
                        { text: 'Thank You For Your Business!', bold: true },
                    ],
                }
            );
        });

        return content;
    }

    makeTotalRow(label: string, value: any) {
        return {
            columns: [
                { text: label, style: 'FontStyle' },
                {
                    text: value ? value.toString() : '-',
                    alignment: 'right',
                    style: 'FontStyle',
                },
            ],
            margin: [0, 2, 0, 2],
        };
    }

    formatPhoneNumber(phoneNumber) {
        if(phoneNumber){
            phoneNumber = phoneNumber.replace(/\D/g, '');
    
            // Format it as (XXX) XXX-XXXX
            if (phoneNumber.length === 10) {
                return phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
            } else {
                return 'Invalid phone number'; // Agar 10 digits nahi hain
            }
        }
        // Removing all non-digit characters
    }
}
