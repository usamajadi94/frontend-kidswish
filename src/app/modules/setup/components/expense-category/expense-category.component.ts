import { Component } from '@angular/core';
import { ExpenseCategory } from '../../models/expense-category';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';

@Component({
  selector: 'app-expense-category',
  standalone: true,
 imports: [FormsModule, BftInputTextComponent],
  templateUrl: './expense-category.component.html',
  styleUrl: './expense-category.component.scss'
})
export class ExpenseCategoryComponent extends BaseComponent<
    ExpenseCategory,
    ExpenseCategoryComponent
> {
    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.expenseCategoryController);
        this.setFormTitle(componentRegister.expenseCategory.Title);
    }

    override ngOnInit(): void {
        super.ngOnInit();
    }

    public override InitializeObject(): void {
        this.formData = new ExpenseCategory();
    }
    override ValidateBeforeSave(formData: ExpenseCategory): boolean {
        this.validation = [];
        if (!formData.Description) {
            this.validation.push('Description is required');
        }
        return this.validation.length > 0;
    }
}
