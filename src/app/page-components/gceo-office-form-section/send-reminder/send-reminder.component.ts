import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject } from '@angular/core';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { EditorComponent } from '@tinymce/tinymce-angular';
import { Editor } from 'tinymce';
import { I18nService, StateMachineService } from '../../../shared';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreStateMachineService } from '@ui-workspace/services';
import * as Constants from '@ui-workspace/shared';




export interface ConfirmDialogData {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  initialContent?: string;
}

@Component({
  selector: 'ui-workspace-send-reminder',
  templateUrl: './send-reminder.component.html',
  styleUrls: ['./send-reminder.component.scss'],
  standalone: true,
  imports: [EditorComponent, MatDialogModule,
    CommonModule,
    FormsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})



export class SendReminderComponent {

  constructor(public i18n: I18nService, public dialogRef: MatDialogRef<any>,
    public StateMachineService: StateMachineService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public coreStateMachine: CoreStateMachineService

  ) {
    console.log('StateMachineService.dataModel', StateMachineService.dataModel);

    StateMachineService.dataModel = `<p>Dear   ${data.data.data.pendingWith.titleEn}, </p>

  <p>This is a kind reminder for the pending hub request ${data.data.data.formId}. Thank you.</p>

  <br><br>

<div dir="rtl" style="text-align: right;">
  عزيزي  ${data.data.data.pendingWith.titleAr},<br>
  كرمًا للتذكير حيال الطلب المعلق لديكم برقم ${data.data.data.formId}. وشكرًا.
</div>
`

  }

  init: {





    powerpaste_word_import: string;
    plugins: string;
    branding: boolean;

    content_style: string;

    toolbar_mode: string;
    toolbar: string;
    menubar: boolean | string;
    content_langs: (
      | { code: string; title: string }
      | { code: string; title: string }
    )[];

    setup: (editor) => void;
  } = (() => {
    const componentInstance = this;
    return {
      // disable the whole beforeunload behavior:
      prevent_input_autofocus: true,
      autosave_ask_before_unload: false,
      //
      table_default_styles: {
        width: "100%",
        border: "1px solid gray",
      },
      fullscreen_native: true,
      automatic_uploads: false,
      images_upload_handler: () => { },
      toolbar_mode: "wrap",
      statusbar: false,
      // content_css: "/assets/scss/css/tinymce.editor.css",
      tinycomments_mode: "embedded",
      tinycomments_author: this.coreStateMachine.loggedInUserId(), // Safe access
      font_family_formats: "STC Forward=STC_Forward; STC Bold=STC_Forward_Bold;  STC Forward ExtraBold=STC_Forward_ExtraBold; STC Forward Light=STC_Forward_Light; STC Forward Medium=STC_Forward_Medium; STC Forward Thin=STC_Forward_Thin",
      max_height: 900,
      min_height: 600,
      branding: false,
      table_header_type: "cells",
      table_use_colgroups: false,
      table_grid: true,
      menu: Constants.TINY_MCE_MENU,
      menubar: Constants.TINY_MCE_MENUBAR,
      table_toolbar: Constants.TINY_MCE_TABLE_TOOLBAR,
      language: componentInstance.i18n.getLanguage(),
      directionality: componentInstance.i18n.getLanguage() === "ar" ? "rtl" : "ltr",
      table_responsive_width: false,
      object_resizing: true,
      resize_img_proportional: true,
      pagebreak_separator: '<hr class="mce-pagebreak">',
      quickbars_selection_toolbar: Constants.QUICKBARS_INSERT_TOOLBAR,
      quickbars_insert_toolbar: false,
      paste_preprocess: (plugin: any, args: any) => {
        // Mark all tables in pasted content so they don't get the default purple background
        if (args.content) {
          args.content = args.content.replace(/<table([^>]*)>/gi, (match, attributes) => {
            // Add data-pasted attribute to mark this as a pasted table
            if (!attributes.includes('data-pasted')) {
              attributes += ' data-pasted="true"';
            }
            return `<table${attributes}>`;
          });
        }
        args.content = this.cleanPastedContent(args.content);
      },
      fontsize_formats: "8pt 10pt 11pt 12pt 14pt 16pt 18pt 20pt 24pt 27pt 36pt",
      font_size_input_default_unit: "pt",
      paste_tab_spaces: 2,
      powerpaste_clean_filtered_inline_elements: "ol,li,a,strong, em, b, i, u, strike, sup, sub, font",
      paste_merge_formats: false,
      powerpaste_word_import: "prompt",
      powerpaste_googledocs_imports: "prompt",
      plugins: Constants.TINY_MCE_PLUGIN,

      //  plugins: Constants.TINY_MCE_PLUGIN_WITH_COMMENT,
      toolbar: Constants.TINY_MCE_TOOLBAR,





      // language: componentInstance.i18n.getLanguage(),
      content_langs: [
        { title: 'English', code: 'en' },
        { title: 'Arabic', code: 'ar' },
      ],

      content_style: `


 @font-face {
            font-family: "STC_Forward";
  src: url('assets/fonts/STCForward-Regular.eot');
  src: url('assets/fonts/STCForward-Regular.eot?#iefix') format('embedded-opentype'),
       url('assets/fonts/STCForward-Regular.woff') format('woff'),
       url('assets/fonts/STCForward-Regular.ttf') format('truetype');;
            font-weight: normal;
            font-style: normal;
            }

 @font-face {
            font-family: "STC_Forward_Bold";
  src: url('assets/fonts/STCForward-Bold.eot');
  src: url('assets/fonts/STCForward-Bold.eot?#iefix') format('embedded-opentype'),
       url('assets/fonts/STCForward-Bold.woff') format('woff'),
       url('assets/fonts/STCForward-Bold.ttf') format('truetype');
            font-weight: bold;
            font-style: normal;
            }      


  
@font-face {
  font-family: "STC_Forward_ExtraBold";
  src: url('assets/fonts/STCForward-ExtraBold.eot');
  src: url('assets/fonts/STCForward-ExtraBold.eot?#iefix') format('embedded-opentype'),
       url('assets/fonts/STCForward-ExtraBold.woff') format('woff'),
       url('assets/fonts/STCForward-ExtraBold.ttf') format('truetype');
  font-weight: 800;
  font-style: normal;
}

@font-face {
  font-family: "STC_Forward_Light";
  src: url('assets/fonts/STCForward-Light.eot');
  src: url('assets/fonts/STCForward-Light.eot?#iefix') format('embedded-opentype'),
       url('assets/fonts/STCForward-Light.woff') format('woff'),
       url('assets/fonts/STCForward-Light.ttf') format('truetype');
  font-weight: 300;
  font-style: normal;
}

@font-face {
  font-family: "STC_Forward_Medium";
  src: url('assets/fonts/STCForward-Medium.eot');
  src: url('assets/fonts/STCForward-Medium.eot?#iefix') format('embedded-opentype'),
       url('assets/fonts/STCForward-Medium.woff') format('woff'),
       url('assets/fonts/STCForward-Medium.ttf') format('truetype');
  font-weight: 500;
  font-style: normal;
}

@font-face {
  font-family: "STC_Forward_Thin";
  src: url('assets/fonts/STCForward-Thin.eot');
  src: url('assets/fonts/STCForward-Thin.eot?#iefix') format('embedded-opentype'),
       url('assets/fonts/STCForward-Thin.woff') format('woff'),
       url('assets/fonts/STCForward-Thin.ttf') format('truetype');
  font-weight: 100;
  font-style: normal;
}
body, .mce-content-body {
    font-family: "STC_Forward";
    font-size: 16pt !important;
    overflow-x: auto !important;
    word-break: break-word !important;
  }


  img, iframe, div, section, article {
    max-width: 100% !important;
    box-sizing: border-box !important;
    word-wrap: break-word !important;
  }

  img {
    height: auto !important;
    display: block;
  }
  
  img[data-mce-selected] {
    max-width: none !important;
  }

  table {
    border-collapse: collapse !important;
    table-layout: auto !important;
    box-sizing: border-box !important;
    min-width: 100px !important;
    max-width: none !important;
  }
  
  table[data-mce-selected] {
    max-width: none !important;
  }
  
  table td, table th {
    word-break: break-word !important;
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
    hyphens: auto !important;
    box-sizing: border-box !important;
    min-width: 50px !important;
    max-width: none !important;
  }
  
  /* Preserve Excel's formatting - inline styles have higher specificity than these rules */
  /* Excel's colors, borders, alignment, padding, etc. will be preserved via inline styles */
  
  table colgroup, table col {
    width: auto !important;
  }
  
  /* Ensure table resizing handles work properly */
  .mce-content-body table .mce-resizehandle {
    display: block !important;
    pointer-events: auto !important;
  }
  
  /* Allow tables to be resized - ensure resize handles are visible and functional */
  table[data-mce-selected] .mce-resizehandle {
    display: block !important;
  }



  .mce-content-body * {
    box-sizing: border-box !important;
  }
  
  .mce-content-body *[data-mce-selected] {
    max-width: none !important;
  }
  
  .mce-content-body .mce-resizehandle {
    max-width: none !important;
    pointer-events: auto !important;
  }


  .mce-pagebreak {
  border: 1px dashed #aaa;
  cursor: default;
  display: block;
  height: 5px !important;
  margin-top: 15px;
  width: 100% !important;
}


:root {
  --primary-color: #4f008c;
}

/* Only apply purple background to newly created tables, not pasted ones */
table:not([data-pasted]) tr:first-child {
  background: var(--primary-color);
  color: white;

  .editor-table {
    width: 100%;
    border-collapse: collapse;
  }
}

table td {
  border: 1px solid #bbb !important
}

* {
  font-family: "STC_Forward";
}

body#tinymce {
  padding: 10px !important;
  font-family: 'STC_Forward', sans-serif;
  font-size: 16pt !important;
  letter-spacing: normal;
  overflow-x: auto !important;
  position: relative !important;
  min-height: 600px !important;
}

/* Hashed vertical line - COMMENTED OUT */
/*
body#tinymce::before {
  content: '';
  position: absolute;
  left: 610px;
  top: 0;
  bottom: 0;
  width: 1px;
  border-left: 1px dashed #999;
  pointer-events: none;
  z-index: 1;
}

body#tinymce[dir="rtl"]::before {
  left: auto;
  right: 610px;
  border-left: none;
  border-right: 1px dashed #999;
}
*/

.mce-content-body {
  position: relative !important;
  min-height: 600px !important;
}

/* Hashed vertical line - COMMENTED OUT */
/*
.mce-content-body::before {
  content: '';
  position: absolute;
  left: 600px;
  top: 0;
  bottom: 0;
  width: 1px;
  border-left: 1px dashed #999;
  pointer-events: none;
  z-index: 1;
}

.mce-content-body[dir="rtl"]::before {
  left: auto;
  right: 600px;
  border-left: none;
  border-right: 1px dashed #999;
}

.__default-dir__ {
  position: relative;
}

.__default-dir__[dir="ltr"]::before {
  content: '';
  position: absolute;
  left: 600px;
  top: 0;
  bottom: 0;
  width: 1px;
  border-left: 1px dashed #999;
  pointer-events: none;
  z-index: 1;
}

.__default-dir__[dir="rtl"]::before {
  content: '';
  position: absolute;
  right: 600px;
  top: 0;
  bottom: 0;
  width: 1px;
  border-right: 1px dashed #999;
  pointer-events: none;
  z-index: 1;
}
*/



.mce-item-anchor {
  display: none !important;
}

.mce-content-body .mce-item-anchor:empty {
  display: none !important;
}

/* =============== # Reset tags ============*/
ul li p,
ul li h1,
ul li h2,
ul li h3,
ul li h4,
ul li h5,
ul li h6,
ol li p,
ol li h1,
ol li h2,
ol li h3,
ol li h4,
ol li h5,
ol li h6 {
  margin: 0;
  display: inline-block;
}

/* =============== # default OL style ============*/
ol {
  list-style-position: inside;
  padding-inline-start: 20px;
  font-family: 'STC_Forward', sans-serif;
}

ol>li {
  margin-top: 4px;
  font-family: 'STC_Forward', sans-serif;
}

ol>li::marker {
  content: counters(list-item, ".") ". ";
}

[dir="rtl"] ol>li::marker {
  content: counters(list-item, ".", decimal) ". ";
  /*  unicode-bidi: isolate-override; */
}

ol[style*="list-style-type: lower-alpha;"]>li::marker,
ol[style*="list-style-type: upper-alpha;"]>li::marker,
ol[style*="list-style-type: upper-roman;"]>li::marker,
ol[style*="list-style-type: lower-roman;"]>li::marker,
ol[style*="list-style-type: lower-greek;"]>li::marker {
  content: unset !important;
}

ol>li[style*="list-style: none;"]::marker {
  content: unset;
}

/* =============== # custom OL Arabic letters ============*/
[dir="rtl"] ol[style*="list-style-type: lower-alpha;"],
[dir="rtl"] ol[style*="list-style-type:upper-alpha;"] {
  list-style: none;
}

[dir="rtl"] ol[style*="list-style-type: lower-alpha;"]>li,
[dir="rtl"] ol[style*="list-style-type: upper-alpha;"]>li {
  display: block;
}

[dir="rtl"] ol[style*="list-style-type: lower-alpha;"]>li::before,
[dir="rtl"] ol[style*="list-style-type: upper-alpha;"]>li::before {
  display: inline-block;
  width: 1.5em;
  margin-right: -1.5em;
  margin-left: 0.5em;
  text-align: center;
  direction: ltr;
}

[dir="rtl"] ol[style*="list-style-type: lower-alpha;"]>li:nth-child(1):before,
[dir="rtl"] ol[style*="list-style-type: upper-alpha;"]>li:nth-child(1):before {
  content: ".أ";
}

[dir="rtl"] ol[style*="list-style-type: lower-alpha;"]>li:nth-child(2):before,
[dir="rtl"] ol[style*="list-style-type: upper-alpha;"]>li:nth-child(2):before {
  content: ".ب";
}

[dir="rtl"] ol[style*="list-style-type: lower-alpha;"]>li:nth-child(3):before,
[dir="rtl"] ol[style*="list-style-type: upper-alpha;"]>li:nth-child(3):before {
  content: ".ج";
}

[dir="rtl"] ol[style*="list-style-type: lower-alpha;"]>li:nth-child(4):before,
[dir="rtl"] ol[style*="list-style-type: upper-alpha;"]>li:nth-child(4):before {
  content: ".د";
}

[dir="rtl"] ol[style*="list-style-type: lower-alpha;"]>li:nth-child(5):before,
[dir="rtl"] ol[style*="list-style-type: upper-alpha;"]>li:nth-child(5):before {
  content: ".هـ";
}

[dir="rtl"] ol[style*="list-style-type: lower-alpha;"]>li:nth-child(6):before,
[dir="rtl"] ol[style*="list-style-type: upper-alpha;"]>li:nth-child(6):before {
  content: ".و";
}

[dir="rtl"] ol[style*="list-style-type: lower-alpha;"]>li:nth-child(7):before,
[dir="rtl"] ol[style*="list-style-type: upper-alpha;"]>li:nth-child(7):before {
  content: ".ز";
}

[dir="rtl"] ol[style*="list-style-type: lower-alpha;"]>li:nth-child(8):before,
[dir="rtl"] ol[style*="list-style-type: upper-alpha;"]>li:nth-child(8):before {
  content: ".ح";
}

[dir="rtl"] ol[style*="list-style-type: lower-alpha;"]>li:nth-child(9):before,
[dir="rtl"] ol[style*="list-style-type: upper-alpha;"]>li:nth-child(9):before {
  content: ".ط";
}

[dir="rtl"] ol[style*="list-style-type: lower-alpha;"]>li:nth-child(10):before,
[dir="rtl"] ol[style*="list-style-type: upper-alpha;"]>li:nth-child(10):before {
  content: ".ى";
}

[dir="rtl"] ol[style*="list-style-type: lower-alpha;"]>li:nth-child(11):before,
[dir="rtl"] ol[style*="list-style-type: upper-alpha;"]>li:nth-child(11):before {
  content: ".ك";
}

[dir="rtl"] ol[style*="list-style-type: lower-alpha;"]>li:nth-child(12):before,
[dir="rtl"] ol[style*="list-style-type: upper-alpha;"]>li:nth-child(12):before {
  content: ".ل";
}

[dir="rtl"] ol[style*="list-style-type: lower-alpha;"]>li:nth-child(13):before,
[dir="rtl"] ol[style*="list-style-type: upper-alpha;"]>li:nth-child(13):before {
  content: ".م";
}

[dir="rtl"] ol[style*="list-style-type: lower-alpha;"]>li:nth-child(14):before,
[dir="rtl"] ol[style*="list-style-type: upper-alpha;"]>li:nth-child(14):before {
  content: ".ن";
}

[dir="rtl"] ol[style*="list-style-type: lower-alpha;"]>li:nth-child(15):before,
[dir="rtl"] ol[style*="list-style-type: upper-alpha;"]>li:nth-child(15):before {
  content: ".س";
}

[dir="rtl"] ol[style*="list-style-type: lower-alpha;"]>li:nth-child(16):before,
[dir="rtl"] ol[style*="list-style-type: upper-alpha;"]>li:nth-child(16):before {
  content: ".ع";
}

[dir="rtl"] ol[style*="list-style-type: lower-alpha;"]>li:nth-child(17):before,
[dir="rtl"] ol[style*="list-style-type: upper-alpha;"]>li:nth-child(17):before {
  content: ".ف";
}

[dir="rtl"] ol[style*="list-style-type: lower-alpha;"]>li:nth-child(18):before,
[dir="rtl"] ol[style*="list-style-type: upper-alpha;"]>li:nth-child(18):before {
  content: ".ص";
}

[dir="rtl"] ol[style*="list-style-type: lower-alpha;"]>li:nth-child(19):before,
[dir="rtl"] ol[style*="list-style-type: upper-alpha;"]>li:nth-child(19):before {
  content: ".ق";
}

[dir="rtl"] ol[style*="list-style-type: lower-alpha;"]>li:nth-child(20):before,
[dir="rtl"] ol[style*="list-style-type: upper-alpha;"]>li:nth-child(20):before {
  content: ".ر";
}

[dir="rtl"] ol[style*="list-style-type: lower-alpha;"]>li:nth-child(21):before,
[dir="rtl"] ol[style*="list-style-type: upper-alpha;"]>li:nth-child(21):before {
  content: ".ش";
}

[dir="rtl"] ol[style*="list-style-type: lower-alpha;"]>li:nth-child(22):before,
[dir="rtl"] ol[style*="list-style-type: upper-alpha;"]>li:nth-child(22):before {
  content: ".ت";
}

[dir="rtl"] ol[style*="list-style-type: lower-alpha;"]>li:nth-child(23):before,
[dir="rtl"] ol[style*="list-style-type: upper-alpha;"]>li:nth-child(23):before {
  content: ".ث";
}

[dir="rtl"] ol[style*="list-style-type: lower-alpha;"]>li:nth-child(24):before,
[dir="rtl"] ol[style*="list-style-type: upper-alpha;"]>li:nth-child(24):before {
  content: ".خ";
}

[dir="rtl"] ol[style*="list-style-type: lower-alpha;"]>li:nth-child(25):before,
[dir="rtl"] ol[style*="list-style-type: upper-alpha;"]>li:nth-child(25):before {
  content: ".ذ";
}

[dir="rtl"] ol[style*="list-style-type: lower-alpha;"]>li:nth-child(26):before,
[dir="rtl"] ol[style*="list-style-type: upper-alpha;"]>li:nth-child(26):before {
  content: ".ض";
}

[dir="rtl"] ol[style*="list-style-type: lower-alpha;"]>li:nth-child(27):before,
[dir="rtl"] ol[style*="list-style-type: upper-alpha;"]>li:nth-child(27):before {
  content: ".ظ";
}

[dir="rtl"] ol[style*="list-style-type: lower-alpha;"]>li:nth-child(28):before,
[dir="rtl"] ol[style*="list-style-type: upper-alpha;"]>li:nth-child(28):before {
  content: ".غ";
}

/* ================== Misc Styles =========== */
.editor-var,
.has_anchor::marker {
  color: #ff375e;
  outline: 0;
}

.tox .tox-button {
  display: none !important;
}

.disabled-element {
  opacity: 0.5 !important;
  pointer-events: none !important;
}



`,

      setup: (editor) => {
        // Convert px to pt in font sizes and round to whole numbers
        // Using 96px = 72pt → 1px = 0.75pt
        const convertPxToPt = (content: string): string => {
          return content.replace(/font-size:\s*(\d+(?:\.\d+)?)px/gi, (match, size) => {
            const pxValue = parseFloat(size);
            const ptValue = Math.round(pxValue * 0.75); // e.g. 26.7px ≈ 20pt
            return `font-size: ${ptValue}pt`;
          });
        };
        
        // Round font size to whole number, correctly converting px → pt
        const roundFontSize = (fontSize: string): string => {
          if (!fontSize) return fontSize;
          const match = fontSize.match(/(\d+(?:\.\d+)?)(pt|px)/i);
          if (match) {
            const value = parseFloat(match[1]);
            const unit = match[2].toLowerCase();
            if (unit === 'px') {
              const ptValue = Math.round(value * 0.75);
              return `${ptValue}pt`;
            } else {
              const roundedValue = Math.round(value);
              return `${roundedValue}pt`;
            }
          }
          return fontSize;
        };

        const getComputedFontSizePt = (ed: Editor, node: Node): string | null => {
          if (!node || !(node as HTMLElement).style) return null;
          const computed = ed.dom.getStyle(node as HTMLElement, 'fontSize', true);
          if (!computed || typeof computed !== 'string') return null;
          return roundFontSize(computed);
        };

        editor.on('init', () => {
          if (componentInstance.i18n.getLanguage() === 'ar') {
            editor.formatter.apply('alignright');
          } else {
            editor.formatter.apply('alignleft');
          }
          this.ensureDirWrapper(editor);
          const content = editor.getContent();
          if (content && content.includes('font-size') && content.includes('px')) {
            const convertedContent = convertPxToPt(content);
            editor.setContent(convertedContent);
          }
          const body = editor.getBody();
          if (body) {
            body.setAttribute('style', (body.getAttribute('style') || '') + '; font-size: 16pt !important;');
            body.style.fontSize = '16pt';
            const wrapper = body.querySelector('div[dir].__default-dir__');
            if (wrapper) {
              (wrapper as HTMLElement).setAttribute('style', ((wrapper as HTMLElement).getAttribute('style') || '') + '; font-size: 16pt !important;');
              (wrapper as HTMLElement).style.fontSize = '16pt';
            }
            const allElements = body.querySelectorAll('[style*="font-size"]');
            allElements.forEach((el: Element) => {
              const htmlEl = el as HTMLElement;
              if (htmlEl.style?.fontSize) {
                const roundedSize = roundFontSize(htmlEl.style.fontSize);
                if (roundedSize !== htmlEl.style.fontSize) {
                  htmlEl.style.fontSize = roundedSize;
                }
              }
            });
          }
          setTimeout(() => {
            const selection = editor.selection;
            const node = selection.getNode();
            if (node && (node as HTMLElement).style) {
              const currentSize = (node as HTMLElement).style.fontSize;
              if (!currentSize || currentSize === '' || currentSize.includes('px')) {
                const computedPt = getComputedFontSizePt(editor, node);
                (node as HTMLElement).style.fontSize = computedPt || '16pt';
              } else {
                const roundedSize = roundFontSize(currentSize);
                if (roundedSize !== currentSize) {
                  (node as HTMLElement).style.fontSize = roundedSize;
                }
              }
            }
            const b = editor.getBody();
            if (b && (!b.style.fontSize || b.style.fontSize === '')) {
              b.style.fontSize = '16pt';
            }
          }, 100);
        });
        
        editor.on('NodeChange', (e) => {
          const node = e.element;
          if (node && node.style && node.style.fontSize && node.style.fontSize.trim() !== '') {
            const fontSize = node.style.fontSize;
            const roundedSize = roundFontSize(fontSize);
            if (roundedSize !== fontSize) {
              node.style.fontSize = roundedSize;
            }
          }
        });
        
        editor.on('input', () => {
          this.ensureDirWrapper(editor);
        });

        editor.on('SetContent', (e) => {
          this.ensureDirWrapper(editor);
          // Do not run px-to-pt conversion on paste (would replace the entire document)
          if (e.paste) {
            return;
          }
          // Convert px to pt when content is set programmatically
          if (e.content && e.content.includes('font-size') && e.content.includes('px')) {
            const convertedContent = convertPxToPt(e.content);
            if (convertedContent !== e.content) {
              editor.setContent(convertedContent, { format: 'html' });
            }
          }
        });

        // Include mcePaintFormats so we run the rounding pass after Format Painter.
        // Do NOT set computed font-size when command is mcePaintFormats (see below).
        const formatCommands = [
          'FontSize',
          'mceToggleFormat',
          'mcePaintFormats',
          'Bold',
          'Italic',
          'Underline',
          'Strikethrough',
          'ForeColor',
          'BackColor',
          'RemoveFormat',
        ];
        const inlineFormatCommands = [
          'mceToggleFormat',
          'Bold',
          'Italic',
          'Underline',
          'Strikethrough',
          'ForeColor',
          'BackColor',
          'RemoveFormat',
        ];
        const inlineTags = ['span', 'strong', 'b', 'em', 'i', 'u', 'a', 'font', 'sub', 'sup', 'strike', 's'];
        const isInlineElement = (n: Node): n is HTMLElement =>
          n?.nodeType === 1 && inlineTags.includes((n as HTMLElement).tagName?.toLowerCase());

        editor.on('ExecCommand', (e) => {
          if (formatCommands.includes(e.command)) {
            setTimeout(() => {
              const body = editor.getBody();
              const selection = editor.selection;
              const selectedNode = selection.getNode();
              const el = selectedNode as HTMLElement;
              const isFontSizeOnly = e.command === 'FontSize';

              if (selectedNode && el.style) {
                const fontSize = el.style.fontSize;
                if (fontSize && fontSize.trim() !== '') {
                  const roundedSize = roundFontSize(fontSize);
                  if (roundedSize !== fontSize) {
                    el.style.fontSize = roundedSize;
                  }
                } else if (
                  !isFontSizeOnly &&
                  e.command !== 'mcePaintFormats' &&
                  inlineFormatCommands.includes(e.command) &&
                  isInlineElement(selectedNode)
                ) {
                  const computedPt = getComputedFontSizePt(editor, selectedNode);
                  if (computedPt) {
                    el.style.fontSize = computedPt;
                  }
                }
              }

              const elements = body.querySelectorAll('[style*="font-size"]');
              elements.forEach((elem: HTMLElement) => {
                const fs = elem.style.fontSize;
                if (fs) {
                  const roundedSize = roundFontSize(fs);
                  if (roundedSize !== fs) {
                    elem.style.fontSize = roundedSize;
                  }
                }
              });
            }, 0);
          }
        });

        editor.on('BeforeExecCommand', (e) => {
          if (e.command === 'FontSize') {
            if (e.value && typeof e.value === 'string') {
              const roundedValue = roundFontSize(e.value);
              if (roundedValue !== e.value) {
                e.value = roundedValue;
              }
            }
          }
        });

        // Handle table insertion - apply purple background only to newly created tables
        editor.on('ExecCommand', (e) => {
          if (e.command === 'mceInsertTable' || e.command === 'mceTableInsertTable') {
            // New table is being inserted via toolbar
            setTimeout(() => {
              const body = editor.getBody();
              const tables = body.querySelectorAll('table:not([data-pasted])');
              tables.forEach((table: HTMLTableElement) => {
                // Check if this table doesn't have data-pasted (meaning it's newly created)
                if (!table.hasAttribute('data-pasted')) {
                  const firstRow = table.querySelector('tr:first-child');
                  if (firstRow) {
                    const cells = firstRow.querySelectorAll('td, th');
                    cells.forEach((cellElement: Element) => {
                      const cell = cellElement as HTMLElement;
                      // Only apply purple if cell doesn't have a background color
                      if (!cell.style.backgroundColor || cell.style.backgroundColor === 'transparent' || cell.style.backgroundColor === '') {
                        cell.style.backgroundColor = '#4f008c';
                        cell.style.color = 'white';
                      }
                    });
                  }
                }
              });
            }, 100);
          }
        });
        
        // Also handle SetContent to ensure pasted tables are marked
        editor.on('SetContent', (e) => {
          if (e.content) {
            const body = editor.getBody();
            const pastedTables = body.querySelectorAll('table[data-pasted]');
            // Ensure pasted tables don't get purple background
            pastedTables.forEach((table: HTMLTableElement) => {
              const firstRow = table.querySelector('tr:first-child');
              if (firstRow) {
                const cells = firstRow.querySelectorAll('td, th');
                cells.forEach((cellElement: Element) => {
                  const cell = cellElement as HTMLElement;
                  // Remove any purple background that might have been applied
                  const bgColor = cell.style.backgroundColor;
                  if (bgColor === '#4f008c' || bgColor === 'rgb(79, 0, 140)' || bgColor === 'rgba(79, 0, 140, 1)') {
                    cell.style.backgroundColor = '';
                    cell.style.color = '';
                  }
                });
              }
            });
          }
        });
      },
    };
  })();


  private cleanPastedContent(content: string): string {
    if (!content || typeof content !== 'string') {
      return content || '';
    }
    // Strip full-document markup (html/body) so paste always inserts at cursor instead of replacing the whole editor
    let fragment = content.trim();
    if (/<\s*html[\s>]|<\s*!DOCTYPE|<\s*body[\s>]/i.test(fragment)) {
      try {
        const doc = new DOMParser().parseFromString(fragment, 'text/html');
        const body = doc.body;
        fragment = body ? body.innerHTML : fragment;
      } catch {
        // keep fragment as-is if parsing fails
      }
    }
    let cleanedContent = fragment;

    // Check if content contains tables - if so, preserve Excel formatting
    const hasTable = /<table[\s\S]*?<\/table>/i.test(cleanedContent);

    if (hasTable) {
      // For table content, do minimal cleaning to preserve Excel formatting
      // Only clean what's absolutely necessary
      const tableReplacements = [
        { pattern: /font-family:[^;]+;/gi, replacement: "font-family: STC_Forward;" },
        { pattern: /ü/g, replacement: '<span style="font-family:Wingdings !important ;">ü</span>' },
      ];
      
      tableReplacements.forEach(({ pattern, replacement }) => {
        cleanedContent = cleanedContent.replace(pattern, replacement);
      });
      
      // Fix table column order while preserving all formatting
      cleanedContent = this.fixTableColumnOrder(cleanedContent);
      
      // Handle self-closing tags
      cleanedContent = this.fixSelfClosingTags(cleanedContent);
      
      // Only remove empty elements, preserve all attributes
      cleanedContent = this.removeEmptyElementsPreserveFormatting(cleanedContent);
    } else {
      // Preserve font-size in pasted content so copy-paste within the editor keeps the chosen size
      const replacements = [
        { pattern: /<p>\s*\d+(\.\d+)+ &nbsp;/gm, replacement: "<p>" },
        { pattern: /s*\d+(\.\d+)+ &nbsp;/gm, replacement: "" },
        { pattern: /^\d+(\.\d+)+\s*/gm, replacement: "" },
        { pattern: /font-family:[^;]+;/gi, replacement: "font-family: STC_Forward;" },
        { pattern: /ü/g, replacement: '<span style="font-family:Wingdings !important ;">ü</span>' },
        { pattern: /&nbsp;/g, replacement: "" },
        { pattern: /nbsp;/g, replacement: "" },
        { pattern: /;nbsp/g, replacement: "" },
        { pattern: /<br[^>]*>/gi, replacement: "</p><p>" },
        /////////////////////////////
        { pattern: /<li[^>]*>/gi, replacement: "" }
      ];

      replacements.forEach(({ pattern, replacement }) => {
        cleanedContent = cleanedContent.replace(pattern, replacement);
      });

      // Handle self-closing tags
      cleanedContent = this.fixSelfClosingTags(cleanedContent);

      // Remove empty elements and clean attributes
      cleanedContent = this.removeEmptyElements(cleanedContent);
    }

    // If cleaning left nothing, return original fragment so paste still inserts something
    if (!cleanedContent || !cleanedContent.trim()) {
      return fragment;
    }
    return cleanedContent;
  }

  private fixTableColumnOrder(content: string): string {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const isRTL = this.i18n.getLanguage() === 'ar';
      
      // Find all table elements
      const tables = doc.querySelectorAll('table');
      
      tables.forEach((table: HTMLTableElement) => {
        // Explicitly set direction to ltr for tables to preserve Excel column order
        // This prevents RTL from reversing the column order
        table.setAttribute('dir', 'ltr');
        table.style.direction = 'ltr';
        
        // Preserve table width - keep all widths to maintain Excel formatting
        // Only remove max-width constraints to allow expansion
        if (table.style.maxWidth) {
          table.style.maxWidth = '';
        }
        // Preserve all width values from Excel - don't remove them
        // This allows tables to maintain their size and be resizable
        
        // Preserve colgroup and col widths - only remove very restrictive ones
        const colgroups = table.querySelectorAll('colgroup, col');
        colgroups.forEach((colElement: Element) => {
          const col = colElement as HTMLElement;
          if (col.style.width) {
            const widthValue = col.style.width.trim();
            const pixelMatch = widthValue.match(/(\d+)px/);
            // Only remove very small fixed widths
            if (pixelMatch && parseInt(pixelMatch[1]) < 50) {
              col.style.width = '';
            }
            // Keep percentage widths and larger pixel widths
          }
        });
        
        // Also set direction on all cells to ensure consistent rendering
        // PRESERVE ALL EXCEL FORMATTING (colors, borders, alignment, etc.)
        const cells = table.querySelectorAll('td, th');
        cells.forEach((cellElement: Element) => {
          const cell = cellElement as HTMLElement;
          // Remove max-width constraints to allow cells to expand
          if (cell.style.maxWidth) {
            cell.style.maxWidth = '';
          }
          // Preserve all cell widths from Excel - don't remove them
          // This maintains Excel formatting and allows resizing
          
          // Add wrapping properties only if not already set (preserve Excel's white-space settings)
          // But ensure wrapping is possible for long content
          const existingWhiteSpace = cell.style.whiteSpace;
          if (!existingWhiteSpace || existingWhiteSpace === 'nowrap') {
            // Only change nowrap to normal, preserve pre, pre-wrap, etc.
            cell.style.whiteSpace = 'normal';
          }
          
          // Add word-wrap only if not already set, preserve existing overflow-wrap
          if (!cell.style.wordWrap && !cell.style.overflowWrap) {
            cell.style.wordWrap = 'break-word';
            cell.style.overflowWrap = 'break-word';
          }
          
          // PRESERVE ALL OTHER STYLES (colors, borders, alignment, padding, etc.)
          // Don't modify background-color, color, border, text-align, vertical-align, padding, etc.
          // These are preserved from Excel
          
          // Preserve text direction within cells based on content, but keep table structure LTR
          if (isRTL && cell.textContent) {
            // Check if cell content is Arabic
            const hasArabic = /[\u0600-\u06FF]/.test(cell.textContent);
            if (hasArabic) {
              cell.setAttribute('dir', 'rtl');
            }
          }
        });
      });
      
      return doc.body.innerHTML;
    } catch (error) {
      console.warn('Error fixing table column order:', error);
      return content; // Return original content if parsing fails
    }
  }

  private removeEmptyElementsPreserveFormatting(htmlContent: string): string {
    try {
      const doc = new DOMParser().parseFromString(htmlContent, "text/html");

      doc.body.querySelectorAll("*").forEach((element) => {
        // Remove empty elements (except self-closing tags)
        if (!element.hasChildNodes() &&
          !element.textContent?.trim() &&
          !this.isSelfClosingTag(element.tagName)) {
          element.remove();
          return;
        }

        // Only clean unwanted MCE-specific attributes, preserve all Excel formatting
        const attributesToRemove = [
          "data-mce-annotation",
          "data-mce-selected",
          "data-mce-annotation-uid"
        ];

        attributesToRemove.forEach(attr => element.removeAttribute(attr));

        // Clean unwanted classes, but preserve Excel classes
        element.classList.remove("mce-annotation", "tox-comment");
        
        // PRESERVE all style attributes, class attributes (except MCE ones), 
        // and all other formatting attributes from Excel
      });

      return doc.body.innerHTML;
    } catch (error) {
      console.warn("Error cleaning HTML content:", error);
      return htmlContent; // Return original content if parsing fails
    }
  }

  private fixSelfClosingTags(content: string): string {
    // const selfClosingTags = ["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"];
    const selfClosingTags = ["img"];

    selfClosingTags.forEach((tag) => {
      const regex = new RegExp(`<${tag}([^>]+)>`, 'g');
      content = content.replace(regex, `<${tag}$1/>`);
    });

    return content;
  }

  private removeEmptyElements(htmlContent: string): string {
    try {
      const doc = new DOMParser().parseFromString(htmlContent, "text/html");

      doc.body.querySelectorAll("*").forEach((element) => {
        // Remove empty elements (except self-closing tags)
        if (!element.hasChildNodes() &&
          !element.textContent?.trim() &&
          !this.isSelfClosingTag(element.tagName)) {
          element.remove();
          return;
        }

        // Clean unwanted attributes
        const attributesToRemove = [
          "data-mce-annotation",
          "data-mce-selected",
          "data-mce-annotation-uid"
        ];

        attributesToRemove.forEach(attr => element.removeAttribute(attr));

        // Clean unwanted classes
        element.classList.remove("mce-annotation", "tox-comment");
      });

      return doc.body.innerHTML;
    } catch (error) {
      console.warn("Error cleaning HTML content:", error);
      return htmlContent; // Return original content if parsing fails
    }
  }

  private isSelfClosingTag(tagName: string): boolean {
    const selfClosingTags = ["img", "br", "hr", "input", "link", "meta", "area", "base"];
    console.log("essssssssssam");

    return selfClosingTags.includes(tagName.toLowerCase());
  }




  isEmpty = true;
  private ensureDirWrapper(editor: Editor) {
    const body = editor.getBody();
    let wrapper = body.querySelector('div[dir].__default-dir__');
    this.isEmpty = editor.getContent({ format: 'text' }).trim() === '';
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.classList.add('__default-dir__');
      const dir = this.i18n.getLanguage() === 'ar' ? 'rtl' : 'ltr';
      wrapper.setAttribute('dir', dir);
      wrapper.innerHTML = body.innerHTML;
      body.innerHTML = '';
      body.appendChild(wrapper);
    }
  }
  replacements = [
    // NEW: remove any  nbsp
    { pattern: /&nbsp;/g, replacement: "" },
    { pattern: /nbsp;/g, replacement: "" },
    { pattern: /;nbsp/g, replacement: "" },
  ];
  confirm(): void {
    this.replacements.forEach(({ pattern, replacement }) => {
      this.StateMachineService.dataModel = this.StateMachineService.dataModel.replace(pattern, replacement);
    });
    this.dialogRef.close({
      confirmed: true,
      content: this.StateMachineService.dataModel,
    });
  }

  cancel(): void {
    this.dialogRef.close({
      confirmed: false,
      content: null,
    });
  }
}


