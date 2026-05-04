import { inject, Inject, Injectable, ViewContainerRef } from '@angular/core';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { BftFormComponent } from '../components/modals/bft-form/bft-form.component';
import { BftConfirmModalComponent } from '../components/modals/bft-confirm-modal/bft-confirm-modal.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatDialogRef } from '@angular/material/dialog';
import { FuseConfirmationDialogComponent } from '@fuse/services/confirmation/dialog/dialog.component';
import { ValidationModalComponent } from '../components/modals/validation-modal/validation-modal.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  modalRef: NzModalRef;
  formModalRef: NzModalRef;
  private drawerRef: NzDrawerRef | undefined;

  modal = inject(NzModalService);
  private _fuseConfirmationService = inject(FuseConfirmationService);
  constructor(
  ) { }

  openModal(config: FormConfig, width: number = 1450): NzModalRef {
    const modalRef = this.modal.create({
      nzContent: BftFormComponent,
      nzData: this.dataInfo(config.ID, config.component, config?.Data),
      nzFooter: null,
      nzClassName: 'bft-form',
      nzWidth: width,
      nzMaskClosable: false,
    });
    return modalRef;
  }

  closeModal(result?: any, modalRef?: NzModalRef) {
    if (modalRef) {
      modalRef.destroy(result);
    } else if (this.formModalRef) {
      this.formModalRef.destroy(true);
    }
  }


  // openModal(config: FormConfig):NzModalRef {
  //   console.log("Opening modal...");

  //   this.formModalRef = this.modal.create({
  //     // nzTitle: config.title,// config.title,
  //     nzContent: BftFormComponent,
  //     // nzViewContainerRef: this.viewContainerRef ,
  //     nzData: this.dataInfo(config.ID, config.component,config?.Data),
  //     nzFooter: null,
  //     nzClassName: 'bft-form',
  //     nzWidth: 1450,
  //     // nzClosable: false,
  //     nzMaskClosable: false,
  //     // nzCentered:true
  //   });

  //   return this.formModalRef;

  // }

  openToasterModal<T = NzSafeAny>(config: ModalConfig): NzModalRef {
    this.modalRef = this.modal.create<T>({
      nzTitle: config.title,
      nzContent: config.content,
      nzViewContainerRef: config.viewContainerRef,
      nzData: config.data || {},
      nzFooter: config.footer || [],
      nzClassName: config.className || '',
      nzCentered: true
    });

    return this.modalRef;
  }

  // closeModal(mode: boolean = false) {
  //   console.log("Closing modal...", this.formModalRef);
  //   if (this.formModalRef) {

  //     this.formModalRef.destroy(true);
  //   }
  //   console.log("Modal closed and reference cleared.");
  // }

  afterCloseModal(): NzModalRef {
    return this.formModalRef;
  }


  public confirmModal(config: ConfirmModalConfig = {
    title: 'Confirmation',
    message: "Are you sure you want to delete this?",
    icon: "heroicons_outline:question-mark-circle"
  }): MatDialogRef<FuseConfirmationDialogComponent> {
    return this._fuseConfirmationService
      .open({
        title: config.title,
        message: config.message,
        icon: config.icon && config.icon != '' ? {
          show: true,
          name: 'heroicons_outline:exclamation-triangle',
          color: 'warn',
        } : {
          show: false,
          name: "",
          color: "error"
        },
        actions: {
          confirm: {
            show: true,
            label: 'Yes',
            color: 'accent',
          },
          cancel: {
            show: true,
            label: 'No',
          },
        },
        dismissible: true,
      })

    /*  const modalRef = this.modal.create({
        nzContent:BftConfirmModalComponent,
        nzFooter:null,
        nzCentered:true,
        nzWidth:'400px'
      });
  
      return modalRef;*/
  }

  public validationModal(validationInfo: Array<any>): NzModalRef {
    const modalRef = this.modal.create({
      nzTitle: "Validation Required",
      nzContent: ValidationModalComponent,
      nzData: {
        validationInfo: validationInfo
      },
      nzFooter: null,
      nzCentered: true,
      nzWidth: '400px'
    });

    return modalRef;
  }

  public apiValidationModal(Title: string = "Error Occured", validationInfo: Array<any>): NzModalRef {
    const modalRef = this.modal.create({
      nzTitle: Title,
      nzContent: ValidationModalComponent,
      nzData: {
        validationInfo: validationInfo
      },
      nzFooter: null,
      nzCentered: true,
      nzWidth: '400px'
    });

    return modalRef;
  }

  private dataInfo(ID: number, component: NzSafeAny, Data: NzSafeAny = {}): NzSafeAny {
    const editInfo = {
      ID: ID ? ID : 0,
      component: component,
      Data: Data
    }
    return editInfo;
  }

  private confirmBeforeClose(modalRef: NzModalRef): boolean {

    this.confirmModal({
      title:"Confirmation",
      message:"Are you sure you want to close?",
      icon:"heroicons_outline:question-mark-circle"
    }).afterClosed().subscribe(async (res)=>{
      if(res){
        modalRef.destroy(undefined);
      }
    })
    
    // returning false prevents auto close
    return false;
  }
}
export interface ModalConfig {
  title: string | null;
  content: NzSafeAny;
  viewContainerRef?: ViewContainerRef;
  data?: {};
  footer?: NzSafeAny[];
  className?: string;
}

export interface FormConfig {
  title: string;
  component: any;
  ID?: number;
  Data?: any
}

export interface ConfirmModalConfig {
  title: string;
  message: string;
  icon: string;
}