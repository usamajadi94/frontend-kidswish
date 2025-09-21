import { Component, inject } from '@angular/core';
import { CustomerOrderComponent } from '../customer-order.component';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';

@Component({
  selector: 'app-customer-order-list',
  standalone: true,
  imports: [BftButtonComponent, BftTableComponent, WrapperAddComponent],
  templateUrl: './customer-order-list.component.html',
  styleUrl: './customer-order-list.component.scss'
})
export class CustomerOrderListComponent extends BaseRoutedComponent {
  private modalService = inject(ModalService);
  private _listService = inject(ListService);
  title: string = componentRegister.customerOrder.Title;
  isVisible: boolean = false;
  columns = [
    {
      header: 'Customer',
      name: 'CustomerName',
      isSort: true,
      isFilterList: true,
      type: 'text',
    },
    {
      header: 'Order Date',
      name: 'OrderDate',
      isSort: true,
      isFilterList: true,
      type: 'date',
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
  data = [];

  ngOnInit() {
    this.getData();
  }

  getData() {
    this._listService.getCustomerOrders().subscribe({
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
        component: CustomerOrderComponent,
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
        component: CustomerOrderComponent,
        title: this.title,
      })
      .afterClose.subscribe((res: boolean) => {
        if (res) {
          this.getData();
        }
      });
  }

 
}

