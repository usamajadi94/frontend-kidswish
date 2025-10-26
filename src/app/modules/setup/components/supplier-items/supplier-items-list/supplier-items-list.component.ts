import { Component, inject, OnInit } from '@angular/core';
import { SupplierItemsComponent } from '../supplier-items.component';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';

@Component({
  selector: 'app-supplier-items-list',
  standalone: true,
  imports: [BftButtonComponent, BftTableComponent,WrapperAddComponent],
  templateUrl: './supplier-items-list.component.html',
  styleUrl: './supplier-items-list.component.scss'
})
export class SupplierItemsListComponent extends BaseRoutedComponent implements OnInit {
  private _listService = inject(ListService);
  private modalService = inject(ModalService);
  title: string = componentRegister.supplierItems.Title;
  isVisible: boolean = false;
  data = [];
  columns = [
      
      {
          header: 'Name',
          name: 'Description',
          isSort: true,
          isFilterList: true,
          type: 'text',
      },
      {
        header: 'Price',
        name: 'Price',
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

  addSupplierInformation() {
      this.modalService
          .openModal({
              component: SupplierItemsComponent,
              title: this.title,
          })
          .afterClose.subscribe((res: boolean) => {
              if (res) {
                  this.getData();
              }
          });
  }

  getData() {
      this._listService.getSupplierItems().subscribe({
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
              component: SupplierItemsComponent,
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

