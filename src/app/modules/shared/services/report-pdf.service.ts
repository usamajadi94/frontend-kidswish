import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from '../../../../../public/fonts/outputfonts/file';
// pdfMake.vfs = pdfFonts.pdfMake.vfs;
pdfMake.vfs = pdfFonts.pdfMake.vfs;
// (<any>pdfMake).vfs = pdfFonts.vfs;
pdfMake.fonts = ({
  Poppins: {
    normal: 'Poppins-Regular.ttf',
    bold: 'Poppins-Bold.ttf',
    italics: 'Poppins-Italic.ttf',
    bolditalics: 'Poppins-BoldItalic.ttf'
  }});

@Injectable({
  providedIn: 'root'
})
export class ReportPdfService {

  constructor() { }


  generatePdf(content:any,fileName:string) {
    pdfMake.createPdf(content).download(fileName);
  
  }

  print(content:any,fileName:string) {
    pdfMake.createPdf(content).print();
  
  }
  
  convertImageUrlToBase64(url: string): Promise<string> {
        return fetch(url)
            .then(response => response.blob())
            .then(blob => new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64data = reader.result as string;
                    resolve(base64data);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            }));
    }
    
}
