import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from 'app/core/toaster/toast.service';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { Observable, firstValueFrom } from 'rxjs';
import { ApiResponse, ModalResult } from '../interface/IResponses';
import { GenericService } from '../services/generic.service';

@Component({
    selector: 'app-base',
    standalone: true,
    imports: [],
    templateUrl: './base.component.html',
})
export class BaseComponent<T, Component> {
    readonly nzModalData: any = inject(NZ_MODAL_DATA);
    readonly modalRef = inject(NzModalRef);
    public formData!: T;
    primaryKey: number = 0;
    controllerName: string = '';
    heading: string = '';
    btnText: 'Submit' | 'Update' = 'Submit';
    isView: boolean = false;
    isEdit: boolean = false;
    isCreated: boolean = false;
    isUpdated: boolean = false;
    isDeleted: boolean = false;
    formTitle: string = '';
    isDataLoaded: boolean = false;
    isBaseGetData: boolean = true;
    // saveSpin: boolean = false;
    // query: query | null = null;
    isRoute: boolean = false;
    validation: Array<any> = [];

    isDataLoading: boolean = false;
    isSubmitLoading: boolean = false;
    isDeleteLoading: boolean = false;

    ngOnInit(): void {
        this.BaseNgOninit();
    }

    constructor(
        private service: GenericService,
        private message: MessageModalService,
        private modalService: ModalService,
        private toaster: ToastService,
        public route: ActivatedRoute
    ) {}

    // Init Funcs
    private async BaseNgOninit() {
        if (this.isRoute) {
            this.route.params.subscribe((res: any) => {
                this.primaryKey = Number(res.ID) || 0;
            });
        } else {
            this.primaryKey = Number(this.nzModalData?.ID);
        }
        this.isDataLoading = true;
        await this.InitializeObject();
        Promise.all([
            await this.BeforeInit(),
            await this.OnInit(),
            await this.AfterInit()
        ]).then(async () => {

        })
    }

    public InitializeObject(): void {}

    public async BeforeInit() {}

    public async AfterInit() {}

    private async OnInit() {
        await this.resetForm();
        if (this.primaryKey > 0) {
            this.GetDataByID().then(async (res) => {});
        } else {
            this.heading = this.formTitle + ' / Add';
            await this.AfterDisplay();
            this.isDataLoading = false;
        }
        this.btnText = 'Submit';
    }

    resetForm() {
        this.InitializeObject();
        this.isCreated = true;
        this.isView = false;
        this.isEdit = false;
        this.isUpdated = false;
        this.heading = this.formTitle + ' / Add';
        this.btnText = 'Submit';
    }

    // set controller / Form Header
    setControllerName(controllerName: string) {
        this.controllerName = controllerName;
    }

    setFormTitle(formName: string) {
        this.formTitle = formName;
    }

    EditRecord() {
        this.BeforeEdit();
        this.isCreated = false;
        this.isView = false;
        this.isEdit = true;
        this.isDeleted = false;
        this.isUpdated = false;
        this.heading = this.formTitle + ' / Edit';
        this.AfterEdit();
    }

