import { Form } from '@ui-workspace/modules';
import { Component, Input } from '@angular/core';
import * as moment from 'moment';
import * as Handlebars from 'handlebars/dist/handlebars.min.js';
import printTemplate from './print';
import * as Constants from '@ui-workspace/shared';
import { I18nService, SegmentDynamicLoaderService, StateMachineService } from '../../shared';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { CoreStateMachineService, ListenerService } from '@ui-workspace/services';
import customPrintTemplate from './custom_print';
import customPrintRtlTemplate from './custom_print_rtl';
import { Messages } from '../../../../../../libs/shared/src/lib/modules/form';

class HTMLTemplateToPdf {

  async saveAsPdf(htmlTemplate: string, form: Form) {
    const result = await this.generatePdf(htmlTemplate);
    const pdfFileName = form.header.formId ? `${form.header.formId}.pdf` : 'GCEO Approval Request.pdf';
    result.save(pdfFileName);
  }

  async getPdfAsBase64(htmlTemplate: string): Promise<string> {
    const result = await this.generatePdf(htmlTemplate);
    return result.output('datauristring');;
  }

  private renderHTMLInIframe(htmlTemplate: string): { elem: HTMLElement; destroy: () => void } {
    // Create an iframe for rendering
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '210mm'; // A4 width
    iframe.style.height = '297mm'; // A4 height
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    // Write the HTML content to the iframe
    iframe.contentDocument.open();
    iframe.contentDocument.write(htmlTemplate);
    iframe.contentDocument.close();
    return {
      elem: iframe.contentDocument.body,
      destroy: () => document.body.removeChild(iframe)
    }
  }


  public generatePdf(htmlTemplate: string): Promise<jsPDF> {
    return new Promise((resolve, reject) => {
      const iframe = this.renderHTMLInIframe(htmlTemplate);

      html2canvas(iframe.elem, { scale: 1.5, useCORS: true }).then((canvas) => {
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
          compress: true,
          putOnlyUsedFonts: true,
        });

        const imgWidth = 210;
        const pageHeight = 297;
        const headerHeight = 8; // 🟢 reduced from 15mm to 8mm
        const footerHeight = 10;

        const scale = imgWidth / canvas.width;

        let slices: HTMLCanvasElement[] = [];
        let sliceStart = 0;
        const usablePageHeight = pageHeight - footerHeight - headerHeight;
        const pageCanvasHeightPx = usablePageHeight / scale;

        while (sliceStart < canvas.height) {
          const remainingHeight = canvas.height - sliceStart;
          let sliceHeight = Math.min(pageCanvasHeightPx, remainingHeight);
          if (sliceHeight < 2) break;

          const pageCanvas = document.createElement("canvas");
          pageCanvas.width = canvas.width;
          pageCanvas.height = sliceHeight;
          const ctx = pageCanvas.getContext("2d");
          ctx.drawImage(
            canvas,
            0,
            sliceStart,
            canvas.width,
            sliceHeight,
            0,
            0,
            canvas.width,
            sliceHeight
          );

          slices.push(pageCanvas);
          sliceStart += sliceHeight;
        }

        // Merge last slice if ng  small
        if (slices.length > 1) {
          const lastSlice = slices[slices.length - 1];
          const threshold = pageCanvasHeightPx * 0.3;
          if (lastSlice.height < threshold) {
            const secondLastSlice = slices[slices.length - 2];
            const mergedCanvas = document.createElement("canvas");
            mergedCanvas.width = canvas.width;
            mergedCanvas.height = secondLastSlice.height + lastSlice.height;
            const ctx = mergedCanvas.getContext("2d");
            ctx.drawImage(secondLastSlice, 0, 0);
            ctx.drawImage(lastSlice, 0, secondLastSlice.height);
            slices.splice(slices.length - 2, 2, mergedCanvas);
          }
        }

        slices.forEach((pageCanvas, index) => {
          if (index > 0) pdf.addPage();

          const hasHeader = index > 0; // skip header on first page
          let yStart = 0;

          if (hasHeader) {
            pdf.setFillColor(255, 255, 255);
            pdf.rect(0, 0, imgWidth, headerHeight, "F");

            pdf.setFontSize(10); // slightly smaller text for smaller header
            pdf.setTextColor(0, 0, 0);
            pdf.text("", imgWidth / 2, headerHeight / 2 + 2, { align: "center" });

            yStart = headerHeight; // shift content down
          }

          const pageImage = pageCanvas.toDataURL("image/jpeg", 0.6);
          const sliceHeightMm = pageCanvas.height * scale;

          pdf.addImage(pageImage, "JPEG", 0, yStart, imgWidth, sliceHeightMm);

          pdf.setFontSize(10);
          pdf.text(
            `Page ${index + 1} of ${slices.length}`,
            imgWidth / 2,
            pageHeight - 5,
            { align: "center" }
          );
        });

        resolve(pdf);
        iframe.destroy();
      }).catch((err) => reject(err));
    });
  }










}

