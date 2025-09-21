import { CommonModule } from '@angular/common';
import {
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    QueryList,
    ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import html2pdf from 'html2pdf.js'; // 👈 Import this
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
@Component({
    selector: 'app-report-viewer-tool',
    standalone: true,
    imports: [CommonModule, FormsModule, BftButtonComponent, NzDrawerModule],
    templateUrl: './report-viewer-tool.component.html',
    styleUrl: './report-viewer-tool.component.scss',
})
export class ReportViewerToolComponent {
    @Input() pageSize: 'A4' | 'A3' = 'A4';

    @ViewChild('paginatedView', { static: true })
    paginatedView: ElementRef<HTMLDivElement>;
    @ViewChild('contentWrapper', { static: true })
    contentWrapper: ElementRef<HTMLDivElement>;
    @ViewChild('filterWrapper', { static: true })
    filterWrapper: ElementRef<HTMLDivElement>;
    @ContentChildren('pageContent', { read: ElementRef })
    elements: QueryList<ElementRef>;

    pages: HTMLDivElement[] = [];
    currentPageIndex = 0;
    @Output() pageIndexChanged = new EventEmitter<number>();
    totalPages = 0;

    ngAfterViewInit(): void {
        setTimeout(() => {
            
            this.setupPagination();
            this.elements.changes.subscribe(() => this.setupPagination());
        });
    }

    setupPagination(): void {
        this.paginatedView.nativeElement.innerHTML = '';
        this.pages = [];

        let page = this.createPage();
        this.paginatedView.nativeElement.appendChild(page);
        this.pages.push(page);

        // this.elements.forEach((elRef) => {
        //     const el = elRef.nativeElement.cloneNode(true) as HTMLElement;

        //     page.appendChild(el);

        //     if (page.scrollHeight > page.clientHeight) {
        //         page.removeChild(el); // overflow detected
        //         page = this.createPage();
        //         this.paginatedView.nativeElement.appendChild(page);
        //         this.pages.push(page);
        //         page.appendChild(el); // add to new page
        //     }
        // });
        this.elements.forEach((elRef,index) => {
            const el = elRef.nativeElement.cloneNode(true) as HTMLElement;
        
            // 👇 If this element is the start of a new invoice
            const isNewInvoice = el.classList.contains('invoice-block');
            if (isNewInvoice && index > 0) {
                page = this.createPage();
                this.paginatedView.nativeElement.appendChild(page);
                this.pages.push(page);
            }
        
            page.appendChild(el);
        
            if (page.scrollHeight > page.clientHeight) {
                page.removeChild(el); // overflow
                page = this.createPage();
                this.paginatedView.nativeElement.appendChild(page);
                this.pages.push(page);
                page.appendChild(el);
            }
        });

        this.totalPages = this.pages.length;
        this.currentPageIndex = 0;
        this.pageIndexChanged.emit(this.currentPageIndex);
        this.updateVisiblePage();
    }

    createPage(): HTMLDivElement {
        const page = document.createElement('div');
        page.classList.add('page', this.pageSize, this.pageSize + '-web');
        return page;
    }

    updateVisiblePage(): void {
        this.pages.forEach((page, i) => {
            page.style.display = i === this.currentPageIndex ? 'block' : 'none';
        });
    }

    nextPage(): void {
        if (this.currentPageIndex + 1 < this.totalPages) {
            this.currentPageIndex++;
            this.pageIndexChanged.emit(this.currentPageIndex);
            this.updateVisiblePage();
        }
    }

    previousPage(): void {
        if (this.currentPageIndex > 0) {
            this.currentPageIndex--;
            this.pageIndexChanged.emit(this.currentPageIndex);
            this.updateVisiblePage();
        }
    }

    export(format: string) {
        if (format === 'pdf') {
            this.exportAsPDF();
        } else if (format === 'excel') {
            // handle excel export here
            console.log('Export as Excel');
        }
    }

    exportAsPDF() {
        //this.setupPagination(); // fresh pagination
        this.currentPageIndex = 0; // reset to first page
        this.updateVisiblePage(); // show first page
        // Show all pages temporarily
        this.pages.forEach((page) => {
            page.style.display = 'block';
            page.classList.remove(this.pageSize + '-web');
        });

        const opt = {
            margin: [10, 0, 10, 0],
            filename: 'report.pdf',
            image: { type: 'jpeg' },  // Optimized
            html2canvas: {
                scale: 1.2,  // Lower scale for smaller file
                useCORS: true,
                scrollX: 0,
                scrollY: 0,
                windowWidth: this.paginatedView.nativeElement.scrollWidth,
                windowHeight: this.paginatedView.nativeElement.scrollHeight
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf()
            .from(this.paginatedView.nativeElement)
            .set(opt)
            .save()
            .then(() => {
                this.pages.forEach((page) => page.classList.add(this.pageSize + '-web'));
                this.updateVisiblePage();
            });
    }

    @Output() doprint = new EventEmitter();
    onPrint(){
        this.doprint.emit();
    }

   
    @Output() filter = new EventEmitter();
    openFilterDrawer() {
        this.filter.emit(true);
    }

    @Output() exportPdf = new EventEmitter();
    onExportPdf(){
        this.exportPdf.emit();
    }
}
