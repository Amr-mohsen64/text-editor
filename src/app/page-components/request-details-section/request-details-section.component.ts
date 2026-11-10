import { Component, Input } from '@angular/core';
import { I18nService, StateMachineService } from '../../shared';
import { CoreStateMachineService, ListenerService, ProfileRequestorService, SidenavService } from '@ui-workspace/services';
import { QuickToolbarSettingsModel } from '@syncfusion/ej2-angular-richtexteditor';
import * as Constants from '@ui-workspace/shared';
import { Form, Messages, Section } from '@ui-workspace/modules';
import loadFormHooks from '@ui-workspace/loadHooks';
import { EditorComponent } from '@tinymce/tinymce-angular';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { TermsConditionsComponent } from './terms-conditions/terms-conditions.component';
import { EditRequestDetailsComponent } from './editable-request-details/editable-request-details.component';

@Component({
  selector: 'app-request-details-section',
  templateUrl: './request-details-section.component.html',
  styleUrls: ['./request-details-section.component.scss']
})
export class RequestDetailsSectionComponent {
  isOpen = true;
  isButtonOpen = false;
  dataModel: any;
  @Input() isReadOnly: boolean;
  @Input() section: Section;
  @Input() lov: any;
  @Input() className: string = 'info-section';
  searchEmployee: any;
  approverList: any[] = [];
  originalApproverList: any[] = [];
  currentSectionId: string;
  lastSectionId: string;
  form: Form;
  public tools: object = {
    items: ['Undo', 'Redo', '|',
      'Bold', 'Italic', 'Underline', 'StrikeThrough', '|',
      'FontName', 'FontSize', 'FontColor', 'BackgroundColor', '|',
      'SubScript', 'SuperScript', '|',
      'LowerCase', 'UpperCase', '|',
      'Formats', 'Alignments', '|', 'OrderedList', 'UnorderedList', '|',
      'Indent', 'Outdent', '|', 'CreateLink',
      'Image', '|', 'ClearFormat', 'SourceCode', '|', 'FullScreen']
  };
  public quickTools: object = {
    image: [
      'Replace', 'Align', 'Caption', 'Remove', 'InsertLink', '-', 'Display', 'AltText', 'Dimension']
  };
  emailExists: boolean;
  public quickToolbarSettings: QuickToolbarSettingsModel = {
    table: ['TableHeader', 'TableRows', 'TableColumns', 'TableCell', '-', 'BackgroundColor', 'TableRemove', 'TableCellVerticalAlign', 'Styles']
  };

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
      branding: false,
      table_header_type: "cells",
      table_use_colgroups: false,
      table_grid: true,
      menu: Constants.TINY_MCE_MENU,
      menubar: '',
      table_toolbar: Constants.TINY_MCE_TABLE_TOOLBAR,
      language: componentInstance.i18n.getLanguage(),
      directionality: componentInstance.i18n.getLanguage() === "ar" ? "rtl" : "ltr",
      table_responsive_width: true,
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
      plugins: `${Constants.TINY_MCE_PLUGIN} autoresize`,

      //  plugins: Constants.TINY_MCE_PLUGIN_WITH_COMMENT,
      toolbar: '',
      