@Component({
  selector: 'app-print-section',
  templateUrl: './print-section.component.html',
  styleUrls: ['./print-section.component.scss']
})
export class PrintSectionComponent {

  @Input() form: Form;

  constructor(
    public i18n: I18nService,
    public segmentDynamicLoader: SegmentDynamicLoaderService,
    public coreStateMachineService: CoreStateMachineService,
    public StateMachineService: StateMachineService,
    public _listenerService: ListenerService,

  ) { }

  preparePrintObject() {
    // if (this.form.sections.length > 1) {
    //   this.form.sections[this.form.sections.length - 2].body.details.subRequestsDeatails = this.form.sections[this.form.sections.length - 1].body.details.subRequestsDeatails
    // }
    return {
      form: this.form,
      i18n: this.i18n,
      segmentDynamicLoader: this.segmentDynamicLoader,
      requestDetails: this.form.sections[0].body,
      lovs: this.form.lovs,
      formId: this.form.header.formId,
      dataModel: this.dataModel

    };
  }


  previewPdf(response: any) {
    const base64 = response.fileNetDownloadOutput.fileContents;
    const fileName = response.fileNetDownloadOutput.fileName;
    const mimeType = response.fileNetDownloadOutput.mimeType;

    //  const pdfBlob = base64.output("blob");
    const blob = this.b64toBlob(base64, mimeType);
    window.open(URL.createObjectURL(blob), "_blank");


    // new HTMLTemplateToPdf( ).generatePdf(this.getPrintTemplate()).then((pdf) => {
    //   console.log("pdf PREVIEW",pdf);

    // const pdfBlob = pdf.output("blob");
    // const blobUrl = URL.createObjectURL(pdfBlob);

    //   // Open in new tab
    //   window.open(blobUrl, "_blank");

    //   // OR embed it inside a modal using <iframe> if you have a modal component
    //   // this.showPdfModal(blobUrl);
    // });
  }


  b64toBlob(b64Data: string, contentType = ''): Blob {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      byteArrays.push(new Uint8Array(byteNumbers));
    }

