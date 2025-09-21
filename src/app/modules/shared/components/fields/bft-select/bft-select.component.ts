import { Component, EventEmitter, forwardRef, Input, Output, TemplateRef } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, NgModel, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';

import { NzSelectModule } from 'ng-zorro-antd/select';
import { BftSkeletonComponent } from '../../skeleton/bft-skeleton/bft-skeleton.component';
import { MatDividerModule } from '@angular/material/divider';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';
@Component({
  selector: 'bft-select',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzSelectModule,
    NzInputModule,
    MatIconModule,
    BftSkeletonComponent,
    MatIconModule,
    MatDividerModule,
    WrapperAddComponent
  ],
  templateUrl: './bft-select.component.html',
  styleUrl: './bft-select.component.scss',
  providers:[
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BftSelectComponent),
      multi: true
    }
  ]
})
export class BftSelectComponent  implements ControlValueAccessor{
  @Input() label: string | null = null;
  @Input() name: string = '';
  @Input() mode: 'multiple' | 'default' = 'default';
  @Input() required: boolean = false;
  @Input() placeholder: any = null;
  @Input() displayList: Array<any> = [];
  @Input() displayField: string = '';
  @Input() valueField: string = '';
  @Input() disabled: boolean = false;
  @Input() hint: boolean = false;
  @Input() enableAddFeature: boolean = false;
  @Input() skeleton:boolean = false;
  model: string | null = null;
  @Input() clearable: boolean = false;
  @Output() onChange = new EventEmitter<any>();
  @Output() onAddNewItem = new EventEmitter<any>();
  @Input() SCode:string = null;
  constructor() { }

  ngOnInit(): void {

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

  onFocusOut(param: NgModel) {
    if (param.control.invalid) {
      param.control.markAsDirty();
      param.control.updateValueAndValidity({ onlySelf: true })
    }
  }

  onAddClick(){
    this.onAddNewItem.emit();
  }
}
