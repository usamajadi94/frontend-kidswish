import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BftInputDateComponent } from "app/modules/shared/components/fields/bft-input-date/bft-input-date.component";
import { BftSelectComponent } from "app/modules/shared/components/fields/bft-select/bft-select.component";
import { BftTextareaComponent } from "app/modules/shared/components/fields/bft-textarea/bft-textarea.component";
import { BaseComponent } from 'app/core/Base/base/base.component';
import { Expense } from '../../models/expense';
import { ListService } from 'app/modules/shared/services/list.service';
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
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [CommonModule, FormsModule, BftInputDateComponent, BftSelectComponent, BftTextareaComponent, BftInputCurrencyComponent],
  templateUrl: './expense-form.component.html',
  styleUrl: './expense-form.component.scss'
})
export class ExpenseFormComponent extends BaseComponent<Expense, ExpenseFormComponent> {
  private _DrpService = inject(DrpService);
  private _listService = inject(ListService);
  private _http = inject(HttpClient);

  expenseCategory: any[] = [];
  paymentMethod: any[] = [];
  pettyCashList: any[] = [];
  vendorList: any[] = [];

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
    this.setControllerName(apiUrls.expenseController);
    this.setFormTitle(componentRegister.expense.Title);
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  public override async BeforeInit(): Promise<void> {
    await this.getExpenseCategory();
    await this.getPaymentMethod();
    await this.getPettyCash();
    await this.getVendors();
  }

  public override InitializeObject(): void {
    this.formData = new Expense();
    this.formData.Date = new Date() as any;
    if (this.nzModalData?.Data?.PettyCashID) {
      this.formData.PettyCashID = this.nzModalData.Data.PettyCashID;
    }
  }

  override ValidateBeforeSave(formData: Expense): boolean {
    this.validation = [];
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
      next: (res: any) => { this.paymentMethod = res; },
    });
  }

  getExpenseCategory() {
    this._listService.getExpenseCategory().subscribe({
      next: (res: any) => { this.expenseCategory = res; },
    });
  }

  getPettyCash() {
    this._DrpService.getPettyCashDrp().subscribe({
      next: (res: any) => { this.pettyCashList = res; },
    });
  }

  getVendors() {
    this._DrpService.getVendorDrp().subscribe({
      next: (res: any) => {
        this.vendorList = res.map((v: any) => ({
          ...v,
          DisplayName: v.ContactName ? `${v.Name} - ${v.ContactName}` : v.Name,
        }));
      },
    });
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
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    this._http.post<any>(`${apiUrls.server}api/expense/upload`, formData).subscribe({
      next: (res) => {
        if (res.Success) {
          this.formData.AttachmentPath = res.Data.path;
        } else {
          this.uploadError = res.Message || 'Upload failed';
        }
        this.isUploading = false;
      },
      error: () => {
        this.uploadError = 'Upload failed. Try again.';
        this.isUploading = false;
      },
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
