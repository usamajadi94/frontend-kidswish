import { Component, inject, OnInit } from '@angular/core';
import { BftInputTextComponent } from "../../shared/components/fields/bft-input-text/bft-input-text.component";
import { BftInputDateComponent } from "../../shared/components/fields/bft-input-date/bft-input-date.component";
import { BftSelectComponent } from "../../shared/components/fields/bft-select/bft-select.component";
import { DrpService } from 'app/modules/shared/services/drp.service';
import { BftButtonComponent } from "../../shared/components/buttons/bft-button/bft-button.component";
import { ReportService } from 'app/modules/shared/services/report.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReportViewerToolComponent } from '../report-viewer-tool/report-viewer-tool.component';

@Component({
  selector: 'app-report-viewer',
  standalone: true,
  templateUrl: './report-viewer.component.html',
  styleUrls: ['./report-viewer.component.scss'],
  imports: [CommonModule,BftInputTextComponent, BftInputDateComponent, BftSelectComponent, BftButtonComponent, FormsModule, ReportViewerToolComponent]
})
export class ReportViewerComponent implements OnInit {
  private _DrpService = inject(DrpService);
  private _ReportService = inject(ReportService);

  records: any[] = [];
  invoiceNo: string = '';
  fromDate: Date = null;
  endDate: Date = null;
  customerID: number = null;
  orderBookerID: number = null;
  salesmanID: number = null;

  customers: any[] = []
  orderBookers: any[] = [];
  salesmans: any[] = [];

  ngOnInit(): void {
    this.getCustomers();
    this.onGenerate();
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
    this._ReportService.getSaleInvoiceReport(this.invoiceNo,
      this.customerID,
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
                Customer: curr.Customer,
                CustomerBusinessName: curr.CustomerBusinessName,
                OrderBooker: curr.OrderBooker,
                Salesman: curr.Salesman,
                Vehicle: curr.Vehicle,
                Route: curr.Route,
                Area: curr.Area,
                City: curr.City,
                MemberType: curr.MemberType,
                items: [curr]
              });
            }
            return acc;
          }, []);
          this.records = groupedInvoices;
        },
        error: (err) => {
          console.error('Error fetching salesmans:', err);
        },
      }
      );
  }

  onReset() {
    this.invoiceNo = '';
    this.fromDate = null;
    this.endDate = null;
    this.customerID = null;
    this.orderBookerID = null;
    this.salesmanID = null;
    this.records = [];
  }

}
