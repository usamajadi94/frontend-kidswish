import { Component, inject } from '@angular/core';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { IResult } from '../../../interface/IResult';
import { NzResultModule } from 'ng-zorro-antd/result';

@Component({
  selector: 'app-result-toast',
  standalone: true,
  imports: [NzResultModule],
  templateUrl: './result-toast.component.html',
  styleUrl: './result-toast.component.scss'
})
export class ResultToastComponent {
  readonly modal = inject(NzModalRef);
  readonly nzModalData: any = inject(NZ_MODAL_DATA);
  
  result:IResult={
    status:"",
    message:"",
    title:""
  };

  constructor(){}

  ngOnInit(): void {
    this.setStatus();
  }

  onClose(): void {
    this.modal.close ({ data: 'Modal closed' });
  }

  setStatus(){
    var status = this.nzModalData?.status;
    this.result.title = `${this.nzModalData?.status} - ${this.nzModalData?.title}` || "Result";
    if(status == "403"){
      this.result.status = "403";
      this.result.message = "Sorry, you are not authorized.";
    }
    else if(status == "404"){
      this.result.status = "404";
      this.result.message = "Sorry, the page you visited does not exist.";
    }
    else if(status == "500"){
      this.result.status = "500";
      this.result.message = "Sorry, there is an error on server.";
    }
    else{
      this.result.status = "500";
      this.result.message = "Sorry, there is an error on server.";
    }
  }
}
