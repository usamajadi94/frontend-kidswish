import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { BftInputPhoneComponent } from 'app/modules/shared/components/fields/bft-input-phone/bft-input-phone.component';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { BftTextareaComponent } from 'app/modules/shared/components/fields/bft-textarea/bft-textarea.component';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { Shipment_Informaton } from '../../models/shipment';

@Component({
    selector: 'app-shipment',
    standalone: true,
    imports: [
        FormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatButtonModule,
        BftInputTextComponent,
        BftTextareaComponent,
        BftInputPhoneComponent,
        CommonModule,
    ],
    templateUrl: './shipment.component.html',
    styleUrl: './shipment.component.scss',
})
export class ShipmentComponent {
    formData = new Shipment_Informaton();
    ngOnInit(): void {}

    ngAfterViewInit(): void {
        this.getShipmentInfo();
    }
    private _http = inject(HttpClient);
    private cdr = inject(ChangeDetectorRef);
    private _MessageModalService = inject(MessageModalService);

    updateShipmentInfo() {
        this._http
            .put(apiUrls.shipmentUpdate, this.formData)
            .subscribe((res: any) => {
                this.getShipmentInfo();
                this._MessageModalService.success(
                    'Shipment Updated Successfully!'
                );
            });
    }

    getShipmentInfo() {
        this.formData = new Shipment_Informaton();
        this._http.get(apiUrls.shipmentFetch).subscribe((res: any) => {
            this.formData = res.Data as Shipment_Informaton;
            this.cdr.detectChanges();
        });
    }
}
