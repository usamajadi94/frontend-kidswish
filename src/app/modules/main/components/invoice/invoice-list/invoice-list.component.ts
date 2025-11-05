import { Component, inject } from '@angular/core';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { InvoiceComponent } from '../invoice.component';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [BftButtonComponent, BftTableComponent, WrapperAddComponent],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.scss'
})
export class InvoiceListComponent  extends BaseRoutedComponent {
  private modalService = inject(ModalService);
  private _listService = inject(ListService);
  title: string = componentRegister.invoice.Title;
  isVisible: boolean = false;
  columns = [
    {
      header: 'Invoice No',
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
      header: 'Total Amount',
      name: 'Total',
      isSort: true,
      isFilterList: true,
      type: 'currency',
    },
    // {
    //   header: 'Notes',
    //   name: 'Notes',
    //   isSort: true,
    //   isFilterList: true,
    //   type: 'text',
    // },
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
  data = [];

  ngOnInit() {
    this.getData();
  }

  getData() {
    this._listService.getInvoices().subscribe({
      next: (res: any) => {
        this.data = res;
      },
      error: (err) => {
        console.error('Error fetching Area Information:', err);
      },
    });
  }

  onView(row) {
    this.modalService
      .openModal({
        component: InvoiceComponent,
        title: this.title,
        ID: row.ID,
      })
      .afterClose.subscribe((res: boolean) => {
        if (res) {
          this.getData();
        }
      });
  }

  addItemType() {
    this.modalService
      .openModal({
        component: InvoiceComponent,
        title: this.title,
      })
      .afterClose.subscribe((res: boolean) => {
        if (res) {
          this.getData();
        }
      });
  }

 
}


