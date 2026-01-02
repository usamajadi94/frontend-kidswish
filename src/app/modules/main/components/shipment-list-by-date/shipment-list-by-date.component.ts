import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { BftInputDateComponent } from 'app/modules/shared/components/fields/bft-input-date/bft-input-date.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { MatButtonModule } from '@angular/material/button';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-shipment-list-by-date',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    BftInputDateComponent,
    FormsModule,
    CommonModule,
    ScrollingModule
  ],
  templateUrl: './shipment-list-by-date.component.html',
  styleUrl: './shipment-list-by-date.component.scss',
  animations: [
    trigger('detailExpand', [
        state('collapsed', style({ height: '0px', minHeight: '0' })),
        state('expanded', style({ height: '*' })),
        transition(
            'expanded <=> collapsed',
            animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
        ),
    ]),
],
})
export class ShipmentListByDateComponent extends BaseRoutedComponent {
  private modalService = inject(ModalService);
  private _listService = inject(ListService);
  title: string = componentRegister.shipmentView.Title;
  isVisible: boolean = false;
  dataSource: MatTableDataSource<any>;
  expandedElement: any | null = null;

  displayedColumns: string[] = [
    'expand',
    'date',
    'modifiedBy',
    'modifiedDate',
  ];
  detailColumns: string[] = ['product', 'flavor', 'quantity'];
  // Month/Year filter
  selectedMonth: Date | null = null;

  ngOnInit() {
    this.getData();
  }

  getData() {
    // Get current month as default
    if (!this.selectedMonth) {
      this.selectedMonth = new Date();
    }

    // this._listService.getShipments(this.selectedMonth).subscribe({
    //   next: (res: any) => {

    //     this.dataSource = new MatTableDataSource(this.groupByDates(res) || []);
    //   },
    //   error: (error) => {
    //     console.error('Error fetching payroll data:', error);
    //     this.dataSource = new MatTableDataSource([]);
    //   }
    // });
  }

  onMonthChange() {
    this.getData();
  }

  groupByDates(data: any[]) {
    const groupedDataMap = data.reduce((acc, entry) => {
      const dateKey = entry.Date; // group by full timestamp

      if (!acc[dateKey]) {
        acc[dateKey] = {
          Date: dateKey,
          ModifiedBy: entry.ModifiedBy,
          ModifiedDate: entry.ModifiedDate,
          Records: []
        };
      }

      acc[dateKey].Records.push(entry);

      return acc;
    }, {});

    // ✅ Convert to array format
    const groupData = Object.values(groupedDataMap);

    console.log(groupData);
    return groupData;
  }

  toggleRow(element: any) {
    this.expandedElement =
      this.expandedElement === element ? null : element;
  }

  getCaseQty(detail: any, type: 'Box' | 'Pouch' | 'Sticker',Qty:any) {
    if (detail[Qty] && detail[type + 'Case'] > 0) {
        return Math.floor(detail[Qty] / detail[type + 'Case']);
    }
    else { return 0;}
  }

}
