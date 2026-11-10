import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatDialog, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { EditorComponent } from '@tinymce/tinymce-angular';
import { Editor } from 'tinymce';
import { I18nService } from '../../../shared';
import * as Constants from '@ui-workspace/shared';
import { CoreStateMachineService } from '@ui-workspace/services';

@Component({
  selector: 'ui-workspace-review-feedback',
  templateUrl: './review-feedback.component.html',
  styleUrls: ['./review-feedback.component.scss'],
  standalone: true,
  imports: [EditorComponent, MatDialogModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ReviewFeedbackComponent {
  constructor(public i18n: I18nService,
    public dialogRef: MatDialogRef<any>,
    public coreStateMachine: CoreStateMachineService) { }

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
        args.content = this.cleanPastedContent(args.content);
      },
      fontsize_formats: "8px 10px 12px 14px 18px 24px 36px",
      font_size_input_default_unit: "px",
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
  }
  
  table[data-mce-selected] {
    max-width: none !important;
  }
  table td, table th {
    word-break: break-word !important;
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

table tr:first-child {
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
  letter-spacing: normal;
  overflow-x: auto !important;
}



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
        editor.on('init', () => {
          if (componentInstance.i18n.getLanguage() === 'ar') {
            editor.formatter.apply('alignright');
          } else {
            editor.formatter.apply('alignleft');
          }
          this.ensureDirWrapper(editor);
        });
        editor.on('input', () => {
          this.ensureDirWrapper(editor);
        });

        editor.on('SetContent', () => {
          this.ensureDirWrapper(editor);
        });
      },
    };
  })();

  private cleanPastedContent(content: string): string {
    let cleanedContent = content;

    // Define all replacements in an array for better performance
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

    // Apply all replacements
    replacements.forEach(({ pattern, replacement }) => {
      cleanedContent = cleanedContent.replace(pattern, replacement);
    });

    // Handle self-closing tags
    cleanedContent = this.fixSelfClosingTags(cleanedContent);

    // Remove empty elements and clean attributes
    cleanedContent = this.removeEmptyElements(cleanedContent);

    return cleanedContent;
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


  private ensureDirWrapper(editor: Editor) {
    const body = editor.getBody();
    let wrapper = body.querySelector('div[dir].__default-dir__');
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
}


