import { Component, inject } from '@angular/core';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { SaleInvoiceReturnComponent } from '../sale-invoice-return.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';

@Component({
  selector: 'app-sale-invoice-return-list',
  standalone: true,
  imports: [BftButtonComponent, BftTableComponent,WrapperAddComponent],
  templateUrl: './sale-invoice-return-list.component.html',
  styleUrl: './sale-invoice-return-list.component.scss'
})
export class SaleInvoiceReturnListComponent extends BaseRoutedComponent {
  private modalService = inject(ModalService);
  private _listService = inject(ListService);
  title: string = componentRegister.saleReturnInvoice.Title;

  isVisible: boolean = false;
  data = [];
  columns = [
    {
      header: 'Invocie No',
      name: 'InvoiceNo',
      isSort: true,
      isFilterList: true,
      type: 'text',
    },
    {
      header: 'Invoice Date',
      name: 'InvoiceDate',
      isSort: true,
      isFilterList: true,
      type: 'date',
    },
    {
      header: 'Customer',
      name: 'Customer',
      isSort: true,
      isFilterList: true,
      type: 'text',
    },
    {
      header: 'Order Booker',
      name: 'OrderBooker',
      isSort: true,
      isFilterList: true,
      type: 'text',
    },
    {
      header: 'Net Amount',
      name: 'NetAmount',
      isSort: true,
      isFilterList: true,
      type: 'currency',
    },
    {
      header: 'Modified By',
      name: 'ModifiedBy',
      isSort: true,
      isFilterList: true,
      type: 'text',
    },
    {
      header: 'Modified Date',
      name: 'ModifiedDate',
      isSort: true,
      isFilterList: true,
      type: 'date',
    },
  ];

  ngOnInit() {
    this.getData();
  }


  getData() {
    this._listService.getSaleInovicesRet().subscribe({
      next: (res: any) => {
        this.data = res;
      },
      error: (err) => {
        console.error('Error fetching Sale Invoice:', err);
      },
    });
  }
  addSaleInvoice() {
    this.modalService
      .openModal({
        component: SaleInvoiceReturnComponent,
        title: this.title,
      })
      .afterClose.subscribe((res: boolean) => {
        if (res) {
          this.getData();
        }
      });
  }
  onView(row) {
    this.modalService
      .openModal({
        component: SaleInvoiceReturnComponent,
        title: this.title,
        ID: row.ID,
      })
      .afterClose.subscribe((res: boolean) => {
        if (res) {
          this.getData();
        }
      });
  }
}
