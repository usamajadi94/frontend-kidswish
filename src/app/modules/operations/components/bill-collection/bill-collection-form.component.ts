import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftAutocompleteComponent } from 'app/modules/shared/components/fields/bft-autocomplete/bft-autocomplete.component';
import { BftInputCurrencyComponent } from 'app/modules/shared/components/fields/bft-input-currency/bft-input-currency.component';
import { BftInputDateComponent } from 'app/modules/shared/components/fields/bft-input-date/bft-input-date.component';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { NzTableModule } from 'ng-zorro-antd/table';
import { BillCollection } from '../../model/bill-collection';

@Component({
    selector: 'app-bill-collection',
    standalone: true,
    imports: [
        BftInputTextComponent,
        NzTableModule,
        CommonModule,
        FormsModule,
        BftInputDateComponent,
        MatIconModule,
        BftButtonComponent,
        BftSelectComponent,
        MatTabsModule,
        BftInputCurrencyComponent,
        BftAutocompleteComponent,
    ],
    templateUrl: './bill-collection-form.component.html',
    styleUrl: './bill-collection-form.component.scss',
})
export class BillCollectionComponent extends BaseComponent<
    Array<BillCollection>,
    BillCollectionComponent
> {
    private _DrpService = inject(DrpService);
    customersDrp: Array<any> = [];
    customerDto = new customer();
    formDataDTO = new Array<BillCollection>();
    previousBillRecovery = new Array<BillCollection>();
    BillTransaction: Array<BillCollection> = [];
    UnpaidBill: Array<BillCollection> = [];

    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.billCollectionController);
        this.setFormTitle(componentRegister.billCollection.Title);
        this.isBaseGetData = false;
    }

    ngOnInit(): void {
        super.ngOnInit();
    }

    public AfterDisplay(): void {
        this.addBillRow();
    }

    override InitializeObject(): void {
        this.formData = new Array<BillCollection>();
    }
    public async BeforeInit(): Promise<void> {
        await this.getCustomers();
    }

    addBillRow() {
        let row = Object.assign({}, new BillCollection());

        row.TransactionDate = new Date();
        this.formDataDTO.push(row);
    }

    getCustomers() {
        this._DrpService.getCustomerInformationDrp().subscribe({
            next: (res: any) => {
                this.customersDrp = res;
                if (this.primaryKey > 0) {
                    this.customerDto.CustomerID = this.primaryKey;
                    this.onCustomerChange(this.customerDto.CustomerID);
                    this.isDataLoading = false;
                }
            },
            error: (err) => {
                console.error('Error fetching customers:', err);
            },
        });
    }

    onItemSelect() {}

    onCustomerChange(customerId: number) {
        this.formDataDTO = [];
        this.BillTransaction = [];
        this.UnpaidBill = [];
        var customer = this.customersDrp.filter((c) => c.ID === customerId);
        if (customer.length > 0) {
            this.customerDto.BusinessName = customer[0].BusinessName;
            this.customerDto.PhoneNo = customer[0].PhoneNo;
            this.customerDto.Address = customer[0].Address;

            this._DrpService
                .getBillCollectionByCustomer(customerId.toString())
                .subscribe({
                    next: (res: any) => {
                        console.log('prev Bills', res['value']);
                        this.previousBillRecovery = res['value'];
                        this.BillTransaction = res['Table1'];
                        this.UnpaidBill = res['Table2'];
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

    public BeforeInsert(formData: BillCollection[]): void {
        this.formData = this.formDataDTO
            .map((x) => {
                x.CustomerID = this.customerDto.CustomerID;
                return x;
            })
            .filter((x) => x.ID === 0);
    }

    public override ValidateBeforeSave(formData: BillCollection[]): boolean {
        this.validation = [];

        let hasNewRow = false;
        let hasMissingFields = false;

        if (!this.customerDto.CustomerID) {
            this.validation.push('Customer is required.');
        }

        this.formDataDTO.forEach((item) => {
            if (item.ID === 0) {
                hasNewRow = true;

                const isMissingFields =
                    !item.BillNo ||
                    item.BillNo.trim() === '' ||
                    !item.TransactionDate ||
                    ((item.Debit == null || item.Debit === 0) &&
                        (item.Credit == null || item.Credit === 0));

                if (isMissingFields) {
                    hasMissingFields = true;
                }
            }
        });

        if (!hasNewRow) {
            this.validation.push('Please add a new row.');
        }

        if (hasMissingFields) {
            this.validation.push(
                'Kindly fill the required fields in general detail.'
            );
        }

        return this.validation.length > 0;
    }

    getTotalForField(array: any[], field: string): number {
        return array
            .filter((item) => !!item.BillNo)
            .reduce((total, item) => total + (Number(item[field]) || 0), 0);
    }

    getGeneralDebit(): number {
        return this.getTotalForField(this.formDataDTO, 'Debit');
    }
    getGeneralCredit(): number {
        return this.getTotalForField(this.formDataDTO, 'Credit');
    }

    getTransactionDebit(): number {
        return this.getTotalForField(this.BillTransaction, 'Debit');
    }
    getTransactionCredit(): number {
        return this.getTotalForField(this.BillTransaction, 'Credit');
    }
    getTransactionRemaining(): number {
        return this.getTotalForField(this.BillTransaction, 'Remaining');
    }

    getUnpaidDebit(): number {
        return this.getTotalForField(this.UnpaidBill, 'Debit');
    }

    getUnpaidCredit(): number {
        return this.getTotalForField(this.UnpaidBill, 'Credit');
    }

    getUnpaidRemaining(): number {
        return this.getTotalForField(this.UnpaidBill, 'Remaining');
    }

    option: any[] = [];

    onInput(event: Event): void {
        const value = (event.target as HTMLInputElement).value.toLowerCase();

        const customerData = this.previousBillRecovery.filter(
        (item: any) => item.CustomerID === this.customerDto.CustomerID
    );

        const filtered = customerData.filter((item: any) =>
            item.BillNo?.toString().toLowerCase().includes(value)
        );

        // Extract unique BillNo values
        const uniqueBillNos = Array.from(
            new Set(filtered.map((item: any) => item.BillNo ))
        );

        this.option = uniqueBillNos;

        
    }

    onfilterChange(selectedItem: any, index:number): void {
        if (!selectedItem) return;
        const billNo = selectedItem.nzValue;
        const recoveryByBillNo = this.previousBillRecovery.filter(
            (res) => res.BillNo === billNo
        );

        const totalDebit = recoveryByBillNo.reduce(
            (sum, item) => sum + (item.Debit || 0),
            0
        );
        const totalCredit = recoveryByBillNo.reduce(
            (sum, item) => sum + (item.Credit || 0),
            0
        );

        const remaining = totalDebit - totalCredit;
        this.formDataDTO[index].Remaining = remaining;

        // this.formDataDTO[index].BillNo = selectedItem.nzValue;
        // selectedItem.nzValue = '';
        // selectedItem.nzLabel = '';
        this.option = [];
        // alert(this.formDataDTO[index].BillNo)
    }
}

export class customer {
    CustomerID: number = 0;
    BusinessName: string = '';
    PhoneNo: string = '';
    Address: string = '';
}

export class BillTransaction {
    BillNo: string = '';
    Debit: number = 0;
    Credit: number = 0;
    Remaining: number = 0;
}
