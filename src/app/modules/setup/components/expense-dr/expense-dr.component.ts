import { Component, inject } from '@angular/core';
import { ExpenseDR } from '../../models/expense dr';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { FormsModule } from '@angular/forms';
import { BftInputCurrencyComponent } from 'app/modules/shared/components/fields/bft-input-currency/bft-input-currency.component';
import { BftInputDateComponent } from 'app/modules/shared/components/fields/bft-input-date/bft-input-date.component';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { BftTextareaComponent } from 'app/modules/shared/components/fields/bft-textarea/bft-textarea.component';

@Component({
  selector: 'app-expense-dr',
  standalone: true,
  imports: [FormsModule, BftInputTextComponent, BftInputDateComponent, BftSelectComponent, BftTextareaComponent,BftInputCurrencyComponent],
  templateUrl: './expense-dr.component.html',
  styleUrl: './expense-dr.component.scss'
})
export class ExpenseDrComponent extends BaseComponent<
  ExpenseDR,
  ExpenseDrComponent
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
    this.setControllerName(apiUrls.expenseDrController);
    this.setFormTitle(componentRegister.expenseDr.Title);
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  public override async BeforeInit(): Promise<void> {
    await this.getExpenseCategory();
    await this.getPaymentMethod();
  }

  public override InitializeObject(): void {
    this.formData = new ExpenseDR();
  }

  override ValidateBeforeSave(formData: ExpenseDR): boolean {
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
