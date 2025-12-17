import { Component, inject, OnInit } from '@angular/core';
import { SupplierOrderComponent } from '../supplier-order.component';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';

@Component({
  selector: 'app-supplier-order-list',
  standalone: true,
  imports: [BftButtonComponent, BftTableComponent,WrapperAddComponent],
  templateUrl: './supplier-order-list.component.html',
  styleUrl: './supplier-order-list.component.scss'
})
export class SupplierOrderListComponent extends BaseRoutedComponent implements OnInit {
  private _listService = inject(ListService);
  private modalService = inject(ModalService);
  title: string = componentRegister.supplierOrder.Title;
  isVisible: boolean = false;
  data = [];
  columns = [
      
      {
          header: 'Date',
          name: 'Date',
          isSort: true,
          isFilterList: true,
          type: 'date',
      },
      {
        header: 'Supplier',
        name: 'SupplierName',
        isSort: true,
        isFilterList: true,
        type: 'text',
      },
      {
        header: 'Credit',
        name: 'TotalCredit',
        isSort: true,
        isFilterList: true,
        type: 'currency',
        total: true,
      },
      
      {
        header: 'Remaining',
        name: 'Remaining',
        isSort: true,
        isFilterList: true,
        type: 'currency',
        total: true,
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

  addSupplierInformation() {
      this.modalService
          .openModal({
              component: SupplierOrderComponent,
              title: this.title,
          })
          .afterClose.subscribe((res: boolean) => {
              if (res) {
                  this.getData();
              }
          });
  }

  getData() {
      this._listService.getSupplierOrders().subscribe({
          next: (res: any) => {
              this.data = res;
          },
          error: (err) => {
              console.error('Error fetching Supplier Information:', err);
          },
      });
  }

  onView(row) {
      this.modalService
          .openModal({
              component: SupplierOrderComponent,
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


