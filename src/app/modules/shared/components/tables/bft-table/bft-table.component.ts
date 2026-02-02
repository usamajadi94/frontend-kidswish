import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { NzCustomColumn, NzTableModule, NzTableSortFn, NzTableSortOrder } from 'ng-zorro-antd/table';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { MatIconModule } from '@angular/material/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { CommonModule } from '@angular/common';
// import { BftInputTextComponent } from "../../fields/bft-input-text/bft-input-text.component";
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BftCheckboxComponent } from '../../fields/bft-checkbox/bft-checkbox.component';
import { BftButtonComponent } from '../../buttons/bft-button/bft-button.component';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
@Component({
  selector: 'bft-table',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzModalModule,
    NzDrawerModule,
    NzDropDownModule,
    MatIconModule,
    NzTagModule,
    FormsModule,
    NzInputModule,
    NzAutocompleteModule,
    BftCheckboxComponent,
    BftButtonComponent,
    NzGridModule,
    NzPaginationModule,
    // BftInputTextComponent,
    DragDropModule,
    NgxMaskPipe
],
  templateUrl: './bft-table.component.html',
  styleUrl: './bft-table.component.scss',
  providers: [provideNgxMask()]
})
export class BftTableComponent  implements OnInit, OnChanges, OnDestroy {
  @Output() view: EventEmitter<any> = new EventEmitter();
  @Output() onNewClick: EventEmitter<any> = new EventEmitter();
  @Input() columns: any[] = [];
  @Input() dataSource: any[] = [];
  @Input() currency:string = "PKR ";
  // Make a copy of the original data source
  displayData: Array<any> = [];
  // Custom Columns
  customColumn: CustomColumn[] = [];
  fix: CustomColumn[] = [];
  notFix: CustomColumn[] = [];
  // loader
  loading: boolean = false;
  // custom
  visible = false;
  filtersArr: Array<any> = [];
  filtersStore: Array<any> = [];
  filterTitle: string = '';
  currentColumn: string = '';
  // Search 
  search: string = '';
  inputValue: any = '';
  options: string[] = [];
  isTotalExists: boolean = false;
  // Precomputed totals to avoid recalculating on every change detection
  totals: { [columnName: string]: number } = {};
  private _isVisible = true;
  // Debounced search subject to avoid filtering on every keystroke
  private _searchSubject = new Subject<string>();
  private _destroy$ = new Subject<void>();  

  @Input()
  get isVisible(): boolean {
    return this._isVisible;
  }
  
  @Output() isVisibleChange = new EventEmitter<boolean>();

  set isVisible(value: boolean) {
    this._isVisible = value;
    this.isVisibleChange.emit(this._isVisible);
  }

  constructor(private cdr: ChangeDetectorRef, ) { }

