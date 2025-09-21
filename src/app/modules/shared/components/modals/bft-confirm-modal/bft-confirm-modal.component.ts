import { Component, inject } from '@angular/core';
import { BftButtonComponent } from "../../buttons/bft-button/bft-button.component";
import { NzModalRef } from 'ng-zorro-antd/modal';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-bft-confirm-modal',
  standalone: true,
  imports: [BftButtonComponent,MatIconModule],
  templateUrl: './bft-confirm-modal.component.html',
  styleUrl: './bft-confirm-modal.component.scss'
})
export class BftConfirmModalComponent {

  modal = inject(NzModalRef);

  onYesClick(){
    this.modal.destroy(true);
  }

  onNoClick(){
    this.modal.destroy(false);
  }
}
