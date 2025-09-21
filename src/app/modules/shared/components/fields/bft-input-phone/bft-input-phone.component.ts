import { ChangeDetectorRef, Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor, NgModel } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

import { BftSkeletonComponent } from "../../skeleton/bft-skeleton/bft-skeleton.component";
@Component({
  selector: 'bft-input-phone',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    MatIconModule,
    NgxMaskDirective,
    BftSkeletonComponent
  ],
  templateUrl: './bft-input-phone.component.html',
  styleUrl: './bft-input-phone.component.scss',
  providers: [
    provideNgxMask(),
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BftInputPhoneComponent),
      multi: true
    }
  ]
})
export class BftInputPhoneComponent implements ControlValueAccessor {

  @Input() label: string | null = null;
  @Input({ required: true }) name: string = '';
  @Input() placholder: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() hint: boolean = false;
  @Input() skeleton: boolean = false;
  model: string | null = null;
  @Input() flagImg: string | null = null;
  @Input() suffixText: string | null = null;
  @Input() suffixIcon: string | null = null;
  @Input() mask: string = '';
  @Input() prefixText: string | null = null;
  @Input() prefixIcon: string | null = null;
  @Input() prefixSvgIcon: string | null = null;

  @Output() onChange = new EventEmitter<any>();

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.label
  }

  _onChange = (a: any) => { };

  writeValue(obj: any): void {
    if (obj !== undefined && obj !== null) {
      this.model = obj;
      this._onChange(this.model);

      this.cdr.detectChanges(); // 🔥 Force change detection
    }
  }
  registerOnChange(fn: any): void {
    this._onChange = fn
  }
  registerOnTouched(fn: any): void {

  }
  setDisabledState?(isDisabled: boolean): void {

  }

  onValueChange(value: any) {
    if (value !== undefined && value !== null) {
      this._onChange(value);
      this.onChange.emit(value);
    }
  }


  onFocusOut(param: NgModel) {
    if (param.control.invalid) {
      param.control.markAsDirty();
      param.control.updateValueAndValidity({ onlySelf: true })
    }
  }
}
