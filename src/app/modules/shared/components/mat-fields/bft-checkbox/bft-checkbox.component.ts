import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'bft-checkbox',
  standalone: true,
imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatCheckboxModule
  ],
  templateUrl: './bft-checkbox.component.html',
  styleUrl: './bft-checkbox.component.scss',
  providers:[
        {
          provide: NG_VALUE_ACCESSOR,
          useExisting: forwardRef(() => BftCheckboxComponent),
          multi: true
        }
      ]
})
export class BftCheckboxComponent implements ControlValueAccessor{
 
  @Input() label :string | null= null;
  @Input({required:true}) name:string = '';
  @Input() disabled:boolean = false;
  @Input() hint:boolean = false;
  @Input() skeleton:boolean = false;
  model: boolean | null = null;
  
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

}
