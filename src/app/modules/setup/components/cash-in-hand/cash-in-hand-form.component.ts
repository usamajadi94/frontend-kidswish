import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { BftInputDateComponent } from 'app/modules/shared/components/fields/bft-input-date/bft-input-date.component';
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { BftInputCurrencyComponent } from 'app/modules/shared/components/fields/bft-input-currency/bft-input-currency.component';
import { BftTextareaComponent } from 'app/modules/shared/components/fields/bft-textarea/bft-textarea.component';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { CashInHand } from '../../models/cash-in-hand';

@Component({
    selector: 'app-cash-in-hand-form',
    standalone: true,
    imports: [CommonModule, FormsModule, BftInputDateComponent, BftSelectComponent, BftInputCurrencyComponent, BftTextareaComponent],
    templateUrl: './cash-in-hand-form.component.html',
})
export class CashInHandFormComponent extends BaseComponent<CashInHand, CashInHandFormComponent> {
    private _drp = inject(DrpService);
    private _http = inject(HttpClient);

    paymentCategories: any[] = [];
    expenseCategories: any[] = [];
    vendors: any[] = [];

    selectedFile: File | null = null;
    isUploading = false;
    uploadError = '';

    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.cashInHandController);
        this.setFormTitle(componentRegister.cashInHand.Title);
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this._drp.getPaymentCategoryDrp().subscribe({ next: (res: any) => { this.paymentCategories = res; } });
        this._drp.getExpenseCategoryDrp().subscribe({ next: (res: any) => { this.expenseCategories = res; } });
        this._drp.getVendorDrp().subscribe({ next: (res: any) => { this.vendors = res; } });
    }

    public override InitializeObject(): void {
        this.formData = new CashInHand();
        this.formData.Date = new Date() as any;
    }

    get isDailyExpense(): boolean {
        if (!this.formData?.PaymentCategoryID) return false;
        const cat = this.paymentCategories.find(c => c.ID === this.formData.PaymentCategoryID);
        return cat?.Description === 'Daily Expense';
    }

    onCategoryChange(): void {
        if (!this.isDailyExpense) {
            this.formData.ExpenseCategoryID = null;
        }
    }

    override ValidateBeforeSave(formData: CashInHand): boolean {
        this.validation = [];
        if (!formData.PaymentCategoryID) this.validation.push('Category is required.');
        if (!formData.Date) this.validation.push('Date is required.');
        if (!formData.Amount || formData.Amount <= 0) this.validation.push('Amount must be greater than 0.');
        if (this.isDailyExpense && !formData.ExpenseCategoryID) this.validation.push('Sub Category is required for Daily Expense.');
        return this.validation.length > 0;
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (!input.files?.length) return;
        this.selectedFile = input.files[0];
        this.uploadError = '';
        this.uploadFile();
    }

    uploadFile(): void {
        if (!this.selectedFile) return;
        this.isUploading = true;
        const fd = new FormData();
        fd.append('file', this.selectedFile);
        this._http.post<any>(`${apiUrls.server}api/cash-in-hand/upload`, fd).subscribe({
            next: (res) => {
                if (res.Success) this.formData.AttachmentPath = res.Data.path;
                else this.uploadError = res.Message || 'Upload failed';
                this.isUploading = false;
            },
            error: () => { this.uploadError = 'Upload failed. Try again.'; this.isUploading = false; },
        });
    }

    removeAttachment(): void {
        this.formData.AttachmentPath = null;
        this.selectedFile = null;
        this.uploadError = '';
    }

    get attachmentUrl(): string {
        return this.formData?.AttachmentPath ? `${apiUrls.server}${this.formData.AttachmentPath}` : '';
    }

    get attachmentFileName(): string {
        return this.formData?.AttachmentPath?.split('/').pop() || '';
    }

    get isImage(): boolean {
        const ext = this.formData?.AttachmentPath?.split('.').pop()?.toLowerCase() || '';
        return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
    }
}