    // Crud
    async InsertRecord() {
        this.isSubmitLoading = true;
        if (this.ValidateBeforeSave(this.formData) == true) {
            this.modalService.validationModal(this.validation);
            this.isSubmitLoading = false;
            return;
        }
        await this.BeforeUpSert(this.formData);

        let operation$: Observable<
            ApiResponse<T> | ApiResponse<T[]> | ApiResponse<T | T[]>
        >;

        if (this.primaryKey === 0) {
            this.BeforeInsert(this.formData); // Since it's void, call it directly

            if (Array.isArray(this.formData)) {
                operation$ = this.service.bulkinsert(
                    this.controllerName,
                    this.formData
                );
            } else {
                operation$ = this.service.insert(
                    this.controllerName,
                    this.formData
                );
            }
        } else {
            this.BeforeUpdate(this.formData);
            operation$ = this.service.update(
                this.controllerName,
                this.primaryKey,
                this.formData
            );
        }

        try {
            const res = await firstValueFrom(operation$);
            this.formData = res.Data as T;
            if (this.primaryKey === 0) {
                this.message.success('Created Successfully!');
                this.isCreated = true;
                this.AfterInsert(this.formData);
            } else {
                this.message.info('Updated Successfully!');
                this.isUpdated = true;
                this.AfterUpdate(this.formData);
            }

            this.isView = false;
            this.isEdit = false;
            this.isDeleted = false;
            if (!this.isRoute)
                this.modalService.closeModal(
                    new ModalResult(this.formData, true),
                    this.modalRef
                );

            this.AfterUpsert(this.formData);
            this.isSubmitLoading = false;
        } catch (error) {
            this.isSubmitLoading = false;
            if (this.toaster.onError(error, error.error) === true) {
                this.modalService.apiValidationModal(
                    error.error.Message,
                    error.error.Errors || []
                );
            }
        }
        /*if (this.primaryKey == 0) {
            await this.BeforeInsert(this.formData);
            await (
                await this.service.insert(this.controllerName, this.formData)
            ).subscribe(
                (res: any) => {
                    this.formData = res as T;
                    this.message.success('Created Successfully!');
                    if (!this.isRoute) {
                        this.modalService.closeModal(true);
                    }
                    this.isCreated = true;
                    this.isView = false;
                    this.isEdit = false;
                    this.isDeleted = false;
                    this.isUpdated = false;
                    this.AfterInsert(this.formData);
                    this.AfterUpsert(this.formData);
                },
                (error) => {
                    this.toaster.openResult(error.status);
                }
            );
        } else if (this.primaryKey > 0) {
            this.BeforeUpdate(this.formData);
            await (
                await this.service.update(this.controllerName, this.formData)
            ).subscribe(
                (res: any) => {
                    this.formData = res as T;
                    this.message.info('Updated Successfully!');
                    if (!this.isRoute) {
                        this.modalService.closeModal(true);
                    }
                    this.isUpdated = true;
                    this.isCreated = false;
                    this.isDeleted = false;
                    this.isView = false;
                    this.isEdit = false;
                    this.AfterUpdate(this.formData);
                    this.AfterUpsert(this.formData);
                },
                (error) => {
                    this.toaster.openResult(error.status);
                }
            );
        }*/
    }

    public AfterUpdate(formData: T) {}

    public AfterInsert(formData: T) {}
    public BeforeEdit() {}

    public AfterEdit() {}

    public AfterUpsert(formData: T) {}

    public BeforeUpdate(formData: T) {}

    public BeforeUpSert(formData: T) {}

    public BeforeInsert(formData: T) {}

    async GetDataByID() {
        if (this.primaryKey > 0) {
            await this.BeforeGetData();
            this.isDataLoaded = false;
            if (this.isBaseGetData === true) {
                await (
                    await this.service.getDataByID(
                        this.controllerName,
                        this.primaryKey
                        // this.query
                    )
                ).subscribe(
                    async (res: ApiResponse<T>) => {
                        this.formData = res.Data as T;
                        this.heading = this.formTitle + ' / View';
                        this.isView = true;
                        this.isCreated = false;
                        this.isDeleted = false;
                        this.isEdit = false;
                        this.isUpdated = false;
                        this.isDataLoaded = true;
                        await this.AfterGetData();
                        this.isDataLoading = false;
                    },
                    (error) => {
                        // this.isDataLoading = false;
                        this.toaster.openResult(error.status);
                    }
                );
            }
        }
    }

    public AfterDisplay(): void {}

    public async Delete() {
        this.modalService
            .confirmModal()
            .afterClosed()
            .subscribe(async (res) => {
                if (res) {
                    this.isDeleteLoading = true;
                    await this.BeforeDelete(this.formData);
                    (
                        await this.service.delete(
                            this.controllerName,
                            this.primaryKey
                        )
                    ).subscribe(
                        async (res) => {
                            this.message.success('Deleted Successfully!');
                            this.isCreated = false;
                            this.isView = false;
                            this.isEdit = false;
                            this.isUpdated = false;
                            this.isDeleted = true;
                            await this.AfterDelete();
                            if (!this.isRoute) {
                                if (!this.isRoute)
                                    this.modalService.closeModal(
                                        new ModalResult(this.formData, true),
                                        this.modalRef
                                    );
                            }
                            this.isDeleteLoading = false;
                        },
                        (error) => {
                            this.isDeleteLoading = false;
                            if (
                                this.toaster.onError(error, error.error) ===
                                true
                            ) {
                                this.modalService.apiValidationModal(
                                    error.error.Message,
                                    error.error.Errors || []
                                );
                            }
                            // this.toaster.openResult(error.status);
                        }
                    );
                }
            });
    }

    public async BeforeDelete(fomrData: T) {}
    public async AfterDelete() {}

    BeforeGetData() {}

    public AfterGetData() {}

    closeModal() {
        if (!this.isRoute)
            this.modalService.closeModal(
                new ModalResult(this.formData, true),
                this.modalRef
            );
    }

    // insert Validations
    ValidateBeforeSave(formData: T): boolean {
        return false;
    }

    loadData(drawerInfo: any) {
        if (drawerInfo) {
            this.primaryKey = drawerInfo?.ID;
        } else {
            this.primaryKey = 0;
        }
    }
}
