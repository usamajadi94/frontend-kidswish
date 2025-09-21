import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import { AutoComplete } from '../../models/autocomplete';
import { AsyncPipe } from '@angular/common';

import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'bft-select',
  standalone: true,
  imports: [
      FormsModule,
      ReactiveFormsModule,
      MatFormFieldModule,
      MatSelectModule,
      MatIconModule,
      AsyncPipe,
      NgxMatSelectSearchModule
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
export class BftSelectComponent implements ControlValueAccessor{
 
  @Input() label= null;  
  @Input({required:true}) name:string = '';
  @Input() placeholder:string = '';
  @Input() required : boolean = false;
  @Input() disabled:boolean = false;
  @Input() skeleton:boolean = false;
  model: string | null = null;
  @Input() displayField:string  = '';
  @Input() valueField:string  = '';
  @Input() data:any[]=[];
  @Output() onChange = new EventEmitter<any>();
  
  @Input() multiple:boolean  = false;
  @Input() search:boolean  = false;
  @Output() selectChanged = new EventEmitter<any>();
  searchLead:any=null;
  SearchAutoComplete:AutoComplete = new AutoComplete(this.displayField,this.valueField);
  
  constructor() {}

  
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
    this.selectChanged.emit(this.model);

  }

  ngOnInit(): void {
    this.SearchAutoComplete = new AutoComplete(this.displayField,this.valueField);
    this.onLoadData();
  }
  
  ngOnChanges(){
    this.SearchAutoComplete = new AutoComplete(this.displayField,this.valueField);
    this.onLoadData();
    
  }

  onLoadData(){
    this.SearchAutoComplete.data = this.data;
    this.SearchAutoComplete.resultsGet();
  }
  
}
