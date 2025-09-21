import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'bft-input-email',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './bft-input-email.component.html',
  styleUrl: './bft-input-email.component.scss',
  providers:[
      {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => BftInputEmailComponent),
        multi: true
      }
    ]
})
export class BftInputEmailComponent implements ControlValueAccessor{
 
  @Input() label :string | null= null;
  @Input({required:true}) name:string = '';
  @Input() placholder:string = '';
  @Input() required : boolean = false;
  @Input() disabled:boolean = false;
  @Input() hint:boolean = false;
  @Input() skeleton:boolean = false;
  model: string | null = null;
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
