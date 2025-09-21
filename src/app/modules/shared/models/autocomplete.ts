import {  Observable, Subject } from "rxjs";
import { startWith, map } from 'rxjs/operators';

export class AutoComplete{
    public search = new Subject();
    public results!: Observable<any[]>;
    public data!:any[];

    constructor(public displayFieldName:string,public valueFieldName:any){
        this.search = new Subject();
        this.results = new Observable<any[]>();
    }

    public resultsGet(){
        // console.log("Work");
        this.results = this.search.pipe(
            startWith(''),
            map(value => value ? this._onFilter(value): this.data.slice())
        )
    }

    displayFn = (ID:any) => {
        return ID ? this.data.filter(a=> a[this.valueFieldName] === ID)[0][this.displayFieldName] : undefined;
    }

    private _onFilter(value:any){
        const filterValue = value.toLowerCase();

        return this.data.filter(option => option[this.displayFieldName].toLowerCase().includes(filterValue));
    }
}