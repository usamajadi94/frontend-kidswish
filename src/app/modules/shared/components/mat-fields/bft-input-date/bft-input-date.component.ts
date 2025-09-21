import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'bft-input-date',
  standalone: true,
  imports: [
      FormsModule,
      ReactiveFormsModule,
      MatFormFieldModule,
      MatInputModule,
      MatIconModule,
      MatDatepickerModule
    ],
  templateUrl: './bft-input-date.component.html',
  styleUrl: './bft-input-date.component.scss',
  providers:[provideNativeDateAdapter(),
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BftInputDateComponent),
      multi: true
    }
  ]
})
export class BftInputDateComponent implements ControlValueAccessor{
 
  @Input() label :string | null= null;
  @Input({required:true}) name:string = '';
  @Input() placholder:string = '';
  @Input() required : boolean = false;
  @Input() disabled:boolean = false;
  @Input() hint:boolean = false;
  @Input() skeleton:boolean = false;
  model: any = null;
  @Input() suffixText:string | null = null;
  @Input() suffixIcon:string | null = null;
  
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

