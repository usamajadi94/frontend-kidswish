import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

export interface ExportColumn {
    header: string;
    name: string;
    type?: string;
}

@Injectable({
    providedIn: 'root',
})
export class ExportService {
    exportToExcel(columns: ExportColumn[], data: any[], fileName: string = 'export'): void {
        const rows = (data || []).map((row) => {
            const out: Record<string, any> = {};
            for (const col of columns) {
                out[col.header] = this.formatValue(row?.[col.name], col.type);
            }
            return out;
        });

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    }

    private formatValue(value: any, type?: string): any {
        if (value === null || value === undefined || value === '') return '';
        switch (type) {
            case 'date': {
                const d = new Date(value);
                return isNaN(d.getTime()) ? value : d.toLocaleDateString('en-GB');
            }
            case 'currency':
            case 'number':
            case 'pNumber':
                return Number(value) || 0;
            default:
                return value;
        }
    }
}
