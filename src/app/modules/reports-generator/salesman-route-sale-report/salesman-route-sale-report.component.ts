import { CommonModule, CurrencyPipe, formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from 'app/core/user/user.service';
import { CurrentUser } from 'app/core/user/user.types';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftInputDateComponent } from 'app/modules/shared/components/fields/bft-input-date/bft-input-date.component';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { ReportPdfService } from 'app/modules/shared/services/report-pdf.service';
import { ReportService } from 'app/modules/shared/services/report.service';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { Subject, takeUntil } from 'rxjs';
import { ReportViewerToolComponent } from '../report-viewer-tool/report-viewer-tool.component';

@Component({
  selector: 'app-salesman-route-sale-report',
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
  templateUrl: './salesman-route-sale-report.component.html',
  styleUrl: './salesman-route-sale-report.component.scss'
})
export class SalesmanRouteSaleReportComponent {
  private _DrpService = inject(DrpService);
  private _ReportService = inject(ReportService);
  private _pdfService = inject(ReportPdfService);

  records: any[] = [];

  fromDate: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  endDate: Date = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
  salesmanID: number = null;
  routeID: number = null;

  salesmans: any[] = [];
  routes: any[] = [];
  user: CurrentUser;

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _userService: UserService,
    private currencyPipe: CurrencyPipe
  ) { }

  ngOnInit(): void {
    // this.fromDate = new Date();
    // this.endDate = new Date();

    this._userService.user$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user: CurrentUser) => {
        this.user = user;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
    this.getRouteInformationDrp();
    this.getSalesmans();
    this.onGenerate();
  }



  getRouteInformationDrp() {
    this._DrpService.getRouteInformationDrp().subscribe({
      next: (res: any) => {
        this.routes = res;
      },
      error: (err) => {
        console.error('Error fetching order bookers:', err);
      },
    });
  }

  getSalesmans() {
    this._DrpService.getSalesmanInformationDrp().subscribe({
      next: (res: any) => {
        this.salesmans = res;
      },
      error: (err) => {
        console.error('Error fetching salesmans:', err);
      },
    });
  }

  onGenerate() {
    this._ReportService
      .getSalesmanRouteSaleReport(
        this.fromDate,
        this.endDate,
        this.salesmanID,
        this.salesmanID
      )
      .subscribe({
        next: (res: any) => {
          const groupedBySalesmanAndRoute = res.reduce((acc, curr) => {


            let group = acc.find(g => g.Salesman === curr.Salesman && g.Route === curr.Route);
            if (!group) {
              group = {
                Salesman: curr.Salesman,
                Route: curr.Route,
                ClientName: curr.ClientName,
                ClientAddress: curr.ClientAddress,
                ClientContactNo: curr.ClientContactNo,
                items: []
              };
              acc.push(group);
            }

            // Add current invoice to this group
            group.items.push({
              InvoiceNo: curr.InvoiceNo,
              InvoiceDate: curr.InvoiceDate,
              Customer: curr.Customer,
              CustomerBusinessName: curr.CustomerBusinessName,
              Route: curr.Route,
              Salesman: curr.Salesman,
              Amount: curr.Amount,
              Payment: curr.Payment,
              RemainingAmount: curr.RemainingAmount,
              ClientName: curr.ClientName,
              ClientAddress: curr.ClientAddress,
              ClientContactNo: curr.ClientContactNo
            });

            return acc;
          }, [] as {
            Salesman: string;
            Area: string;
            invoices: any[];
          }[]);
          this.records = groupedBySalesmanAndRoute;
          this.IsFilterDrawerVisible = false;
        },
        error: (err) => {
          console.error('Error fetching salesmans:', err);
        },
      });
  }

  onReset() {
    this.fromDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1); // 1st of current month
    this.endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0); // last day of current month
    this.salesmanID = null;
    this.routeID = null;
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

    this._pdfService.print(docDefinition, 'Salesman Route Sale.pdf');
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

    this._pdfService.generatePdf(docDefinition, 'Salesman Route Sale.pdf');
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
                    text: 'SALESMAN ROUTE SALE',
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
                    margin: [10, 0, 0, 0]
                  },
                  {
                    text: this.endDate
                      ? `End Date: ${formatDate(this.endDate, 'MM/dd/yyyy', 'en-US')}`
                      : '',
                    fontSize: 9,
                    alignment: 'right',
                  },
                ]
              ]
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 20]
          },
          {
            table: {
              widths: ['14%', '36%', '10%', '40%'],
              body: [
                
                [
                  { text: 'Salesman: ', bold: true, border: [false, false, false, false], style: 'FontStyle' },
                  { text: element?.Salesman ? element?.Salesman?.toString().toLocaleUpperCase() : '', border: [false, false, false, false], style: 'FontStyle' },
                  { text: 'Route:', bold: true, border: [false, false, false, false], style: 'FontStyle' },
                  { text: element?.Route ? element?.Route?.toString().toLocaleUpperCase() : '', border: [false, false, false, false], style: 'FontStyle' }
                ],
              
              ]
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 20]
          },
          {
            table: {
              widths: ['20%', '16%','16%','16%','16%','16%' ],
              body: [
                [
                  { text: 'Customer', bold: true, style: 'TableHeaderFontSize' },
                  { text: 'Invoice No', bold: true, style: 'TableHeaderFontSize' },
                  { text: 'Invoice Date', bold: true, style: 'TableHeaderFontSize' },
                  { text: 'Amount', bold: true, style: 'TableHeaderFontSize' },
                  { text: 'Payment', bold: true, style: 'TableHeaderFontSize' },
                  { text: 'Remaining', bold: true, style: 'TableHeaderFontSize' },
                  
                ],
                ...element.items.map((ed: any, index: number) => {
                  return [
                   
                    { text: ed?.Customer ? ed?.Customer?.toString().toLocaleUpperCase() : '', style: 'TableFontSize' },
                    { text: ed?.InvoiceNo, style: 'TableFontSize' },
                    { text: ed?.InvoiceDate ? formatDate(ed?.InvoiceDate, 'MM/dd/yyyy', 'en-US') : '', style: 'TableFontSize' },
                    { text: this.currencyPipe.transform(ed?.Amount, '', ''), style: 'TableFontSize' },
                    { text: this.currencyPipe.transform(ed?.Payment, '', ''), style: 'TableFontSize' },
                    { text: this.currencyPipe.transform(ed?.RemainingAmount, '', ''), style: 'TableFontSize' }
                  ]
                }),
              ]
            },
            layout: 'allBorders',
            margin: [0, 0, 0, 10]
          },
          {
            table: {
              widths: ['20%', '16%','16%','16%','16%','16%' ],
              body: [
                [
                  { text: 'TOTAL (PKR)', colSpan: 3, style: 'TotalStyle', margin: [5, 0, 0, 0] },
                  '',
                  '',
                  { text: this.currencyPipe.transform(this.getTotal(element, 'Amount'), ' ', ''), style: 'TotalStyle' },
                  { text: this.currencyPipe.transform(this.getTotal(element, 'Payment'), ' ', ''), style: 'TotalStyle' },
                  { text: this.currencyPipe.transform(this.getTotal(element, 'RemainingAmount'), ' ', ''), style: 'TotalStyle', margin: [0, 0, 0, 2] }
                ]
              ]
            },
            layout: 'lightHorizontalLines',
            margin: [0, 0, 0, 10],

            fillColor: '#F1F5F9',
          },
         
        ]
      )
    })

    return content;
  }



}

