import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor, NgModel } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { BftSkeletonComponent } from '../../skeleton/bft-skeleton/bft-skeleton.component';

@Component({
  selector: 'bft-input-number',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    NzFormModule,
    NzInputModule,
    MatIconModule,
    BftSkeletonComponent
  ],
  templateUrl: './bft-input-number.component.html',
  styleUrl: './bft-input-number.component.scss',
   providers:[
      {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => BftInputNumberComponent),
        multi: true
      }
    ]
})
export class BftInputNumberComponent implements ControlValueAccessor{
 
  @Input() label :string | null= null;
  @Input({required:true}) name:string = '';
  @Input() placholder:string = '';
  @Input() required : boolean = false;
  @Input() disabled:boolean = false;
  @Input() hint:boolean = false;
  @Input() skeleton:boolean = false;
  model: number | null = null;
  @Input() suffixText:string | null = null;
  @Input() suffixIcon:string | null = null;
  @Input() prefixText:string | null = null;
   @Input() prefixIcon:string | null = null;
   @Input() prefixSvgIcon:string | null = null;
   
  @Output() onChange = new EventEmitter<any>();
  
  constructor() {}

  ngOnInit(): void {
    this.label
  }

  _onChange = (a: any) => { };
  
  writeValue(obj: any): void {
    if (obj !== undefined)
      this.model = obj;
  }
  registerOnChange(fn: any): void {
    this._onChange = fn
  }
  registerOnTouched(fn: any): void {
    
  }
  setDisabledState?(isDisabled: boolean): void {
    
  }

  onValueChange(value: any) {
    this._onChange(value);
    this.onChange.emit(this.model);
  }

  onFocusOut(param:NgModel){
    if(param.control.invalid){
      param.control.markAsDirty();
      param.control.updateValueAndValidity({onlySelf:true})
    }
  }
}

