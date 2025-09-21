import { Component, inject } from '@angular/core';
import { BftInputTextComponent } from "app/modules/shared/components/fields/bft-input-text/bft-input-text.component";
import { BftInputDateComponent } from "app/modules/shared/components/fields/bft-input-date/bft-input-date.component";
import { BftSelectComponent } from "app/modules/shared/components/fields/bft-select/bft-select.component";
import { BftTextareaComponent } from "app/modules/shared/components/fields/bft-textarea/bft-textarea.component";
import { BaseComponent } from 'app/core/Base/base/base.component';
import { Expense } from '../../models/expense';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { ActivatedRoute } from '@angular/router';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { FormsModule } from '@angular/forms';
import { BftInputCurrencyComponent } from 'app/modules/shared/components/fields/bft-input-currency/bft-input-currency.component';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [FormsModule, BftInputTextComponent, BftInputDateComponent, BftSelectComponent, BftTextareaComponent,BftInputCurrencyComponent],
  templateUrl: './expense-form.component.html',
  styleUrl: './expense-form.component.scss'
})
export class ExpenseFormComponent extends BaseComponent<
  Expense,
  ExpenseFormComponent
> {
  private _DrpService = inject(DrpService);
  expenseCategory: any[] = [];

  paymentMethod: any[] = [];

  constructor(
    private genSer: GenericService,
    private msgSer: MessageModalService,
    private modalSer: ModalService,
    private toasterSer: ToastService,
    public activatedRoute: ActivatedRoute
  ) {
    super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
    this.setControllerName(apiUrls.expenseController);
    this.setFormTitle(componentRegister.expense.Title);
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  public override async BeforeInit(): Promise<void> {
    await this.getExpenseCategory();
    await this.getPaymentMethod();
  }

  public override InitializeObject(): void {
    this.formData = new Expense();
  }

  override ValidateBeforeSave(formData: Expense): boolean {
    this.validation = [];
    if (!formData.Description || formData.Description.trim() === '') {
      this.validation.push('Description is required.');
    }
    if (!formData.ExpenseCategoryID || formData.ExpenseCategoryID == null) {
      this.validation.push('Category is required.');
    }
    if (!formData.Date || formData.Date == null) {
      this.validation.push('Date is required.');
    }
    return this.validation.length > 0;
  }

  getPaymentMethod() {
    this._DrpService.getPaymentMethodDrp().subscribe({
      next: (res: any) => {
        this.paymentMethod = res;
      },
      error: (err) => {
        console.error('Error fetching paymentMethod:', err);
      },
    });
  }

  getExpenseCategory() {
    this._DrpService.getExpenseCategoryDrp().subscribe({
      next: (res: any) => {
        this.expenseCategory = res;
      },
      error: (err) => {
        console.error('Error fetching expenseCategory:', err);
      },
    });
  }
}
