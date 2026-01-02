import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { ApiResponse } from 'app/core/Base/interface/IResponses';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { Company } from 'app/modules/admin/pages/models/company';
import { Shipment } from 'app/modules/factory/models/shipment.model';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftCheckboxComponent } from 'app/modules/shared/components/fields/bft-checkbox/bft-checkbox.component';
import { BftInputCurrencyComponent } from 'app/modules/shared/components/fields/bft-input-currency/bft-input-currency.component';
import { BftInputDateComponent } from 'app/modules/shared/components/fields/bft-input-date/bft-input-date.component';
import { BftInputNumberComponent } from 'app/modules/shared/components/fields/bft-input-number/bft-input-number.component';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { BftTextareaComponent } from 'app/modules/shared/components/fields/bft-textarea/bft-textarea.component';
import { BftSkeletonComponent } from 'app/modules/shared/components/skeleton/bft-skeleton/bft-skeleton.component';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { ListService } from 'app/modules/shared/services/list.service';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { InvoiceDetail } from '../../models/invoice-detail';
import { InvoiceMaster } from '../../models/invoice-master';
import { ShipmentMaster } from 'app/modules/factory/models/shipment-master.model';
import { MatTabsModule } from '@angular/material/tabs';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';

@Component({
  selector: 'app-shipment-form',
  standalone: true,
  imports: [
          CommonModule,
          FormsModule,
          BftInputTextComponent,
          BftSelectComponent,
          BftInputCurrencyComponent,
          BftInputDateComponent,
          BftInputNumberComponent,
          BftButtonComponent,
          BftCheckboxComponent,
          MatIconModule,
          NzTableModule,
          MatDividerModule,
          NzSelectModule,
          BftTextareaComponent,
          BftSkeletonComponent,
          MatTabsModule,
          NzCollapseModule
  ],
  templateUrl: './shipment-form.component.html',
  styleUrl: './shipment-form.component.scss'
})
export class ShipmentFormComponent  extends BaseComponent<
    ShipmentMaster,
    ShipmentFormComponent
> {
    private _DrpService = inject(DrpService);
    private listService = inject(ListService);
    private _http = inject(HttpClient);
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _router = inject(Router);
    componentRegister = componentRegister;
    items: any[] = [];
    customers: any[] = [];
    subTotal: number = null;

    
    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.shipmentController);
        this.setFormTitle(componentRegister.shipmentView.Title);
    }
    override ngOnInit(): void {
        super.ngOnInit();
    }

    public override async BeforeInit(): Promise<void> {
      await this.getItems();
    }

    public override async AfterInit(): Promise<void> {
        
    }
    public override InitializeObject(): void {
        this.formData = new ShipmentMaster();
    }

    public AfterGetData(): void {
      
    }

    getItems() {
        this.listService.getProductWithFlavor().subscribe({
            next: (res: any) => {
                this.items = this.groupByProduct(res);
            },
            error: (err) => {
                console.error('Error fetching items:', err);
            },
        });
    }
    

    // -- Validation
    override ValidateBeforeSave(formData: ShipmentMaster): boolean {
        this.validation = []; // Clear previous validations
        let hasDetailError = false;
        if (!formData.ShipmentDate || formData.ShipmentDate == null) {
            this.validation.push('Shipment Date is required.');
        }

        if (!formData.Shipment || formData.Shipment.length === 0) {
            hasDetailError = true;
        } else {
            for (const detail of formData.Shipment) {
                if (!detail.FlavourID || !detail.Price || !detail.Qty) {
                    hasDetailError = true;
                    break;
                }
            }
        }

        if (hasDetailError) {
            this.validation.push('Kindly fill your fields in the details tab.');
        }

        return this.validation.length > 0;
    }

    groupByProduct(data: any[]) {
        const grouped: { [key: number]: any } = {};

        data.forEach((item) => {
            if (!grouped[item.ProductID]) {
                grouped[item.ProductID] = {
                    ProductID: item.ProductID,
                    name: item.ProductName,
                    NetWeight: item.NetWeight,
                    flavours: [],
                };
            }

            grouped[item.ProductID].flavours.push({
                ProductID: `${item.ProductID}`,
                FlavorID: item.FlavorID,
                name: item.FlavorName,
            });
        });

        return Object.values(grouped);
    }


    onPrint() {
        if (this.formData?.InvoiceNo) {
            const url = `${window.location.origin}/#/report/shipment-invoice?invoiceNo=${this.formData.InvoiceNo}`;
            window.open(url, '_blank');
            // this.modalRef.close();
        }
    }

    onItemSelect(element:Shipment){
        const product = this.items.find(p => 
            p.flavours.some(f => f.FlavorID === element.FlavourID)
        );
        if(product != null){
            element.NetWeight = product.NetWeight * element.Case;     
            element.GrossWeight = product.NetWeight * element.Case;     
        }
    }

}
