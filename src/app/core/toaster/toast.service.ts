import { Injectable, ViewContainerRef } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { ResultToastComponent } from 'app/modules/shared/components/toast/result-toast/result-toast.component';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../Base/interface/IResponses';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private resultRef: NzModalRef | undefined;
  
  constructor(
    private modalService:ModalService,
    
  ) { }

  openResult(status:string | number,message?:string, title?:string) {
    this.resultRef = this.modalService.openToasterModal({
      title:'',
      data:{
        title:title,
        message:message,
        status:status
      },
      className:'result-toast',
      content:ResultToastComponent,
      
    })
  }

  onError(error: HttpErrorResponse,ApiResponse?: ApiResponse<any>): boolean {
    if((error.status === 404 || error.status === 400) ){
      return true;
    }
    else{
      this.openResult(error.status, ApiResponse.Message , ApiResponse.Message);
    }
    return false
  }


  getResult(){
    this.resultRef;
  }
  
}