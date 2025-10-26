import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { Supplier_Order_Ledger, Supplier_Order_LedgerDTO } from 'app/modules/setup/models/supplier-order-ledger';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftInputCurrencyComponent } from 'app/modules/shared/components/fields/bft-input-currency/bft-input-currency.component';
import { BftInputDateComponent } from 'app/modules/shared/components/fields/bft-input-date/bft-input-date.component';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { BftTextareaComponent } from 'app/modules/shared/components/fields/bft-textarea/bft-textarea.component';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-supplier-order-ledger',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    BftInputCurrencyComponent,
    BftInputDateComponent,
    BftInputTextComponent,
    BftTextareaComponent,
    BftButtonComponent
  ],
  templateUrl: './supplier-order-ledger.component.html',
  styleUrl: './supplier-order-ledger.component.scss'
})
export class SupplierOrderLedgerComponent extends BaseComponent<
  Array<Supplier_Order_Ledger>,
  SupplierOrderLedgerComponent> {
    private _DrpService = inject(DrpService);
    customersDrp: Array<any> = [];
    supplierDto = new supplier();
    formDataDTO = new Array<Supplier_Order_LedgerDTO>();
    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.supplierOrderLedgerController);
        this.setFormTitle(componentRegister.supplierLedger.Title);
        this.isBaseGetData = false;
    }

    ngOnInit(): void {
        super.ngOnInit();
    }

    public AfterDisplay(): void {
        this.addBillRow();
    }

    override InitializeObject(): void {
        this.formData = new Array<Supplier_Order_Ledger>();
    }
    public async BeforeInit(): Promise<void> {
      this.onLoad();
    }

    addBillRow() {
        let row = Object.assign({}, new Supplier_Order_LedgerDTO());

        row.TransactionDate = new Date();
        this.formDataDTO.push(row);
    }

    onLoad() {
        this.formDataDTO = [];
        console.log(this.nzModalData?.Data);
        const data = this.nzModalData?.Data;
        if(data){

            this.supplierDto.SupplierName = data?.SupplierName;
            this.supplierDto.SupplierOrderMasterID = data?.SupplierOrderMasterID;
            this.supplierDto.OrderDate = data.OrderDate;

            this._DrpService
                .getSupplierOrderLedger(this.supplierDto.SupplierOrderMasterID.toString())
                .subscribe({
                    next: (res: any) => {
                        console.log('prev Bills', res);
                        this.formDataDTO = res;
                        this.addBillRow();
                    },
                    error: (err) => {
                        console.error('Error fetching items:', err);
                    },
                });
        }
    }

    deleteDetailRow(index: number) {
        this.formDataDTO.splice(index, 1);
    }

    public BeforeInsert(formData: Supplier_Order_Ledger[]): void {
      this.formData = this.formDataDTO
      .map(({ Balance, ...rest }) => {
          rest.SupplierOrderMasterID = this.supplierDto.SupplierOrderMasterID;
          return rest;
      })
      .filter((x) => x.ID === 0);
    }

    public override ValidateBeforeSave(formData: Supplier_Order_Ledger[]): boolean {
        this.validation = [];

        return this.validation.length > 0;
    }
  
}

export class supplier {
    SupplierOrderMasterID: number = 0;
    OrderDate: DateTime = null;
    SupplierName: string = null;
}
