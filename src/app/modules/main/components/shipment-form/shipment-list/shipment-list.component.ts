import { Component, inject } from '@angular/core';
import { ShipmentFormComponent } from '../shipment-form.component';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { FormsModule } from '@angular/forms';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';

@Component({
  selector: 'app-shipment-list',
  standalone: true,
  imports: [BftButtonComponent, BftTableComponent, WrapperAddComponent, NzDatePickerModule, FormsModule],
  templateUrl: './shipment-list.component.html',
  styleUrl: './shipment-list.component.scss'
})
export class ShipmentListComponent extends BaseRoutedComponent {
  date = null;
  private modalService = inject(ModalService);
  private _listService = inject(ListService);
  title: string = componentRegister.shipmentView.Title;
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
      header: 'Shipmet Date',
      name: 'ShipmentDate',
      isSort: true,
      isFilterList: true,
      type: 'date',
    },
    {
      header: 'Total Amount',
      name: 'Total',
      isSort: true,
      isFilterList: true,
      total: true,
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
  data = [];
  ngOnInit() {
     const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);          // 1st day of month
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);      // last day of month
    this.date = [firstDay, lastDay];
    this.getData();
  }

  
  

  onChange(result: Date[]): void {
    this.date = result;
    this.getData();
  }


  getData() {
    if (!this.date) return;

    let fromDate = '';
    let toDate = '';
    if(this.date != null && this.date.length ==2){
      
      fromDate = this.formatDate(this.date[0]);
      toDate = this.formatDate(this.date[1]);
    };

    this._listService.getShipments(fromDate, toDate).subscribe({
      next: (res: any) => {
        this.data = res;
      },
      error: (err) => {
        console.error('Error fetching Shipments:', err);
      },
    });
  }

  onView(row) {
    this.modalService
      .openModal({
        component: ShipmentFormComponent,
        title: this.title,
        ID: row.ID,
      })
      .afterClose.subscribe((res: boolean) => {
        if (res) {
          this.getData();
        }
      });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }
}


