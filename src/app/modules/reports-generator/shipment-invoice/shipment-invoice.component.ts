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
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftInputDateComponent } from 'app/modules/shared/components/fields/bft-input-date/bft-input-date.component';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { ReportPdfService } from 'app/modules/shared/services/report-pdf.service';
import { ReportService } from 'app/modules/shared/services/report.service';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { Subject, takeUntil, lastValueFrom } from 'rxjs';
import { ReportViewerToolComponent } from '../report-viewer-tool/report-viewer-tool.component';

@Component({
  selector: 'app-shipment-invoice',
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
  templateUrl: './shipment-invoice.component.html',
  styleUrl: './shipment-invoice.component.scss'
})
export class ShipmentInvoiceComponent {
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
  isPrintViewEnable: boolean = false;
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


  onGenerate() {
    this._ReportService
      .getShipmentInvoiceReport(
        this.invoiceNo,
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
                ShipmentDate: curr.ShipmentDate,
                CompanyName: curr.CompanyName,
                CompanyRnc: curr.CompanyRnc,
                CompanyContactPerson: curr.CompanyContactPerson,
                CompanyAddress: curr.CompanyAddress,
                CompanyCity: curr.CompanyCity,
                CompanyCountry: curr.CompanyCountry,
                CompanyTel: curr.CompanyTel,
                CompanyEmail: curr.CompanyEmail,
                ClientName: curr.ClientName,
                ClientAddress: curr.ClientAddress,
                ClientCity: curr.ClientCity,
                ClientState: curr.ClientState,
                ClientZipcode: curr.ClientZipcode,
                ClientTel: curr.ClientTel,
                ClientFax: curr.ClientFax,
                ClientEmail: curr.ClientEmail,
                FirstDimension: curr.FirstDimension,
                SecondDimension: curr.SecondDimension,
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
      header: (currentPage: number, pageCount: number) => {
        return {
          columns: [
            {
              width: '*',
              text: '',
            },
            {
              width: 'auto',
              stack: [
                { text: '', height: 60 }, // Space to align with content position (after company name + FECHA/DATE)
                {
                  text: `PAGINA/PAGE: ${currentPage}/${pageCount}`,
                  style: 'FontStyle',
                  alignment: 'right',
                  fontSize: 9,
                }
              ]
            }
          ],
          margin: [40, 20, 40, 20] // Match content margins (default pdfMake margins)
        };
      },
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
      header: (currentPage: number, pageCount: number) => {
        return {
          columns: [
            {
              width: '*',
              text: '',
            },
            {
              width: 'auto',
              stack: [
                { text: '', height: 60 }, // Space to align with content position (after company name + FECHA/DATE)
                {
                  text: `PAGINA/PAGE: ${currentPage}/${pageCount}`,
                  style: 'FontStyle',
                  alignment: 'right',
                  fontSize: 9,
                }
              ]
            }
          ],
          margin: [40, 0, 40, 0] // Match content margins (default pdfMake margins)
        };
      },
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
        // Company Name Heading
        {
          text: element.CompanyName || '',
          style: 'companyTitle',
          alignment: 'center',
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },

        // Top Header Section
        {
          columns: [
            {
              width: '*',
              text: '',
            },
            {
              width: 'auto',
              stack: [
                {
                  text: `FACTURA: ${element.InvoiceNo || '-'}`,
                  style: 'FontStyle',
                  bold: true,
                  alignment: 'right',
                },
                {
                  text: `FECHA/DATE: ${this.formatDate(element.ShipmentDate)}`,
                  style: 'FontStyle',
                  alignment: 'right',
                },
                {
                  text: `GROSS WEIGHT KGS: ${this.getTotal(element, 'GrossWeight')}`,
                  style: 'FontStyle',
                  alignment: 'right',
                },
                {
                  text: `TOTAL PCS: ${this.getTotal(element, 'Case')}`,
                  style: 'FontStyle',
                  alignment: 'right',
                },
                // {
                //   text: `DABOSSLEAF CUTS DIMENSIONS: ${element.FirstDimension}`,
                //   style: 'FontStyle',
                //   alignment: 'right',
                // },
                
                element.FirstDimension ?
                {
                  text: `${element.FirstDimension?.toString().replace('\\n', '\n')}`,
                  style: 'FontStyle',
                  alignment: 'right',
                }
                : null,
                element.SecondDimension ? {
                  text: `DABOSSLEAF CUTS DIMENSIONS: ${element.SecondDimension}`,
                  style: 'FontStyle',
                  alignment: 'right',
                }
                : null,
              ],
            },
          ],
          margin: [0, 0, 0, 10],
        },

        // Company Info + Invoice Info
        {
          columns: [
            {
              width: '100%',
              stack: [
                {
                  text: `EMPRESA: ${element.CompanyName}`,
                  style: 'companyTitle',
                },
                {
                  stack: [
                    {
                      text: `RNC: ${element.CompanyRnc}`,
                      style: 'FontStyle',
                    },
                    {
                      text: `PERSONA DE CONTACTO: ${element.CompanyContactPerson}`,
                      style: 'FontStyle',
                    },
                    {
                      text: `DIRECCION: ${element.CompanyAddress},`,
                      style: 'FontStyle',
                    },
                    {
                      text: `${element.CompanyCity}, ${element.CompanyCountry}`,
                      style: 'FontStyle',
                    },
                    {
                      text: `TEL: ${element.CompanyTel}`,
                      style: 'FontStyle',
                    },
                    {
                      text: `EMAIL: ${element.CompanyEmail}`,
                      style: 'FontStyle',
                    },
                  ],
                }

              ],
            },
          ],
          margin: [0, 0, 0, 10],
        },

        // Ship To
        {
          stack: [
            {
              text: `CLIENTE: ${element.ClientName}`,
              style: 'companyTitle',
            },
            {
              text: `DIRECCION: ${element?.ClientAddress}, ${element?.ClientCity}, ${element?.ClientState} ${element?.ClientZipcode}`,
              style: 'FontStyle',
            },
            {
              text: `Tel: ${element?.ClientTel || '-'} | Fax: ${element?.ClientFax || '-'}`,
              style: 'FontStyle',
            },
            {
              text: `COMPANY EMAIL: ${element?.ClientEmail || '-'}`,
              style: 'FontStyle',
            },
          ],
          margin: [0, 0, 0, 20],
        },

        {
          table: {
            widths: ['20%', '60%', '20%'],
            body: [
              [
                { text: '' },
                {
                  text: 'ORIGIN OF ALL TOBACCO COMPONENTS, REPUBLICA DOMINICANA',
                  style: 'FontStyle',
                  alignment: 'center',
                },
                { text: '' },
              ],
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
        {
          table: {
            widths: ['20%', '60%', '20%'],
            body: [
              [
                { text: '' },
                {
                  text: 'DOES NOT INCLUDE ANY CUBAN TOBACCOS',
                  style: 'FontStyle',
                  bold: true,
                  alignment: 'center',
                  border: [true, true, true, true],
                },
                { text: '' },
              ]
            ]
          },
          layout: {
            defaultBorder: false,
          },
          margin: [0, 10, 0, 20],
        },
        // Table Header
        {
          table: {
            widths: ['5%', '7%', '8%', '9%', '9%', '22%', '16%', '12%', '12%'],
            body: [
              [
                {
                  text: 'MC UNITS',
                  style: 'TableHeaderFontSize',
                  bold: true,
                  alignment: 'center',
                },
                {
                  text: 'ITEM ID',
                  style: 'TableHeaderFontSize',
                  bold: true,
                  alignment: 'center',
                },
                {
                  text: 'QTY',
                  style: 'TableHeaderFontSize',
                  bold: true,
                  alignment: 'center',
                },
                {
                  text: 'NET WEIGHT KG',
                  style: 'TableHeaderFontSize',
                  bold: true,
                  alignment: 'center',
                },
                {
                  text: 'GROSS WEIGHT KG',
                  style: 'TableHeaderFontSize',
                  bold: true,
                  alignment: 'center',
                },
                {
                  text: 'DESCRIPTION',
                  style: 'TableHeaderFontSize',
                  bold: true,
                  alignment: 'center',
                },
                {
                  text: 'Flavor',
                  style: 'TableHeaderFontSize',
                  bold: true,
                  alignment: 'center',
                },
                {
                  text: 'PRICE',
                  style: 'TableHeaderFontSize',
                  bold: true,
                  alignment: 'center',
                },
                {
                  text: 'TOTAL PRICE USD',
                  style: 'TableHeaderFontSize',
                  bold: true,
                  alignment: 'center',
                },
              ],
              ...element.items.map((item: any, i: number) => [
                {
                  text: item?.Case?.toString() || '',
                  style: 'TableFontSize',
                  alignment: 'center',
                },
                {
                  text:
                    item?.ItemID || '',
                  style: 'TableFontSize',
                  alignment: 'center',
                },
                {
                  text: item?.Qty, style: 'TableFontSize',
                  alignment: 'center',
                },
                {
                  text: item?.NetWeight, style: 'TableFontSize',
                  alignment: 'center'
                },
                {
                  text: item?.GrossWeight, style: 'TableFontSize',
                  alignment: 'center'
                },
                {
                  text: item?.Description, style: 'TableFontSize',
                  alignment: 'center'
                },
                {
                  text: item?.Item, style: 'TableFontSize',
                  alignment: 'center'
                },
                {
                  text: this.currencyPipe.transform(
                    item?.Price,
                  ),
                  alignment: 'right',
                  style: 'TableFontSize',
                },
                {
                  text: this.currencyPipe.transform(
                    item?.TotalPrice,
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
            widths: ['5%', '7%', '8%', '9%', '9%', '22%', '16%', '12%', '12%'],
            body: [
              [
                {
                  text: this.getTotal(element, 'Case'),
                  style: 'TotalStyle',
                  alignment: 'center'
                },

                {
                  text: '',
                },
                {
                  text: '',
                },
                {
                  text: this.getTotal(element, 'NetWeight'),
                  style: 'TotalStyle',
                  alignment: 'center'
                },
                {
                  text: this.getTotal(element, 'GrossWeight'),
                  style: 'TotalStyle',
                  alignment: 'center'
                },
                {
                  text: 'GRAND TOTAL ALL GOODS',
                  style: 'TotalStyle',
                  alignment: 'center'
                },

                {
                  text: '',

                },
                {
                  text: '',

                },
                {
                  text: this.currencyPipe.transform(
                    this.getTotal(element, 'TotalPrice'),
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

        // Summary Section
        {
          stack: [
            {
              text: `CANT. BULTOS: ${this.getTotal(element, 'Case')}`,
              style: 'FontStyle',
              margin: [0, 0, 0, 5],
            },
            {
              text: 'NOTE:',
              style: 'FontStyle',
              margin: [0, 0, 0, 5],
            },
            {
              text: `TOTAL NET WEIGHT: ${this.getTotal(element, 'NetWeight')}`,
              style: 'FontStyle',
              margin: [0, 0, 0, 5],
            },
            {
              text: `TOTAL GROSS WEIGHT: ${this.getTotal(element, 'GrossWeight')}`,
              style: 'FontStyle',
              margin: [0, 0, 0, 5],
            },
          ],
          margin: [0, 20, 0, 20],
        },

        // Signature Section
        {
          stack: [
            {
              canvas: [
                {
                  type: 'line',
                  x1: 0,
                  y1: 0,
                  x2: 200,
                  y2: 0,
                  lineWidth: 1,
                  lineColor: '#666666',
                },
              ],
              margin: [0, 0, 0, 5],
              alignment: 'center',
            },
            {
              text: 'FIRMA',
              style: 'Signature',
              bold: true,
              alignment: 'center',
            },
          ],
          margin: [0, 0, 0, 10],
        },

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
    if (phoneNumber) {
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

  formatDate(date: any): string {
    if (!date) return '-';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    return formatDate(d, 'dd-MM-yyyy', 'en-US');
  }

  getDimensions(element: any): string {
    // Extract dimensions from items if available, or return default
    if (element.items && element.items.length > 0) {
      const dimensions = element.items
        .map((item: any) => item.Dimensions)
        .filter((dim: any) => dim)
        .join(' / ');
      return dimensions || '-';
    }
    return '-';
  }
}
