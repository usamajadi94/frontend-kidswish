import { Component, inject } from '@angular/core';
import { BftTableComponent } from "app/modules/shared/components/tables/bft-table/bft-table.component";
import { WrapperAddComponent } from "app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component";
import { BftButtonComponent } from "app/modules/shared/components/buttons/bft-button/bft-button.component";
import { ModalService } from 'app/modules/shared/services/modal.service';
import { CustomerManagementFormComponent } from '../customer-management-form.component';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';

@Component({
  selector: 'app-customer-management-list',
  standalone: true,
  imports: [WrapperAddComponent, BftButtonComponent, BftTableComponent],
  templateUrl: './customer-management-list.component.html',
  styleUrl: './customer-management-list.component.scss'
})
export class CustomerManagementListComponent extends BaseRoutedComponent {
  private modalService = inject(ModalService);
  private _listService = inject(ListService);
  title: string = componentRegister.customer.Title;
  isVisible: boolean = false;
  columns = [
    {
      header: 'Code',
      name: 'Code',
      isSort: true,
      isFilterList: true,
      type: 'text',
    },
    {
      header: 'Name',
      name: 'Description',
      isSort: true,
      isFilterList: true,
      type: 'text',
    },
    {
      header: 'Email',
      name: 'Email',
      isSort: true,
      isFilterList: true,
      type: 'text',
    },
    {
      header: 'Phone No',
      name: 'PhoneNo',
      isSort: true,
      isFilterList: true,
      type: 'pNumber',
    },
    {
      header: 'Address',
      name: 'Address',
      isSort: true,
      isFilterList: true,
      type: 'text',
    },

    {
      header: 'Active',
      name: 'IsActive',
      isSort: true,
      isFilterList: true,
      type: 'status',
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
    this._listService.getCustomerInformation().subscribe({
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
        component: CustomerManagementFormComponent,
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
        component: CustomerManagementFormComponent,
        title: this.title,
      })
      .afterClose.subscribe((res: boolean) => {
        if (res) {
          this.getData();
        }
      });
  }
}
