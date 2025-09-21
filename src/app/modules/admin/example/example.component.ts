import { Component, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BftCheckboxComponent } from 'app/modules/shared/components/fields/bft-checkbox/bft-checkbox.component';
import { BftInputCurrencyComponent } from 'app/modules/shared/components/fields/bft-input-currency/bft-input-currency.component';
import { BftInputDateComponent } from 'app/modules/shared/components/fields/bft-input-date/bft-input-date.component';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { ExampleTableComponent } from './example-table/example-table.component';
// import { BftInputEmailComponent } from 'app/modules/shared/fields/bft-input-email/bft-input-email.component';
// import { BftInputNumberComponent } from 'app/modules/shared/fields/bft-input-number/bft-input-number.component';
// import { BftInputPasswordComponent } from 'app/modules/shared/fields/bft-input-password/bft-input-password.component';
// import { BftInputTextComponent } from 'app/modules/shared/fields/bft-input-text/bft-input-text.component';
// import { BftSelectComponent } from 'app/modules/shared/fields/bft-select/bft-select.component';
// import { BftTextareaComponent } from 'app/modules/shared/fields/bft-textarea/bft-textarea.component';
// import { BftInputPhoneComponent } from "../../shared/fields/bft-input-phone/bft-input-phone.component";
import { BftButtonComponent } from "../../shared/components/buttons/bft-button/bft-button.component";
import { NzModalService } from 'ng-zorro-antd/modal';
import { ExampleFormComponent } from './example-form/example-form.component';

@Component({
  selector: 'example',
  standalone: true,
  templateUrl: './example.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [
    BftCheckboxComponent,
    FormsModule, ReactiveFormsModule,
    BftInputCurrencyComponent,
    BftInputDateComponent,
    // BftInputTextComponent,
    // BftInputEmailComponent,
    // BftInputNumberComponent,
    // , BftTextareaComponent, BftInputPasswordComponent, BftSelectComponent, BftInputCurrencyComponent, 
    // BftInputPhoneComponent,
    BftButtonComponent
  ],
})
export class ExampleComponent {
  name = "";
  email = "";
  teaxtarea = "";
  number: number | null = null;
  date = "";
  password = "";
  nameS = "";
  currency = "";
  check = null;
  phone = null;

  data: any[] = [
    {
      "id": "1",
      "name": "John Doe",
      "email": "john.doe@dummy.com",
      "phone": "+1234567890",
      "address": "123 Main Street, City1, Country1",
      "jobTitle": "Software Engineer",
      "age": 30
    },
    {
      "id": "2",
      "name": "Jane Smith",
      "email": "jane.smith@dummy.com",
      "phone": "+0987654321",
      "address": "456 Elm Street, City2, Country2",
      "jobTitle": "Product Manager",
      "age": 28
    },
    {
      "id": "3",
      "name": "Alex Brown",
      "email": "alex.brown@dummy.com",
      "phone": "+1122334455",
      "address": "789 Oak Avenue, City3, Country3",
      "jobTitle": "Data Scientist",
      "age": 35
    },
    {
      "id": "4",
      "name": "Emily White",
      "email": "emily.white@dummy.com",
      "phone": "+2233445566",
      "address": "101 Pine Lane, City4, Country4",
      "jobTitle": "UX Designer",
      "age": 27
    },
    {
      "id": "5",
      "name": "Michael Green",
      "email": "michael.green@dummy.com",
      "phone": "+3344556677",
      "address": "202 Maple Road, City5, Country5",
      "jobTitle": "DevOps Engineer",
      "age": 32
    }
  ]

  /**
   * Constructor
   */
  constructor(private modalService:ModalService) {
  }

  onclick() {
    this.modalService.openModal({
      component:ExampleFormComponent,
      title:'Add New Form'
    });
  }

  
}
