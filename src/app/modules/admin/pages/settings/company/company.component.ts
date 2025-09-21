import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { BftInputPhoneComponent } from 'app/modules/shared/components/fields/bft-input-phone/bft-input-phone.component';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { BftTextareaComponent } from 'app/modules/shared/components/fields/bft-textarea/bft-textarea.component';
import { Company } from '../../models/company';
import { HttpClient } from '@angular/common/http';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { CommonModule } from '@angular/common';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ReportPdfService } from 'app/modules/shared/services/report-pdf.service';

@Component({
    selector: 'app-company',
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
    templateUrl: './company.component.html',
    styleUrl: './company.component.scss',
})
export class CompanyComponent implements OnInit {

  ngOnInit(): void {  }

  ngAfterViewInit(): void {
    this.getCompanyInfo()
  }
  private _http = inject(HttpClient);
  private cdr =   inject(ChangeDetectorRef)
  private _ReportPdfService =   inject(ReportPdfService)
  private _MessageModalService = inject(MessageModalService);
  formData = new Company();


  getCompanyInfo(){
    this.formData = new Company();
    this._http.get(apiUrls.companyFetch).subscribe((res:any) =>{
      this.formData = res.Data as Company;
      this.cdr.detectChanges();
    })
  }

  updateMyProfile(){
    this._http.put(apiUrls.companyFetch, this.formData).subscribe((res:any) =>{ 
      this.getCompanyInfo();
      this._MessageModalService.success('Company Updated Successfully!');
     })
  }
}
