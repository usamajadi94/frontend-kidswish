import { Component, inject } from '@angular/core';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { MatIcon } from '@angular/material/icon';
@Component({
  selector: 'app-validation-modal',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './validation-modal.component.html',
  styleUrl: './validation-modal.component.scss'
})
export class ValidationModalComponent {
  readonly nzModalData = inject(NZ_MODAL_DATA);
  readonly modalRef = inject(NzModalRef<ValidationModalComponent>);

  validationInfo: Array<any> = [];
  ngOnInit(): void {
    this.validationInfo = this.nzModalData.validationInfo;
  }

  onClose(): void {
    this.modalRef.destroy(); 
  }
  
}
