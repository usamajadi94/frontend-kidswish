import { Component, inject } from '@angular/core';
import { SalesmanInformationComponent } from '../salesman-information.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';

@Component({
  selector: 'app-salesman-information-list',
  standalone: true,
  imports: [BftButtonComponent, BftTableComponent,WrapperAddComponent],
  templateUrl: './salesman-information-list.component.html',
  styleUrl: './salesman-information-list.component.scss'
})
export class SalesmanInformationListComponent extends BaseRoutedComponent{
 private modalService = inject(ModalService);
  private _listService = inject(ListService);
  title: string = componentRegister.salesman.Title;
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
      header: 'Phone No',
      name: 'PhoneNo',
      isSort: true,
      isFilterList: true,
      type: 'text',
    },
     {
      header: 'Address',
      name: 'Address',
      isSort: true,
      isFilterList: true,
      type: 'text',
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
    this._listService.getSalesmanInformation().subscribe({
      next: (res: any) => {
        this.data = res;
      },
      error: (err) => {
        console.error('Error fetching Order Booker Information:', err);
      },
    });
  }

  onView(row) {
    this.modalService
      .openModal({
        component: SalesmanInformationComponent,
        title: this.title,
        ID: row.ID,
      })
      .afterClose.subscribe((res: boolean) => {
        if (res) {
          this.getData();
        }
      });
  }

  addMemberType() {
    this.modalService
      .openModal({
        component: SalesmanInformationComponent,
        title: this.title,
      })
      .afterClose.subscribe((res: boolean) => {
        if (res) {
          this.getData();
        }
      });
  }
}