  ngOnInit(): void {
    // this.displayData = JSON.parse(JSON.stringify(this.dataSource));
    // console.log(this.displayData)
    this.setColumns();
    this.setExcelColumns();
    // Initialize displayData and calculate totals (shallow copy - we don't mutate row objects)
    if (this.dataSource && this.dataSource.length > 0) {
      this.displayData = [...this.dataSource];
      this.calculateTotals();
    }
    
    // Set up debounced search subscription
    this._searchSubject.pipe(
      debounceTime(300), // Wait 300ms after user stops typing
      distinctUntilChanged(), // Only trigger if search value actually changed
      takeUntil(this._destroy$)
    ).subscribe(searchValue => {
      this.performSearch(searchValue);
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this._searchSubject.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Shallow copy - row objects are never mutated, only the array is replaced when filtering
    this.displayData = this.dataSource ? [...this.dataSource] : [];
    this.calculateTotals();
  }

  setColumns() {
    this.isTotalExists = this.columns.some(col => (col?.total && col?.total === true));
    for (let index = 0; index < this.columns.length; index++) {
      var element: columnsDef = this.columns[index];
      this.createCustomColums(element);
      if (element.isSort === true) {
        element.sortDirections = ['ascend', 'descend', null];
        element.sortFn = this.createSortFn(element);
      }
    }
  }

  setExcelColumns(){
    const headerObject = this.columns.reduce((acc, value) => {
      acc[value.name] = value.header; // Add {name: header} to acc
      return acc; // Return the updated acc for the next iteration
    }, {});// Initial value of acc is an empty object {}

    var headerNames : any[]= [];
    headerNames.push(headerObject);

    const headerFormatObject = this.columns.reduce((acc, value) => {
      acc[value.name] = value.type; // Add {name: header} to acc
      return acc; // Return the updated acc for the next iteration
    }, {});// Initial value of acc is an empty object {}

    var headerTypes : any[]= [];
    headerTypes.push(headerFormatObject);
/*
    this.excelService.exportHeader = headerNames;
    this.excelService.exportColumnNamesAndFormat = headerTypes;

    this.excelService.exportFileName = "ab";*/
  }

  createSortFn(element: columnsDef): NzTableSortFn<any> {
    return (a: any, b: any) => {
      const valueA = a[element.name];
      const valueB = b[element.name];
      // Handle special case for dateOfBirth column
      if (element.type === 'date') {
        const timestampA = new Date(valueA).getTime();
        const timestampB = new Date(valueB).getTime()
        return timestampA - timestampB;
      }
      // General sorting logic
      const result = typeof valueA === 'number' && typeof valueB === 'number'
        ? valueA - valueB
        : valueA.localeCompare(valueB);

      return result;
    };
  }

  // Custom Columns hide/Show
  createCustomColums(element: any) {
    var obj: CustomColumn = {
      name: element.header,
      value: element.name,
      default: true,
      width: 200,
      fixWidth: true
    }
    this.customColumn.push(obj);
    this.fix.push(obj);// = this.customColumn;
    
  }

  drop(event: CdkDragDrop<CustomColumn[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
    this.fix = this.fix.map(item => {
      item.default = true;
      return item;
    });
    this.notFix = this.notFix.map(item => {
      item.default = false;
      return item;
    });
    this.cdr.markForCheck();
  }

  deleteCustom(value: CustomColumn, index: number): void {
    value.default = false;
    this.notFix = [...this.notFix, value];
    this.fix.splice(index, 1);
    this.cdr.markForCheck();
  }

  addCustom(value: CustomColumn, index: number): void {
    value.default = true;
    this.fix = [...this.fix, value];
    this.notFix.splice(index, 1);
    this.cdr.markForCheck();
  }

  showModal(): void {
    this.isVisible = true;
  }

  handleOk(): void {
    this.customColumn = [...this.fix, ...this.notFix];
    this.isVisible = false;
    this.cdr.markForCheck();
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  // Filters

  resetSearch() {
    this.options = [];
    this.inputValue = '';
  }

  open(columnRow: any): void {
    this.resetSearch();
    this.visible = true;
    this.filterTitle = columnRow.header;
    this.currentColumn = columnRow.name;
    // this.createFiltersList();
    this.createCascadingFilters();
  }

  close(): void {
    this.visible = false;
  }

  createFilters() {
    // Check if a filter for the given column already exists
    const existingFilterIndex = this.filtersArr.findIndex(e => e.columnName === this.currentColumn);
    if (existingFilterIndex == 0 && this.filtersArr.length <= 1) {
      return;
    }
    if (existingFilterIndex > -1) {
      // If a filter exists, update it with a new set of filters
      const filterArr: any[] = this.generateCustomListofFilter(this.currentColumn);

      var checkIsFilter = this.filtersArr[existingFilterIndex].firstData.some((a: any) => a.selected == true);

      this.filtersArr[existingFilterIndex].data.forEach((existingFilterItem: any) => {
        const newFilterItem = filterArr.find(item => item.text === existingFilterItem.text);
        if (newFilterItem) {
          newFilterItem.selected = existingFilterItem.selected;
        }
        // else{
        //   if(existingFilterItem.selected == true){
        //    existingFilterItem.selected = false
        //     filterArr.push(existingFilterItem);
        //   }
        // }
      });
      this.filtersArr[existingFilterIndex].data = filterArr;
      if (checkIsFilter == false) {
        this.filtersArr[existingFilterIndex].firstData = filterArr;

      }
    } else {
      // If a filter doesn't exist, create a new one
      const filterArr: any[] = this.generateCustomListofFilter(this.currentColumn);
      const obj = {
        columnName: this.currentColumn,
        header: this.filterTitle,
        data: filterArr,
        firstData: filterArr
      };
      this.filtersArr.push(obj);
    }
  }

  generateCustomListofFilter(columnName: string) {
    const uniqueValues = [...new Set(this.displayData.map(item => item[columnName]))];

    // Check if filters are applied to other columns
    const filtersAppliedToOtherColumns = this.filtersArr.some(filter => filter.columnName !== columnName && filter.data.some((item: any) => item.selected));

    // Check if any filters are applied to the current column
    const currentColumnFilter = this.filtersArr.find(filter => filter.columnName === columnName);

    // Check if only one column has a filter and it's the specified column
    if (filtersAppliedToOtherColumns === false && currentColumnFilter && currentColumnFilter.columnName === columnName) {
      // Return the entire list for the current column with existing selections
      return this.dataSource.map(item => ({
        text: item[columnName],
        selected: currentColumnFilter.data.some((filterItem: any) => filterItem.text === item[columnName] && filterItem.selected)
      }));
    } else {
      // Filters applied to other columns or no filters applied
      return uniqueValues.map(value => ({
        text: value,
        selected: filtersAppliedToOtherColumns ? false : (currentColumnFilter ? currentColumnFilter.data.some((filterItem: any) => filterItem.text === value && filterItem.selected) : false)
      }));
    }
  }

  createFiltersList() {

    var obj: any = {
      columnName: this.currentColumn,
      header: this.filterTitle,
      data: [],
    };

    // Check if filters are applied to other columns
    const filtersAppliedToOtherColumns = this.filtersStore.some(filter => filter.columnName !== this.currentColumn && filter.data.some((item: any) => item.selected));

    // Check current column index in Filters Array
    const currentColumnIndex = this.filtersArr.findIndex(a => a.columnName == this.currentColumn);

    // If filterstore is greater than 0 then it is dependent otherwise the first column initiate in else condition
    if (this.filtersStore.length > 0) {
      // Check current column index in Filters Store Array
      const filterStoreCurrentColumnIndex = this.filtersStore.findIndex(a => a.columnName == this.currentColumn);
      var lastRecordOfFilterStore = this.filtersStore[this.filtersStore.length - 1];

      // If last record is match with current column then apply 2 last column
      if (lastRecordOfFilterStore.columnName == this.currentColumn) {
        lastRecordOfFilterStore = this.filtersStore[this.filtersStore.length - 2];
      }

      // If second last record is not found and the filter has not apply to other columns than show all distinct value from the datasource and also selected the previous ones.
      if (lastRecordOfFilterStore === undefined && filtersAppliedToOtherColumns == false) {
        this.filtersArr.splice(currentColumnIndex, 1);
        const uniqueValues = [...new Set(this.dataSource.map(item => item[this.currentColumn]))];
        const mappedValue = uniqueValues.map(value => ({
          text: value,
          selected: false
        }));

        mappedValue.forEach(element => {
          if (filterStoreCurrentColumnIndex > -1) {
            var record = this.filtersStore[filterStoreCurrentColumnIndex].data.filter((a: any) => a.text == element.text);
            if (record.length > 0) {
              element.selected = record[0].selected;
            }
          }
        });
        obj.data = mappedValue;

        this.filtersArr.push(obj);
        return;
      }

      // If last or second last column found from filter store than match the filters condition from the datasource and show the dependent data.
      var filteredData: any[] = [];
      lastRecordOfFilterStore.data.forEach((element: any) => {
        var data = this.dataSource.filter(a => a[lastRecordOfFilterStore.columnName] == element.text);
        if (data.length > 0)
          filteredData.push(data);
      });

      filteredData = this.combineObj(filteredData);

      const uniqueValues = [...new Set(filteredData.map(item => item[this.currentColumn]))];
      const mappedValue = uniqueValues.map(value => ({
        text: value,
        selected: false
      }));

      // If same column values found in filter store then applied selected true other wise it create newly data for filters.
      if (currentColumnIndex > -1) {
        this.filtersArr.splice(currentColumnIndex, 1);


        mappedValue.forEach(element => {
          if (filterStoreCurrentColumnIndex > -1) {
            var record = this.filtersStore[filterStoreCurrentColumnIndex].data.filter((a: any) => a.text == element.text);
            if (record.length > 0) {
              element.selected = record[0].selected;
            }
          }
        });
        obj.data = mappedValue;

        this.filtersArr.push(obj);

      }
      else {
        obj.data = mappedValue;

        this.filtersArr.push(obj);
      }
    }
    else {
      if (currentColumnIndex > -1)
        this.filtersArr.splice(currentColumnIndex, 1);
      const uniqueValues = [...new Set(this.displayData.map(item => item[this.currentColumn]))];
      const mappedValue = uniqueValues.map(value => ({
        text: value,
        selected: false
      }))
      obj.data = mappedValue;
      this.filtersArr.push(obj);
    }

  }

  createCascadingFilters() {

    var obj: any = {
      columnName: this.currentColumn, // Store the current column name
      header: this.filterTitle,       // Store the title of the filter
      data: [],                       // Data for the filter will be added later
    };

    // Check if filters are applied to any columns other than the current one
    const filtersAppliedToOtherColumns = this.filtersStore.some(filter => filter.columnName !== this.currentColumn && filter.data.some((item: any) => item.selected));

    // Find the index of the current column in the filters array
    const currentColumnIndex = this.filtersArr.findIndex(a => a.columnName == this.currentColumn);

    // If there are existing filters in filtersStore, this means there are dependencies between columns
    if (this.filtersStore.length > 0) {
      // Find the current column in the filtersStore
      const filterStoreCurrentColumnIndex = this.filtersStore.findIndex(a => a.columnName == this.currentColumn);
      var lastRecordOfFilterStore = this.filtersStore[this.filtersStore.length - 1];

      // If the last record is the current column, use the second last column for filtering
      if (lastRecordOfFilterStore.columnName == this.currentColumn) {
        lastRecordOfFilterStore = this.filtersStore[this.filtersStore.length - 2];
      }

      // If no previous filter exists and no other column has filters applied, show all unique values from the data source for the current column
      if (lastRecordOfFilterStore === undefined && filtersAppliedToOtherColumns == false) {

        console.log('lastrecord & filters not applied another', lastRecordOfFilterStore);

        this.filtersArr.splice(currentColumnIndex, 1); // Remove the current column's filter if it exists
        const uniqueValues = [...new Set(this.dataSource.map(item => item[this.currentColumn]))]; // Get unique values from the data source
        const mappedValue = uniqueValues.map(value => ({
          text: value,
          selected: false
        }));

        // If any values were previously selected, retain their selection status
        mappedValue.forEach(element => {
          if (filterStoreCurrentColumnIndex > -1) {
            var record = this.filtersStore[filterStoreCurrentColumnIndex].data.filter((a: any) => a.text == element.text);
            if (record.length > 0) {
              element.selected = record[0].selected;
            }
          }
        });

        obj.data = mappedValue; // Assign the unique, selectable values to the filter object
        this.filtersArr.push(obj); // Add the filter object to the array of filters
        return;
      }

      // If a filter is found for the last or second last column, filter the data accordingly and show dependent data
      var filteredData: any[] = [];
      if (this.currentColumn != lastRecordOfFilterStore.columnName) {
        var data2 = this.dataSource.filter(item => {
          return this.filtersStore.filter(a => a.columnName != this.currentColumn).every(filter => {
            const selectedFilters = filter.data.filter((filterItem: any) => filterItem.selected).map((filterItem: any) => filterItem.text);
            return selectedFilters.length === 0 || selectedFilters.includes(item[filter.columnName]);
          });
        });

        console.log('data2', data2);
        filteredData = data2;
      }
      else {
        lastRecordOfFilterStore.data.forEach((element: any) => {

          var data = this.dataSource.filter(a => a[lastRecordOfFilterStore.columnName] == element.text);
          if (data.length > 0)
            filteredData.push(data);
          console.log('data', data);
        });

        filteredData = this.combineObj(filteredData); // Combine the filtered data into a single array
      }


      const uniqueValues = [...new Set(filteredData.map(item => item[this.currentColumn]))]; // Get unique values based on the filtered data
      const mappedValue = uniqueValues.map(value => ({
        text: value,
        selected: false
      }));

      // If the current column already has a filter applied, update it with the new values
      if (currentColumnIndex > -1) {
        this.filtersArr.splice(currentColumnIndex, 1); // Remove the old filter

        mappedValue.forEach(element => {
          if (filterStoreCurrentColumnIndex > -1) {
            var record = this.filtersStore[filterStoreCurrentColumnIndex].data.filter((a: any) => a.text == element.text);
            if (record.length > 0) {
              element.selected = record[0].selected; // Retain previously selected values
            }
          }
        });
        obj.data = mappedValue; // Assign updated values to the filter object
        this.filtersArr.push(obj); // Add the updated filter object to the filters array

      } else {
        obj.data = mappedValue; // Assign the unique values to the filter object
        this.filtersArr.push(obj); // Add the filter object to the filters array
      }
    } else {
      // If no filters are applied yet, show all unique values for the current column
      if (currentColumnIndex > -1)
        this.filtersArr.splice(currentColumnIndex, 1); // Remove any existing filter for the current column
      const uniqueValues = [...new Set(this.displayData.map(item => item[this.currentColumn]))]; // Get unique values from the display data
      const mappedValue = uniqueValues.map(value => ({
        text: value,
        selected: false
      }));
      obj.data = mappedValue; // Assign the unique values to the filter object
      this.filtersArr.push(obj); // Add the filter object to the filters array
    }


  }

  applyFilters(): void {
    this.visible = false;
    this.loading = true;

    const storeCurrentColumnIndex = this.filtersStore.findIndex(a => a.columnName == this.currentColumn);
    const currentColumnIndex = this.filtersArr.findIndex(a => a.columnName == this.currentColumn);

    if (storeCurrentColumnIndex > -1) {
      this.filtersStore.splice(storeCurrentColumnIndex, 1);
    }

    var selectedFilter = this.filtersArr[currentColumnIndex].data.filter((a: any) => a.selected == true);
    if (selectedFilter.length > 0) {
      var obj: any = {
        columnName: this.currentColumn,
        header: this.filterTitle,
        data: selectedFilter,
      };
      this.filtersStore.push(obj);
    }


    // Apply filters to the data
    this.displayData = this.dataSource.filter(item => {
      return this.filtersStore.every(filter => {
        const selectedFilters = filter.data.filter((filterItem: any) => filterItem.selected).map((filterItem: any) => filterItem.text);
        return selectedFilters.length === 0 || selectedFilters.includes(item[filter.columnName]);
      });
    });

    this.calculateTotals();
    this.loading = false;
  }

  clearFilters(): void {
    const currentFilterArr = this.filtersArr.find(filter => filter.columnName === this.currentColumn);
    if (currentFilterArr) {
      currentFilterArr.data.forEach((filterItem: any) => filterItem.selected = false);
    }
  }

  // Filter Search
  onInput(event: Event): void {
    this.options = [];
    const value = (event.target as HTMLInputElement).value;
    const lowercaseValue = value.toLowerCase();

    // Update filtersArr for the current column
    const currentFilter = this.filtersArr.find(filter => filter.columnName === this.currentColumn);

    if (currentFilter) {
      // Filter the options array based on the input value
      this.options = currentFilter.data
        .filter((filterItem: any) => {
          // Convert filterItem.text to lowercase only if it's a string or a number
          const itemText = (typeof filterItem.text === 'string' || typeof filterItem.text === 'number') ? filterItem.text.toString().toLowerCase() : filterItem.text;

          return itemText.includes(lowercaseValue);
        })
        .map((filterItem: any) => filterItem.text);
    }
  }

  onfilterChange(event: any) {
    const value = event.nzValue;
    event.nzValue = '';
    event.nzLabel = '';
    if (value) {
      // Update filtersArr for the current column
      const currentFilter: any = this.filtersArr.find(filter => filter.columnName === this.currentColumn);
      var findIndex = currentFilter.data.findIndex((e: any) => e.text == value);
      if (findIndex > -1) {
        currentFilter.data[findIndex].selected = true;
      }
      this.resetSearch();

    }
  }

  // filter Chip
  onClose(op: any, item: any) {
    op.selected = false;
    const currentFilterArr = this.filtersArr.find(filter => filter.columnName === item.columnName);
    if (currentFilterArr) {
      const foundItem = currentFilterArr.data.find((filterItem: any) => filterItem.text === op.name);
      if (foundItem) {
        foundItem.selected = false;
      }
      const filterStoreIndex = this.filtersStore.findIndex(filter => filter.columnName === item.columnName);
      if (filterStoreIndex > -1) {
        var checkfilterStore = this.filtersStore[filterStoreIndex].data.filter((res: any) => res.selected == true);
        if (checkfilterStore.length == 0) {
          this.filtersStore.splice(filterStoreIndex, 1);
        }
      }
    }
    this.applyFilters();
  }

  onClear() {
    this.filtersArr = [];
    this.filtersStore = [];
    this.displayData = this.dataSource;
    this.calculateTotals();
  }

  combineObj(arr: any[]) {
    var combineArray: any[] = [];
    arr.forEach((element: any) => {
      element.forEach((ele: any) => {
        combineArray.push(ele);
      });
    });
    return combineArray;
  }


  /**
   * Called from template when search input changes
   * Emits to debounced subject instead of searching immediately
   */
  onSearchChange(): void {
    this._searchSubject.next(this.search);
  }

  /**
   * Performs the actual search operation
   * This is called after debounce delay to avoid filtering on every keystroke
   */
  private performSearch(searchValue: string): void {
    var value: any = null
    const filterValue = searchValue.trim().toLowerCase();

    if (!filterValue) {
      this.displayData = this.dataSource;
      this.calculateTotals();
      return;
    }
    var data = this.dataSource.filter(item => {
      for (value of Object.values(item)) {
        if (value !== null && value !== undefined) {
          const stringValue = value.toString().toLowerCase();
          if (stringValue.includes(filterValue)) {
            return true;
          }
        }
      }
      return false;
    });
    this.displayData = data;
    this.calculateTotals();
  }

  /**
   * @deprecated Use onSearchChange() instead. This method is kept for backward compatibility.
   */
  Search() {
    this.performSearch(this.search);
  }

  onViewbtn(row: any) {
    this.view.emit(row);
  }
  
  onNewBtn() {
    this.onNewClick.emit();
  }

  onGenerateExcel(){
    /*this.excelService.exportData = this.displayData;
    this.excelService.generateExcel();*/
  }

  /**
   * Calculate totals for all columns that have total enabled
   * This is called whenever displayData changes to precompute totals
   * instead of calculating them on every change detection cycle
   */
  calculateTotals(): void {
    if (!this.isTotalExists) {
      this.totals = {};
      return;
    }

    // Reset totals
    this.totals = {};

    // Calculate totals only for columns that have total enabled
    this.columns.forEach(col => {
      if (col?.total === true && (col.type === 'currency' || col.type === 'number')) {
        let total = 0;
        this.displayData.forEach(element => {
          const value = element[col.name];
          if (value !== null && value !== undefined && !isNaN(value)) {
            total += Number(value);
          }
        });
        this.totals[col.name] = total;
      }
    });
  }

  /**
   * @deprecated Use totals[columnName] instead. This method is kept for backward compatibility
   * but should not be called from templates as it causes performance issues.
   */
  getTotal(totalValue:any){
    // Return precomputed total if available, otherwise calculate on the fly
    if (this.totals.hasOwnProperty(totalValue)) {
      return this.totals[totalValue];
    }
    
    // Fallback calculation (should rarely be needed)
    var total:number = 0;
    this.displayData.forEach(element=>{
      const value = element[totalValue];
      if (value !== null && value !== undefined && !isNaN(value)) {
        total += Number(value);
      }
    });
    return total;
  }
}

export interface columnsDef {
  name: string;
  type: 'text' | 'number' | 'currency' | 'date' | 'pNumber';
  header: string;
  isSort: boolean | null;
  isFilterList: boolean;
  sortOrder: boolean | null;
  sortDirections: NzTableSortOrder[];
  sortFn: NzTableSortFn<any> | null;
  // filterFn: NzTableFilterFn<any> | null;
  // filterMultiple: boolean;
  // listOfFilter: NzTableFilterList;
}
// Custom
interface CustomColumn extends NzCustomColumn {
  name: string;
  required?: boolean;
  position?: 'left' | 'right';
}