    return new Blob(byteArrays, { type: contentType });
  }

  //   pdfPreviewUrl: string;

  // previewPdfInModal(htmlTemplate: string) {
  //   new HTMLTemplateToPdf().generatePdf(this.getPrintTemplate()).then((pdf) => {    const pdfBlob = pdf.output("blob");
  //     this.pdfPreviewUrl = URL.createObjectURL(pdfBlob);
  //     this.modalService.open(this.pdfModal); // open your modal here
  //   });
  // }
  registerHandlebarsHelpers() {
    const helpers = {
      i18nTranslate: this.translateHelper.bind(this),
      dateFormat: this.dateFormatHelper,
      dateFormatHelper3: this.dateFormatHelper3,
      dateFormat2: this.dateFormatHelper2,
      getPartialName: this.sectionIdHelper,
      getSectionTitle: this.sectionTitleHelper,
      consolelog: this.consolelog,
      eq: this.eq,
      getFormId: this.getFormId.bind(this),
      getDirection: this.getDirection.bind(this),
      and: this.and,
      or: this.or,
      not: this.not,
      dataModel: this.dataModel,
      notExist: this.notExist,
      getEncodeData: this.getEncodeData.bind(this),
      statusClass: this.statusClass
    };
    for (let helper in helpers) {
      Handlebars.registerHelper(helper, helpers[helper]);
    }
  }

  registerHandlebarsPartials() {
    const partials = {
      sectionrequestDetails: printTemplate.sectionrequestDetails,
      sectionmanagerialApprovalsForm: printTemplate.sectionmanagerialApprovalsForm,
      sectiongceoOfficeForm: printTemplate.sectiongceoOfficeForm
    };
    for (let partial in partials) {
      Handlebars.registerPartial(partial, partials[partial]);
    }
  }

  print() {
    let compiledTemplate = null;
    let popupWin: any;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=auto,width=auto');
    let printObject = this.preparePrintObject();
    this.registerHandlebarsHelpers();
    this.registerHandlebarsPartials();
    Handlebars.registerPartial('header', `
    <header class="print-header">

 <table class="header header1 content" style="border-collapse: collapse; width: 100%">
        <tbody>
          <tr>
            <td
              style="
                width: 180px;
                color: #fff;
                padding: 0;
                font-size: 10px;
                font-weight: 400;
              "
            >
            {{#if form.header.formId}}
               {{form.header.formId}} | {{dateFormat form.header.creationDate}}
              {{/if}}
              <br />
<!--                          <span class="generalStatus {{statusClass form.header.status.key}}">{{form.header.status.value}}</span>-->
            </td>
            <td style="padding: 12px 0">
              <div style="display: inline-block">
                <h1 class="st">{{i18nTranslate 'formTitle'}}</h1>
              </div>
              <div style="display: inline-block" class="shape"></div>
            </td>
            <td style="width: 70px">
              <img
                width="36"
                alt=""
                src="data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDE5NzYgOTg5IiB3aWR0aD0iMTk3NiIgaGVpZ2h0PSI5ODkiPjxzdHlsZT4uYXtmaWxsOiNmZmZ9PC9zdHlsZT48cGF0aCBjbGFzcz0iYSIgZD0ibTk4OC45IDk4OC41YzgxIDAgMTM4LjctMjQuNiAxNjMuNy00Ni4ydi0xNjYuMmMtMTguNyAxMy44LTU2LjIgMzAuOC0xMDQuNSAzMC44LTM0LjMgMC01OS4yLTcuNy03Ny45LTI0LjYtMTUuNi0xNS40LTIzLjQtNDEuNi0yMy40LTc3di03MDQuOGgtMjA1Ljh2MjA3LjdoNDExLjZ2MTk3aC00MTEuNnYzNDkuM2MwIDcwLjkgMjEuOCAxMjcuNyA2MC44IDE2Ny43IDQzLjYgNDMuMSAxMDcuNiA2Ni4yIDE4Ny4xIDY2LjIgMCAwIDAgMC4xIDAgMC4xem02MzguNSAwYzExMi4xIDAgMTk4LjUtNDIuNiAyNTcuNi0xMDIuNSAxMC45LTExIDIxLTIyLjcgMzAuNC0zNSA5LjQtMTIuMyAxNy45LTI1LjIgMjUuNi0zOC42IDcuNy0xMy41IDE0LjQtMjcuNCAyMC4zLTQxLjcgNS44LTE0LjMgMTAuNy0yOSAxNC42LTQ0bC0xNzcuMy02MS41cS0zIDExLjYtNy41IDIyLjctNC42IDExLjEtMTAuNSAyMS40LTYgMTAuNC0xMy4zIDE5LjktNy4zIDkuNS0xNS43IDE4Yy0yOC44IDI4LjQtNjguMSA0OC45LTEyNC4yIDQ4LjktNTEuNiAwLTEwMC0yMC41LTEzNC45LTU2LjgtMzQuOC0zNy44LTU2LTkzLTU2LTE2Mi40IDAtNzEgMjEuMi0xMjQuNiA1Ni0xNjIuNSAzNC45LTM2LjMgODEuOS01NS4yIDEzMy40LTU1LjIgNTQuNiAwIDkyLjQgMTguOSAxMTkuNyA0Ny40IDIyLjcgMjMuNiAzNi40IDUzLjUgNDUuNCA4My41bDE4MC40LTYzLjFjLTMuNy0xNC41LTguMy0yOC44LTEzLjctNDIuNy01LjUtMTQtMTEuOC0yNy42LTE4LjktNDAuNy03LjItMTMuMi0xNS4yLTI1LjktMjMuOS0zOC04LjctMTIuMi0xOC4yLTIzLjgtMjguNC0zNC44LTYwLjYtNjEuNC0xNDguNi0xMDUuNi0yNjUuMi0xMDUuNi0xMDcuNiAwLTIwNC42IDQyLjUtMjc0LjMgMTE1LjEtNjkuNyA3NC0xMTIuMSAxNzYuNi0xMTIuMSAyOTYuNSAwIDExOS45IDQ0IDIyMi4zIDExNS4yIDI5Ni41IDY5LjcgNzIuNSAxNjguMiAxMTUuMSAyNzcuMyAxMTUuMSAwIDAgMCAwLjEgMCAwLjF6bS0xMzExLjIgMGMxMDAuNCAwIDE4Mi45LTMzLjEgMjM2LjgtODguMyA0MC41LTQyLjYgNjQuNS05OS40IDY0LjUtMTY1LjcgMC02MC0yMS0xMTMuNS02MC0xNTQuNS0zOC45LTQxLTk0LjQtNzEtMTY0LjgtODUuMWwtMTE1LjQtMjMuNmMtNDgtOS41LTc0LjktMzQuNy03NC45LTY5LjQgMC00NS44IDQxLjktNzcuMyAxMDkuNC03Ny4zIDQyIDAgNzcuOSAxNC4xIDEwMS45IDM5LjQgMTUgMTcuMyAyNS40IDM5LjQgMjguNSA2NC42bDE2Ni40LTM5LjRjLTQuNS01MC41LTI3LTk0LjYtNjEuNS0xMzAuOS01My45LTU2LjgtMTM3LjgtOTMtMjM2LjctOTMtOTEuNCAwLTE2Ny45IDMxLjUtMjIwLjMgODEuOS0xMS4zIDExLjEtMjEuNCAyMy4zLTMwLjMgMzYuNC04LjggMTMuMS0xNi4zIDI3LTIyLjMgNDEuNi02LjEgMTQuNi0xMC42IDI5LjgtMTMuNiA0NS4zLTMgMTUuNS00LjUgMzEuMy00LjMgNDcuMSAwIDU4LjQgMTggMTA3LjIgNTMuOSAxNDUgMzYgMzcuOCA4OC40IDY2LjMgMTU3LjMgODMuNmwxMTMuOSAyOC40YzU3IDE0LjIgODIuNCAzNi4zIDgyLjQgNzUuNyAwIDQ4LjktNDIgNzcuMy0xMTAuOSA3Ny4zLTQ5LjQgMC04OS45LTE3LjMtMTE1LjQtNDUuOC00LjUtNC45LTguNi0xMC4yLTEyLjMtMTUuOC0zLjYtNS42LTYuNy0xMS41LTkuMi0xNy43LTIuNi02LjItNC42LTEyLjYtNi0xOS4xLTEuNC02LjYtMi4zLTEzLjItMi41LTE5LjlsLTE3MC44IDM5LjVjNC41IDUzLjUgMjguNSAxMDAuOSA2NC41IDEzOC44IDU3IDYzLjEgMTQ4LjMgMTAwLjkgMjUxLjcgMTAwLjl6Ii8+PC9zdmc+"
              />
            </td>
          </tr>
        </tbody>
      </table>
  </header>

`);

    //     Handlebars.registerPartial('footer', `
    //   <footer style="text-align: center; border-top: 1px solid #000;">
    //     <p>{{this.form.header.formId}}</p>
    //   </footer>
    // `);
    let template = this.i18n.getLanguage() === 'ar' ? customPrintRtlTemplate.printTemplate : customPrintTemplate.printTemplate;
    compiledTemplate = Handlebars.compile(template);
    // compiledTemplate = Handlebars.compile(printTemplate.printTemplate);
    const htmlContent = `
  <html>
  <head>
    <title>Print</title>
    <style>

    </style>
  </head>
  <body onload="window.print()">
    <div class="container">
      ${compiledTemplate(printObject)}
    </div>
  </body>

  </html>
`;

    popupWin.document.open();
    popupWin.document.write(htmlContent);
    popupWin.document.close();
  }




  downloadPdfMultiPage() {
    const printObject = this.preparePrintObject();
    this.registerHandlebarsHelpers();
    this.registerHandlebarsPartials();

    // Register header partial
    Handlebars.registerPartial('header', `
          <header class="print-header">
              <table style="width:100%; border-collapse: collapse;">
                  <tr>
                      <td>
                          {{#if form.header.formId}}
                              {{form.header.formId}} | {{dateFormat form.header.creationDate}}
                          {{/if}}
                      </td>
                      <td><h1>{{i18nTranslate 'formTitle'}}</h1></td>
                      <td><img width="36" src="data:image/svg+xml;base64,..."/></td>
                  </tr>
              </table>
          </header>
      `);

    const template = this.i18n.getLanguage() === 'ar'
      ? customPrintRtlTemplate.printTemplate
      : customPrintTemplate.printTemplate;

    const compiledTemplate = Handlebars.compile(template);
    const htmlContent = compiledTemplate(printObject);

    // Render HTML in hidden div
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    html2canvas(container, { scale: 2, useCORS: true }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Calculate image dimensions
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pageWidth;
      const imgHeight = (imgProps.height * pageWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add remaining pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('template.pdf');
      document.body.removeChild(container);
    });
  }


  downloadingPrintFile: boolean = false;

  async downloadPrint() {
    this.downloadingPrintFile = true;
    await new HTMLTemplateToPdf().saveAsPdf(this.getPrintTemplate(), this.form);
    this.downloadingPrintFile = false;



  }


  replacements = [
    // NEW: remove any attribute that contains https
    { pattern: /\s+[a-zA-Z-]+="[^"]*https[^"]*"/gi, replacement: "" },
    { pattern: /\s+[a-zA-Z-]+='[^']*https[^']*'/gi, replacement: "" },
    // NEW: remove any  nbsp
    { pattern: /&nbsp;/g, replacement: "" },
    { pattern: /nbsp;/g, replacement: "" },
    { pattern: /;nbsp/g, replacement: "" },
  ];


  previewingFile: boolean = false;

  downloadPrintBE(type: string) {
    console.log("form", this.form, this.form.sections?.[0]?.body?.details);
    console.log('loggedInUserId', this.coreStateMachineService.loggedInUserId());
    let section = this.form.sections?.[this.form.sections.length - 1]?.body?.details
    console.log('dataModel', this.StateMachineService.dataModel);
    let cleanedContent = this.StateMachineService.dataModel;

    if (cleanedContent) {

      this.replacements.forEach(({ pattern, replacement }) => {
        cleanedContent = cleanedContent.replace(pattern, replacement);
      });
    }

    console.log('dataModel 2', cleanedContent);
    if (type == 'save') {
      this.downloadingPrintFile = true;
    }
    else {
      this.previewingFile = true;
    }
    console.log('formId', this.form.header.formId);
    if (!this.form.header.formId) {
      let data = {
        email: this.coreStateMachineService.loggedInUserId(),
        language: this.i18n.getLanguage(),
        requestTitle: section.requestTitle ?? null,
        requestDetails: cleanedContent ?? null,
        typeOfRequest: section.typeOfRequest ?? [],
        otherRequestType: section.otherRequestType ?? null,
        requestStatus: section.requestStatus ?? [],
      };
      this.StateMachineService.dispatch('printRequestDetails', data).then(
        (Response: any) => {
          if (Response) {
            if (Response instanceof Messages) {
              this.downloadingPrintFile = false;
              this.previewingFile = false;
            } else {
              this.downloadingPrintFile = false;
              if (type == 'save') {
                this.saveFile(Response);
                this.downloadingPrintFile = false;
              }
              else {
                this.previewingFile = false;
                this.previewPdf(Response)
              }

            }
          }
        }
      );
    }

    else {
      console.log("section", section);
      let role = this.form.sections?.[this.form.sections.length - 1].id
      role = role.split("Approval")[0].toUpperCase();

      console.log(role);
      let data = {
        email: this.coreStateMachineService.loggedInUserId(),
        language: this.i18n.getLanguage(),
        comments: section.comment ?? null,
        role: role,
        formId: this.form.header.formId

      };
      this.StateMachineService.dispatch('printFormDetails', data).then(
        (Response: any) => {
          if (Response) {
            if (Response instanceof Messages) {
              this.downloadingPrintFile = false;
              this.previewingFile = false;
            } else {
              this.downloadingPrintFile = false;
              if (type == 'save') {
                this.saveFile(Response);
                this.downloadingPrintFile = false;
              }
              else {
                this.previewingFile = false;
                this.previewPdf(Response)
              }

            }
          }
        }
      );
    }



  }
  saveFile(response: any) {

    const base64 = response.fileNetDownloadOutput.fileContents;
    const fileName = response.fileNetDownloadOutput.fileName;
    const mimeType = response.fileNetDownloadOutput.mimeType;

    // Decode base64
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    // Create blob
    const blob = new Blob([byteArray], { type: mimeType });

    // Create download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();

    // Optional cleanup
    URL.revokeObjectURL(link.href);
  }

  async getBase64(): Promise<string> {
    return await new HTMLTemplateToPdf().getPdfAsBase64(this.getPrintTemplate());
  }

  private processEmailHtml(htmlBody: string, docDir: 'ltr' | 'rtl'): string {
    // Create a temporary DOM element to parse and modify HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlBody, 'text/html');
    
    // Process all tables - preserve styling; only pasted tables need explicit LTR so column order is not reversed in RTL emails
    const tables = doc.querySelectorAll('table');
    tables.forEach((table: HTMLTableElement) => {
      const isPasted = table.getAttribute('data-pasted') === 'true';
      if (isPasted) {
        // Pasted table: wrap in LTR and isolate so column order is not reversed when email body is RTL (Outlook etc.)
        const wrapper = doc.createElement('div');
        wrapper.setAttribute('dir', 'ltr');
        wrapper.style.direction = 'ltr';
        wrapper.style.unicodeBidi = 'isolate';
        table.parentNode?.insertBefore(wrapper, table);
        wrapper.appendChild(table);
        table.setAttribute('dir', 'ltr');
        table.style.direction = 'ltr';
      }
      // Editor-inserted tables: leave direction as-is so they match the editor in the email
      // Only add table-level styles if not already present
      if (!table.style.borderCollapse) {
        table.style.borderCollapse = 'collapse';
      }
      if (!table.style.width) {
        table.style.width = '100%';
      }
      if (!table.style.tableLayout) {
        table.style.tableLayout = 'fixed';
      }
      if (!table.style.wordWrap) {
        table.style.wordWrap = 'break-word';
      }
      if (!table.style.boxSizing) {
        table.style.boxSizing = 'border-box';
      }
      // Do not add table-level border - it stacks with first column in email clients and creates thick left edge.
      // Cell borders alone form the table outline with border-collapse.
      // Process all cells - match editor format: uniform 1px solid #bbb on every cell
      const allCells = table.querySelectorAll('td, th');
      const editorBorder = '1px solid #bbb';
      allCells.forEach((cell: Element) => {
        const el = cell as HTMLElement;
        // Always override borders to match editor (avoids inconsistent thickness from pasted/editor content)
        el.style.border = editorBorder;
        el.style.borderTop = editorBorder;
        el.style.borderRight = editorBorder;
        el.style.borderBottom = editorBorder;
        el.style.borderLeft = editorBorder;
        if (!el.style.padding && !el.getAttribute('style')?.includes('padding')) {
          el.style.padding = '8px';
        }
        if (!el.style.wordBreak && !el.getAttribute('style')?.includes('word-break')) {
          el.style.wordBreak = 'break-word';
        }
      });
    });
    
    // Process all images - center small images
    const images = doc.querySelectorAll('img');
    images.forEach((img: HTMLImageElement) => {
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.boxSizing = 'border-box';
      
      // Check if image is small (less than 200px width) and center it
      const width = img.getAttribute('width') || img.style.width;
      const widthValue = width ? parseInt(width.toString().replace('px', '').replace('%', '')) : null;
      
      // Check actual image dimensions if available
      const naturalWidth = (img as any).naturalWidth;
      const isSmall = (!widthValue || widthValue < 200) && (!naturalWidth || naturalWidth < 200);
      
      if (isSmall) {
        // Wrap in centered div
        const wrapper = doc.createElement('div');
        wrapper.style.textAlign = 'center';
        wrapper.style.margin = '10px 0';
        wrapper.style.display = 'block';
        img.parentNode?.insertBefore(wrapper, img);
        wrapper.appendChild(img);
        img.style.display = 'inline-block';
      } else {
        img.style.display = 'block';
      }
    });
    
    // Add font family to body
    const body = doc.body;
    if (body) {
      body.style.fontFamily = '"STC_Forward", Arial, sans-serif';
      body.style.wordBreak = 'break-word';
      body.style.padding = '0';
      body.style.margin = '0';
    }
    
    return doc.body.innerHTML;
  }

  async generateEmail(): Promise<void> {
    this.downloadingFiles = true;
    const subject = this.form.sections?.[0]?.body?.details?.requestTitle; // Email subject
    let htmlBody = this.StateMachineService.dataModel ? this.StateMachineService.dataModel : decodeURIComponent(this.form.sections?.[0]?.body?.details?.requestDetails); // Email body
    
    const lang = this.i18n.getLanguage();
    const dir = (lang === 'ar' ? 'rtl' : 'ltr') as 'ltr' | 'rtl';
    // Process HTML to add inline styles for email compatibility (use doc dir so tables are not reversed)
    htmlBody = this.processEmailHtml(htmlBody, dir);
    
    const originalAttachments = await this.downloadAllAttachments() ?? [];
    const boundary: string = '----=_NextPartBoundary';
    
    // CSS styles as fallback (some email clients support style tags)
    const emailStyles = `
    <style>
      body, div {
        font-family: "STC_Forward", Arial, sans-serif;
        word-break: break-word;
        padding: 0;
        margin: 0;
      }
      img {
        max-width: 100%;
        height: auto;
        display: block;
        box-sizing: border-box;
      }
      table {
        border-collapse: collapse;
        width: 100%;
        table-layout: fixed;
        word-wrap: break-word;
        box-sizing: border-box;
      }
      table td, table th {
        border: 1px solid #bbb !important;
        border-width: 1px !important;
        word-break: break-word;
        padding: 8px;
      }
      iframe, div, section, article {
        max-width: 100%;
        box-sizing: border-box;
        word-wrap: break-word;
      }
      * {
        font-family: "STC_Forward", Arial, sans-serif;
      }
    </style>
    `;
    
    let emailContent: string = `
    X-Unsent: 1
Subject: ${subject}
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="${boundary}"

--${boundary}
Content-Type: text/html; charset="utf-8"

<!DOCTYPE html>
<html dir="${dir}">
<head>
<meta charset="utf-8">
${emailStyles}
</head>
<body dir="${dir}">
${htmlBody}
</body>
</html>
`.trim();
    ///////////////////////////


    console.log("form", this.form, this.form.sections?.[this.form.sections.length - 1]?.body?.details);
    console.log('loggedInUserId', this.coreStateMachineService.loggedInUserId());



    console.log('dataModel', this.StateMachineService.dataModel);
    let cleanedContent = this.StateMachineService.dataModel;

if(cleanedContent){
    this.replacements.forEach(({ pattern, replacement }) => {
      cleanedContent = cleanedContent.replace(pattern, replacement);
    });
  }

    console.log('dataModel 2', cleanedContent);
    let section = this.form.sections?.[this.form.sections.length - 1]?.body?.details
    let data1 = {
      email: this.coreStateMachineService.loggedInUserId(),
      language: this.i18n.getLanguage(),
      requestTitle: section.requestTitle ?? null,
      requestDetails: cleanedContent ?? null,
      typeOfRequest: section.typeOfRequest ?? [],
      otherRequestType: section.otherRequestType ?? null,
      requestStatus: section.requestStatus ?? [],
    };
    let role = this.form.sections?.[this.form.sections.length - 1].id
    role = role.split("Approval")[0].toUpperCase();

    let data2 = {
      email: this.coreStateMachineService.loggedInUserId(),
      language: this.i18n.getLanguage(),
      comments: section.comment ?? null,
      role: role,
      formId: this.form.header.formId
    };
    this.downloadingFiles = true;

    this.StateMachineService.dispatch(!this.form.header.formId ? 'printRequestDetails' : 'printFormDetails', !this.form.header.formId ? data1 : data2).then(
      (Response: any) => {
        if (Response) {
          if (Response instanceof Messages) {
            this.downloadingFiles = false;
          } else {
            this.downloadingFiles = false;

            //let base64PDF = await this.getBase64();
            let printAttachment = {
              fileName: Response?.fileNetDownloadOutput?.fileName,
              mimeType: 'application/pdf',
              fileContents: Response?.fileNetDownloadOutput?.fileContents
              // fileContents: base64PDF.split('base64,')[1] || base64PDF

            };

            // Create a new array with all attachments, without altering the original one
            const allAttachments = [...originalAttachments, printAttachment];
            // const allAttachments = [...originalAttachments];

            allAttachments.forEach((attachment) => {
              console.log('attachment',attachment);
              
              emailContent += `

--${boundary}
Content-Type: ${attachment.mimeType}; name="${attachment.fileName}"
Content-Disposition: attachment; filename="${attachment.fileName}"
Content-Transfer-Encoding: base64

${attachment.fileContents}
`;
            });

            emailContent += `--${boundary}--`.trim();

            const blob: Blob = new Blob([emailContent], { type: 'message/rfc822' });
            const link: HTMLAnchorElement = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'email.eml';
            link.click();
            this.downloadingFiles = false;
          }
        }
      }
    );



    //////////////////////////////

  }

  downloadingFiles: boolean = false;

  async downloadAllAttachments() {
    // if (!this.downloadingFiles) {

    this.downloadingFiles = true;
    try {
      const section = this.form?.sections?.[0]?.body?.details;
      if (section && 'attachments' in section) {
        for (const file of section.attachments) {
          if (!file.fileContents) {
            await this.downloadFile(file);
          }
        }
        console.log('section.attachments', section.attachments);
        return section.attachments;
      }
      // return [];
    } catch (error) {
      console.error(error);
      return [];
    } finally {
      console.log('section.attachments', this.form?.sections?.[0]?.body?.details?.attachments);

      // this.downloadingFiles = false;
    }
    // }
  }

  async downloadFile(field: any) {
    if (field && 'attachmentId' in field) {
      const responseObject = await this.coreStateMachineService.dispatch(Constants.STATE_MACHINE_ACTION_LOAD_FILE, field.attachmentId);
      console.log('responseObject.body', responseObject);
      const fileInformation = responseObject.body;
      field.fileContents = fileInformation.fileContents;
    } else {
      throw new Error('Invalid field parameter');
    }
  }

  public getCurrentLang() {
    return this.i18n.getLanguage();
  }

  private dataModel = () => {
    if (this.form.header.formId) {
      return decodeURIComponent(this.form.sections[0].body.details?.requestDetails);
    } else {
      return (this.StateMachineService.dataModel);
    }
  };

  private getEncodeData(data) {
    if (data) {
      return decodeURIComponent(data);
    } else {
      return '';
    }
  }

  private notExist = (data) => {
    let idx = this.form.sections.findIndex(item => item.id == data);
    if (this.form.sections.length == 2) {
      if (this.form.sections.length - 1 == idx) {
        return true;
      } else
        return false;
    }
    else {
      if (this.form.sections.length - 2 == idx) {
        return true;
      } else
        return false;
    }

  }

  private sectionIdHelper(context: any, id: any) {
    return context.segmentDynamicLoader.getPrintPartialName(id);
  }

  private translateHelper(key: any) {
    return this.i18n.translate(key);
  }

  private dateFormatHelper(key: any) {
    return moment(key).locale('en-US').format(Constants.DATE_TIME);
  }


  private dateFormatHelper2(key: any) {
    return moment(key).locale('en-US').format(Constants.DATE_DASH);
  }

  private dateFormatHelper3(key: any) {
    return moment(key).locale('en-US').format(Constants.DATE_SLASH);
  }

  private consolelog(type: any) {
    // <label>{{consolelog 'test'}}</label>
    console.log('------------', type, '-----------------', this);
  }

  private getFormId() {
    return this.form.header.formId;
  }

  private sectionTitleHelper(componentId: any, segmentDynamicLoader: any) {
    return segmentDynamicLoader.getSectionName(componentId);
  }

  private eq(valueA: any, valueB: any) {
    // {{#if (eq action.key 'MOVE')}}
    let result = valueA === valueB;
    return result;
  }

  private and(valueA: any, valueB: any) {
    // {{#if (and (eq body.details.workRelation.key 'SUBCONTRACTOR')  (eq body.details.workRelation.key 'CONTRACTOR'))}}
    let result = valueA && valueB;
    return result;
  }

  private or(valueA: any, valueB: any) {
    // {{#if (or (eq body.details.workRelation.key 'SUBCONTRACTOR')  (eq body.details.workRelation.key 'CONTRACTOR'))}}
    let result = valueA || valueB;
    return result;
  }

  private not(valueA: any, valueB: any) {
    // {{#if (not action.key 'MOVE')}}
    let result = valueA != valueB;
    return result;
  }


  private statusClass(status: string) {
    if (
      status === Constants.FORM_STATUS_REJECTED || status === Constants.FORM_STATUS_CANCELLED
      || status.toLowerCase() === 'reject' || status.toLowerCase() === 'unsatisfied' || status.toLowerCase() === 'cancel'
    ) {
      return 'danger';
    } else if (status === Constants.FORM_STATUS_PENDING || status.toLowerCase() === 'pending') {
      return 'warning';
    } else {
      return 'success';
    }
  }

  private getDirection() {
    if (this.i18n.getLanguage() === Constants.LANGUAGE_CODE_AR) {
      return 'rtl';
    } else {
      return 'ltr';
    }
  }

  public getPrintTemplate(): string {
    let template = this.i18n.getLanguage() === 'ar' ? customPrintRtlTemplate.printTemplate : customPrintTemplate.printTemplate;
    let compiledTemplate = Handlebars.compile(template);
    let printObject = this.preparePrintObject();
    this.registerHandlebarsHelpers();
    this.registerHandlebarsPartials();
    const htmlContent = `
    <html>
    <head>
      <title>Print</title>
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }
        body {
          margin: 0;
          font-family: Arial, sans-serif;
        }
        .container {
          width: 100%;
          max-width: 210mm; /* Fits within A4 width */
          margin: 0 auto;
        }
      </style>
    </head>
    <body>
      <div class="container">
        ${compiledTemplate(printObject)}
      </div>
    </body>
    </html>
  `;
    return htmlContent;
  }


}
