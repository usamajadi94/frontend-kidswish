import { CommonModule, CurrencyPipe, formatDate } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { BftInputDateComponent } from 'app/modules/shared/components/fields/bft-input-date/bft-input-date.component';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { ReportPdfService } from 'app/modules/shared/services/report-pdf.service';
import { ReportService } from 'app/modules/shared/services/report.service';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { BftButtonComponent } from '../../shared/components/buttons/bft-button/bft-button.component';
import { BftSelectComponent } from '../../shared/components/fields/bft-select/bft-select.component';
import { ReportViewerToolComponent } from '../report-viewer-tool/report-viewer-tool.component';

@Component({
    selector: 'app-bill-collection',
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
        ReportViewerToolComponent,
        MatIconModule,
    ],
    providers: [CurrencyPipe],
    templateUrl: './bill-collection.component.html',
    styleUrl: './bill-collection.component.scss',
})
export class BillCollectionComponent implements OnInit {
    private _DrpService = inject(DrpService);
    private _ReportService = inject(ReportService);
    private _pdfService = inject(ReportPdfService);
    records: any[] = [];
    fromDate: Date = null;
    endDate: Date = null;
    customerID: number = null;

    customers: any[] = [];

    constructor(private currencyPipe: CurrencyPipe) {}
    ngOnInit(): void {
        this.getCustomers();
        this.IsFilterDrawerVisible = true;
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
            .getBillCollectionReport(
                this.customerID,
                this.fromDate,
                this.endDate
            )
            .subscribe({
                next: (res: any) => {
                    const groupedInvoices = res.reduce((acc, curr) => {
                        const existing = acc.find(
                            (inv) => inv.CustomerID === curr.CustomerID
                        );
                        if (existing) {
                            existing.items.push(curr);
                        } else {
                            acc.push({
                                Customer: curr.Customer,
                                CustomerBusinessName: curr.CustomerBusinessName,
                                CustomerAddress: curr.CustomerAddress,
                                CustomerPhoneNo: curr.CustomerPhoneNo,
                                CustomerID: curr.CustomerID,
                                ClientName: curr.ClientName,
                                ClientAddress: curr.ClientAddress,
                                ClientContactNo: curr.ClientContactNo,
                                items: [curr],
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
            });
    }

    onReset() {
        this.fromDate = null;
        this.endDate = null;
        this.customerID = null;

        this.records = [];
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

    getTotalDebit(element: any): number {
        return element.items?.reduce((sum, item) => sum + (item.Debit || 0), 0);
    }

    getTotalCredit(element: any): number {
        return element.items?.reduce(
            (sum, item) => sum + (item.Credit || 0),
            0
        );
    }

    getTotalBalance(element: any): number {
        const totalDebit =
            element.items?.reduce((sum, item) => sum + (item.Debit || 0), 0) ||
            0;
        const totalCredit =
            element.items?.reduce((sum, item) => sum + (item.Credit || 0), 0) ||
            0;

    return totalDebit - totalCredit;
  }

  currentPageIndex: number = 0;
  onPageIndexChanged(pageIndex: number) {
    this.currentPageIndex = pageIndex;
  }

  async onPrintReport(){
     const base64Logo = await this._pdfService.convertImageUrlToBase64("images/logo/trackcloud/icon.png");

    const docDefinition: any = {
      content: this.getPdfcontent(base64Logo,true),
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

    this._pdfService.print(docDefinition, 'LedgerActivity.pdf');
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

        this._pdfService.generatePdf(docDefinition, 'LedgerActivity.pdf');
    }


  getPdfcontent(logo: string,print = false): any[] {
    var content: any[] = [];
    let record:any[]=[];

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
                    text: 'LEDGER ACTIVITY',
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
                  } ,
                  {
                    text: element.CustomerBusinessName,
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
                  } ,
                  {
                    text: element?.CustomerAddress ? element.CustomerAddress.toString() : '',
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
              widths: ['18%', '32%', '15%', '35%'],
              body: [
                [
                  { text: 'Bill To',bold:true,  fontSize: 12, margin: [0, 0, 0, 5], border: [false, false, false, false] },
                  { text: '', border: [false, false, false, false], style: 'FontStyle' },
                  { text: '', border: [false, false, false, false], style: 'FontStyle' },
                  { text: '', border: [false, false, false, false], style: 'FontStyle' }
                ],
                [
                  { text: 'Contact Person: ', bold: true, border: [false, false, false, false], style: 'FontStyle' },
                  { text: element?.Customer ? element?.Customer?.toString().toLocaleUpperCase() : '', border: [false, false, false, false], style: 'FontStyle' },
                   { text: 'Phone No:', bold: true, border: [false, false, false, false], style: 'FontStyle' },
                  { text: element?.CustomerPhoneNo ? element?.CustomerPhoneNo?.toString() : '', border: [false, false, false, false], style: 'FontStyle' }
                              
                ],

              ]
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 20]
          },
          {
            table: {
              widths: ['20%',  '15%', '15%', '15%', '35%'],
              body: [
                [
                  { text: 'Transaction Date', bold: true, style: 'TableHeaderFontSize' },
                  // { text: 'Bill No', bold: true, style: 'TableHeaderFontSize' },
                  { text: 'Debit', bold: true, style: 'TableHeaderFontSize' },
                  { text: 'Credit', bold: true, style: 'TableHeaderFontSize' },
                  { text: 'Balance', bold: true, style: 'TableHeaderFontSize' },
                  { text: 'Remarks', bold: true, style: 'TableHeaderFontSize' }
                ],
                ...element.items.map((ed: any, index: number) => {
                  return [
                    { text: formatDate(ed?.TransactionDate, 'dd/MM/yyyy', 'en-US'), style: 'TableFontSize' },
                    // { text: ed?.BillNo , style: 'TableFontSize' },
                    { text: this.currencyPipe.transform(ed?.Debit, '', ''), style: 'TableFontSize' },
                    { text: this.currencyPipe.transform(ed?.Credit, '', ''), style: 'TableFontSize' },
                    { text: this.currencyPipe.transform(ed?.Balance, '', ''), style: 'TableFontSize' },
                    { text: ed?.BillNo.toString() + " - " + (ed?.Remarks ? ed?.Remarks : 'No Remarks'), style: 'TableFontSize' },
                  ]
                }),
              ]
            },
            layout: 'allBorders',
            margin: [0, 0, 0, 10]
          },
          {
            table: {
              widths: ['20%',  '15%', '15%', '15%', '35%'],
              body: [
                [
                  { text: 'TOTAL (PKR)',  style: 'TotalStyle', margin: [5, 0, 0, 0] },
                  // '',
                  { text: this.currencyPipe.transform(this.getTotalDebit(element), ' ', ''), style: 'TotalStyle' },
                  { text: this.currencyPipe.transform(this.getTotalCredit(element), ' ', ''), style: 'TotalStyle' },
                  { text: this.currencyPipe.transform(this.getTotalBalance(element), ' ', ''), style: 'TotalStyle' },
                  ''
                ]
              ]
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
