import { Component } from '@angular/core';
import { OrderBookerInformation } from '../../models/order-booker-info';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { FormsModule } from '@angular/forms';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { BftTextareaComponent } from 'app/modules/shared/components/fields/bft-textarea/bft-textarea.component';
import { BftInputNumberComponent } from "../../../shared/components/fields/bft-input-number/bft-input-number.component";
import { BftInputCurrencyComponent } from "../../../shared/components/fields/bft-input-currency/bft-input-currency.component";
import { componentRegister } from 'app/modules/shared/services/component-register';

@Component({
  selector: 'app-order-booker-information',
  standalone: true,
  imports: [BftInputTextComponent, FormsModule, BftTextareaComponent, BftInputNumberComponent, BftInputCurrencyComponent],
  templateUrl: './order-booker-information.component.html',
  styleUrl: './order-booker-information.component.scss'
})
export class OrderBookerInformationComponent extends BaseComponent<
    OrderBookerInformation,
    OrderBookerInformationComponent
> {
  constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.orderBookerInformatonController);
        this.setFormTitle(componentRegister.orderBooker.Title);
    }

    override ngOnInit(): void {
        super.ngOnInit();
    }

    public override InitializeObject(): void {
        this.formData = new OrderBookerInformation();
    }
    override ValidateBeforeSave(formData: OrderBookerInformation): boolean {
        this.validation = [];
    //   if (!formData.Code || formData.Code.trim() === '') {
    //         this.validation.push('Code is required.');
    //     }
        if (!formData.Description || formData.Description.trim() === '') {
            this.validation.push('Name is required.');
        }
        return this.validation.length > 0;
    }
}
