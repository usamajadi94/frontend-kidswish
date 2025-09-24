import { Component, inject, OnInit } from '@angular/core';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { ItemProfileComponent } from '../../item-profile/item-profile-form.component';
import { FlavorStockComponent } from '../flavor-stock.component';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';

@Component({
  selector: 'app-flavor-stock-list',
  standalone: true,
  imports: [BftButtonComponent, BftTableComponent, WrapperAddComponent],
  templateUrl: './flavor-stock-list.component.html',
  styleUrl: './flavor-stock-list.component.scss'
})
export class FlavorStockListComponent extends BaseRoutedComponent implements OnInit {
  private modalService = inject(ModalService);
  private _listService = inject(ListService);

  ngOnInit() {
    this.getData();
  }

  title: string = componentRegister.flavorStock.Title;
  isVisible: boolean = false;
  columns = [
    {
      header: 'Date',
      name: 'Date',
      isSort: true,
      isFilterList: true,
      type: 'date',
    },
    {
      header: 'Flavor',
      name: 'FlavorName',
      isSort: true,
      isFilterList: true,
      type: 'text',
    },
    {
      header: 'Current Stock',
      name: 'CurrentStock',
      isSort: true,
      isFilterList: true,
      type: 'number',
    },
    {
      header: 'Qty',
      name: 'Qty',
      isSort: true,
      isFilterList: true,
      type: 'number',
    },
    {
      header: 'Updated Stock',
      name: 'UpdatedStock',
      isSort: true,
      isFilterList: true,
      type: 'number',
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
  data: any[] = [];

  getData() {
    this._listService.getFlavorStock().subscribe({
      next: (res: any) => {
        this.data = res;
      },
      error: (err) => {
        console.error('Error fetching Flavor Stock:', err);
      },
    });
  }

  onView(row: any) {
    return;
  }

  onAdd() {
    this.modalService
      .openModal({
        component: FlavorStockComponent,
        title: this.title,
      })
      .afterClose.subscribe((res: boolean) => {
        if (res) this.getData();
      });
  }




}