      // Autoresize configuration
      autoresize_min_height: 100,
      autoresize_max_height: 0, // 0 means no max height limit - allows all content to be shown
      autoresize_bottom_margin: 0,
      autoresize_overflow_padding: 0,





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
    overflow-y: visible !important;
    word-break: break-word !important;
    padding: 0 !important;
    margin: 0 !important;
    width: fit-content !important;
  }


  img, table, iframe, div, section, article {
    max-width: 100% !important;
   // width: auto !important;
    box-sizing: border-box !important;
    height: auto !important;
    table-layout: fixed !important;
    word-wrap: break-word !important;
  }

  img {
    height: auto !important;
    display: block;
  }

  table {
  //  width: 100% !important;
    border-collapse: collapse !important;
  }
  table td, table th {
    word-break: break-word !important;
  }



  .mce-content-body * {
    max-width: 100% !important;
    box-sizing: border-box !important;
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
  // background: var(--primary-color);
  // color: white;

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
  padding: 0 !important;
  margin: 0 !important;
  font-family: 'STC_Forward', sans-serif;
  letter-spacing: normal;
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
      setup: function (editor) {
        editor.on('init', function () {
          if (componentInstance.i18n.getLanguage() === 'ar') {
            editor.formatter.apply('alignright');
          } else {
            editor.formatter.apply('alignleft');
          }
        });



      }
    };
  })();




  // editor: any;  // store the TinyMCE instance

  // onEditorInit(event: any) {
  //   this.editor = event.editor; // or just event
  //   this.updateMenubarVisibility();
  // }


  // updateMenubarVisibility() {
  //   if (!this.editor) return;

  //   const menubar = this.editor.getContainer().querySelector('.tox-menubar');
  //   const toolBar = this.editor.getContainer().querySelector('.tox-toolbar');

  //   if (!menubar) return;
  //   console.log('readOnly', this.section?.header?.readOnly);

  //   menubar.style.display = this.section?.header?.readOnly ? 'none' : '';
  //   toolBar.style.display = this.section?.header?.readOnly ? 'none' : '';

  // }





  showMenu() {
    console.log('readOnly', this.section?.header?.readOnly, this.isReadOnly);
    setTimeout(() => {
      console.log('readOnly', this.section?.header?.readOnly, this.isReadOnly);
      if (this.section?.header?.readOnly) {
        return '';
      } else {
        return Constants.TINY_MCE_MENUBAR;
      }
    }, 2000);
    return Constants.TINY_MCE_MENUBAR;
  }



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




  disabledInit: EditorComponent['init'] = {
    branding: false, resize: true, elementpath: false, wordcount: false,
    menubar: false,
    toolbar_mode: 'sliding', //sliding or 'wrap','floating','scrolling'
    plugins: 'lists link image table code  ',
    // toolbar: 'insertfile a11ycheck undo redo | bold italic | forecolor backcolor | codesample | alignleft aligncenter alignright alignjustify | bullist numlist | link image',
    height: '240px',
    language: this.i18n.getLanguage(),
    // blockquote blocks |
    toolbar: ''
    // plugins: 'lists link image table code help wordcount'
  };

  constructor(public i18n: I18nService,
    public profileRequestorService: ProfileRequestorService,
    public StateMachineService: StateMachineService,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer,
    public _listenerService: ListenerService,
    public coreStateMachine: CoreStateMachineService,
    private sidenavService: SidenavService
  ) {

  }




















  openTermsPopup(): void {
    const dialogRef = this.dialog.open(TermsConditionsComponent, {
      width: '700px',
      panelClass: ['main-popup'],
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(() => {
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    let arrayLength = this.approverList.length - 1;
    if (event.currentIndex == arrayLength || event.currentIndex == arrayLength - 1) {
      // moveItemInArray(this.approverList, event.previousIndex, event.currentIndex - 1);
      moveItemInArray(this.approverList, event.previousIndex, event.previousIndex);
    } else {
      moveItemInArray(this.approverList, event.previousIndex, event.currentIndex);
    }
  }

  ngAfterViewInit() {
    this.servicesSubscriptions();

  }

  public servicesSubscriptions() {
    this.profileRequestorService.getForm().subscribe(data => {
      this.form = data;
      console.log("nnnnnnnnnnnn", this.form.header.formId);

      if (!this.isReadOnly && !this.form.header.formId) {
        this.openTermsPopup();
      }
      this.section.body.seniorSectorName = this.form.profileInfoDrop.seniorSectorName;
      this.lastSectionId = this.form.sections[this.form.sections.length - 1].id;
      this.currentSectionId = this.section.id;
      if (this.section.body.details?.requestDetails) {
        this.dataModel = decodeURIComponent(this.section.body.details?.requestDetails);
        console.log("this.dataModel", this.dataModel);

        this.section.body.requestDetails = this.dataModel;
        // this.section.body.requestDetails  = this.sanitizer.bypassSecurityTrustHtml(this.section.body.requestDetails);
      }
      this.approverList = this.section?.body?.details?.approverList;
      this.originalApproverList = JSON.parse(JSON.stringify(this.approverList));
      const currentLanguage = this.i18n.getLanguage();
      // this.approverList.push(this.createCeoObject(currentLanguage));


      if (!this.form.header.formId) {
        if (this.form.sections[this.form.sections.length - 1].header.readOnly) {
          this.section.body.details.isEditable == 'false';
          this.coreStateMachine.canEditForm = false;
        }
        this.section.body.details.isEditable == 'true' ? this.coreStateMachine.canEditForm = true : this.coreStateMachine.canEditForm = false;

      }

    });
  }

  private createCeoObject(currentLanguage: string) {
    const personName = currentLanguage === 'en' ? 'Olayan Mohammed H Alwetaid' : 'عليان محمد حمد بن وتيد';
    const authorityValue = currentLanguage === 'en' ? 'Approve' : 'موافقة';
    return {
      'approver': {
        'personName': personName,
        'personEmail': 'uwetaid@stc.com.sa'
      },
      'role': 'MEO_GCEO',
      'authority': {
        'value': authorityValue,
        'key': 'APPROVE'
      },
      'index': '-1',
      'position': {
        'value': '',
        'key': ''
      },
      'type': 'Internal'
    };
  }

  uploading = false;

  handleUploading(status: boolean) {
    this.uploading = status;
  }
  handleEmitValue(data: any, fieldName: string) {
    this.section.body.details[fieldName] = data;
    if (fieldName == 'searchEmployee') {
      this.form.messages = null;
      this.emailValid = true;
      if (data.personEmail) {
        this.checkApprover(data.personEmail, data);
      }
    }
    if (fieldName == 'typeOfRequest') {
      if (data.key !== 'OTHER') {
        this.section.body.details.otherRequestType = '';
      }
    }
  }

  handleUserInfoEmitValue(data: any, rowData: any) {
    rowData['authority'] = data;
  }

  emailValid: boolean = true;
  emailValidMsg: string;

  checkApprover(email: string, userData: any) {
    if (!this.isReadOnly) {
      this.profileRequestorService.appFullLoader = true;
      this.StateMachineService.dispatch('checkApprover', email)
        .then((Response: Messages) => {
          this.profileRequestorService.appFullLoader = false;
          if (Response) {
            if (Response instanceof Messages) {
              this.emailValid = false;
              this.emailValidMsg = Response.error?.['0'];
              // this.errorResponse(Response);
            } else {
              this.emailValid = true;
              this.prepareData(userData);
            }
          }
        });
    }
  }

  errorResponse(form: any) {
    if (!this.form) {
      this.form = new Form(
        Constants.NO_VALUE,
        Constants.NO_VALUE,
        Constants.NO_VALUE,
        Constants.NO_VALUE,
        Constants.NO_VALUE,
        Constants.NO_VALUE,
        form
      );
    } else {
      this.form.messages = form;
      this.form = loadFormHooks.afterTranspilePayload(this.form);
    }
    window.scrollTo(0, 0);
  }

  prepareData(userData: { personEmail: any; personName: any; job: any; employeeNumber }) {
    let obj = {
      'index': this.approverList.length + 1,
      'approver': {
        'personEmail': userData.personEmail,
        'personName': userData.personName,
        'employeeNumber': userData.employeeNumber
      },
      'authority': {
        'value': this.i18n.getLanguage() == 'en' ? 'Approve' : 'موافقة',
        'key': 'APPROVE'
      },
      'role': this.approverList?.length + 1,
      'approverType': userData.job,
      'type': 'external'
    };
    let emailExists = this.approverList.some((item: any) => item.approver.personEmail === userData.personEmail);
    this.emailExists = emailExists;
    setTimeout(() => {
      this.emailExists = false;
    }, 5000);
    if (!emailExists) {
      this.approverList.splice(0, 0, obj);
    }
    this.searchEmployee = '';
  }


  getImage(id: number): string {
    return '/group/i-gate/wm-bpm/forms/-/proxy/portrait?email=' + String(id);
  }

  getShortNameSearch(name: string) {
    if (name) {
      let nameTokens = name.split(' ');

      if (nameTokens.length == 1) {
        return [nameTokens[0]].join(' ');
      } else {
        if (nameTokens[nameTokens.length - 2].toLowerCase() == 'al') {
          return [nameTokens[0], nameTokens[nameTokens.length - 2], nameTokens[nameTokens.length - 1]].join(' ');
        } else {
          return [nameTokens[0], nameTokens[nameTokens.length - 1]].join(' ');
        }
      }
    } else {
      return null;
    }
  }

  userAlreadyExist: boolean = false;

  deleteRow(ind: number) {
    if (!this.isReadOnly) {
      this.approverList = this.approverList.filter((item: any, index) => {
        return index != ind;
      });
      this.userAlreadyExist = false;
    }
  }


  requestTypeValid: boolean = true;
  otherRequestTypeValid: boolean = true;
  requestTitleValid: boolean = true;

  validForm(action: string) {

    console.log('isEmpty', this.StateMachineService.isEmpty);

    let returnValue = true;
    const lastSection = this.section.body.details;
    const lastSectionId = this.section.id;
    let commentValid: boolean;
    if (lastSection.comment && lastSection.comment.length > 0) {
      commentValid = lastSection.comment.length >= 15 &&
        lastSection.comment.length <= 500;
    } else {
      commentValid = true;
    }
    switch (action) {
      case 'SUBMIT':
        if (lastSectionId == 'requestDetails') {
          console.log("ddddddddddddddd", this.StateMachineService.contentLength);

          // let requestTypeValid = false;
          if (this.section?.body?.details?.typeOfRequest?.key) {
            if (this.section?.body?.details?.typeOfRequest?.key === 'OTHER') {
              if (this.section?.body?.details?.otherRequestType) {
                this.requestTypeValid = true;
                this.otherRequestTypeValid = true;
              } else {
                this.requestTypeValid = false;
                this.otherRequestTypeValid = false;
              }
            } else {
              this.requestTypeValid = true;
            }
          } else {
            this.requestTypeValid = false;
          }
          let isValid = false;
          for (let i = 0; i < this.approverList.length; i++) {
            let rowData = this.approverList[i];
            if (!rowData?.authority?.key) {
              isValid = false;
              return false;
            } else {
              isValid = true;
            }
          }
          if (lastSection?.requestTitle) {
            this.requestTitleValid = true
          }
          else {
            this.requestTitleValid = false
          }
          returnValue = !!(lastSection?.requestTitle && this.requestTypeValid
            && lastSection?.requestTitle.trim()?.length >= 25 && lastSection?.typeOfRequest?.key
            && this.StateMachineService.dataModel
            && !this.StateMachineService.isEmpty
            && this.StateMachineService.contentLength >= 400
            && isValid && !this.StateMachineService.isApprovalLoading);
        }
        break;

      case 'APPROVE':
        returnValue = !!commentValid;
        break;
      case 'REJECT':
        returnValue = !!(lastSection.comment && commentValid);
        break;
      case 'SENDBACK':
        returnValue = !!(lastSection.comment && commentValid);
        break;
      case 'SAVE_CHANGES':
        returnValue = true;
        break;
      case 'CANCEL':
        returnValue = true;
        break;
    }
    return returnValue;
  }
  isSubmitClicked = false
  replacements = [
    // NEW: remove any  nbsp
    { pattern: /&nbsp;/g, replacement: "" },
    { pattern: /nbsp;/g, replacement: "" },
    { pattern: /;nbsp/g, replacement: "" },
  ];
  onSubmit(action: any) {
    this.isSubmitClicked = true
    if (this.validForm(action)) {
      this.profileRequestorService.disableButtons = true;
      this.profileRequestorService.isSubmitting[action] = true;
      this.replacements.forEach(({ pattern, replacement }) => {
        this.StateMachineService.dataModel = this.StateMachineService.dataModel.replace(pattern, replacement);
      });
      console.log('dataModel', this.StateMachineService.dataModel);
      this.section.body.details.requestDetails = encodeURIComponent(this.StateMachineService.dataModel);
      delete this.section.body.details.searchEmployee;
      let tempApproverList = JSON.parse(JSON.stringify(this.section.body.details.approverList));
      let i = 1;
      tempApproverList.forEach((item: any, i: number) => {
        if (!isNaN(item?.role)) {
          item.role = (i).toString();
          i++;
        }
        if (item?.index == '-1') {
          tempApproverList.splice(i, 1);
        }
      });
      this.section.body.details.approverList = tempApproverList;
      const obj = {
        function: 'onSubmit',
        action: action,
        data: this.section
      };
      this._listenerService.filter(obj);
    }
    else {
      window.scrollTo(0, 0);
    }
  }

  resetForm() {
    const obj = {
      function: 'resetForm'
    };
    this.approverList = JSON.parse(JSON.stringify(this.originalApproverList));
    this.dataModel = null;
    this.StateMachineService.dataModel = null;
    this._listenerService.filter(obj);
    this.approverList = JSON.parse(JSON.stringify(this.originalApproverList));
    console.log("approverList", this.approverList);
    this.StateMachineService.ressetedApproverList$.next(this.approverList)
    this.section.body.details.approverList = this.approverList
  }

  // canEditForm: boolean = false;
  //
  // editForm() {
  //   this.canEditForm = !this.canEditForm;
  // }

  editService() {
    // serviceBrief should be [{title:"" , content:""}]
    this.sidenavService.data = {
      form: this.form,
      lov: this.lov,
      isReadOnly: this.isReadOnly,
      section: this.section,
      fromSideNav: true,
      approverList: this.approverList,
      dataModel: this.dataModel
    };
    this.coreStateMachine.canEditForm = true
    this.sidenavService.publish('open', EditRequestDetailsComponent);
  }

  toggleTabContent(): void {
    this.isOpen = !this.isOpen;
    this.isButtonOpen = !this.isButtonOpen;
  }

  protected readonly isNaN = isNaN;
}

