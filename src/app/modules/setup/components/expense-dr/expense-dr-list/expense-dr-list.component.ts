import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { ExpenseFormComponent } from '../../expense/expense-form.component';
import { ExpenseDrComponent } from '../expense-dr.component';

@Component({
  selector: 'app-expense-dr-list',
  standalone: true,
  imports: [BftTableComponent, WrapperAddComponent, BftButtonComponent, NzDatePickerModule, FormsModule],
  templateUrl: './expense-dr-list.component.html',
  styleUrl: './expense-dr-list.component.scss'
})
export class ExpenseDrListComponent extends BaseRoutedComponent {
  private modalService = inject(ModalService);
  private _listService = inject(ListService);
  title: string = componentRegister.expenseDr.Title;
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
      header: 'Description',
      name: 'Description',
      isSort: true,
      isFilterList: true,
      type: 'text',
    },
    {
      header: 'Category',
      name: 'ExpenseCategory',
      isSort: true,
      isFilterList: true,
      type: 'text',
    },
    {
      header: 'Payment Method',
      name: 'PaymentMethod',
      isSort: true,
      isFilterList: true,
      type: 'text',
    },
    {
      header: 'Amount',
      name: 'Amount',
      isSort: true,
      isFilterList: true,
      type: 'currency',
      total:true
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

  getData() {
    if (!this.date) return;

    let fromDate = '';
    let toDate = '';
    if(this.date != null && this.date.length ==2){
      
      fromDate = this.formatDate(this.date[0]);
      toDate = this.formatDate(this.date[1]);
    };



    this._listService.getExpenseDR(fromDate, toDate).subscribe({
      next: (res: any) => {
        this.data = res;
      },
      error: (err) => {
        console.error('Error fetching expense:', err);
      },
    });
  }

  onView(row) {
    this.modalService
      .openModal({
        component: ExpenseDrComponent,
        title: this.title,
        ID: row.ID,
      })
      .afterClose.subscribe((res: boolean) => {
        if (res) {
          this.getData();
        }
      });
  }

  addExpense() {
    this.modalService.openModal({
      component: ExpenseDrComponent,
      title: this.title,
      ID: null,
    }).afterClose.subscribe((res: boolean) => {
      if (res) {
        this.getData();
      }
    });;
  }

  date = null;

  onChange(result: Date[]): void {
    this.date = result;
    this.getData();
  }

  private formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}


}