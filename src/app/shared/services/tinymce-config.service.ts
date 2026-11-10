import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TinyMceConfigService {

  getConfig(componentInstance: any) {
    return {
      branding: false,
      plugins:
        'lists link image table code paste print preview authorise powerpaste spellchecker directionality pagebreak fullscreen',

      resize: true,
      elementpath: false,
      wordcount: false,
      menubar: false,
      fullscreen_native: true,
      toolbar_mode: 'sliding',
      browser_spellcheck: true,
      spellchecker_dialog: true,
      spellchecker_languages: 'en',
      contextmenu: false,
      height: '500px',
      width: '100%',
      autoresize_bottom_margin: 20,
      autoresize_overflow_padding: 10,
      autoresize_min_height: 600,
      autoresize_max_height: 842,

      paste_auto_cleanup_on_paste: true,
      paste_data_images: true,

      content_langs: [
        { title: 'English', code: 'en' },
        { title: 'Arabic', code: 'ar' },
      ],

      content_style: `
        body {
          max-width: 100% !important;
          overflow-x: hidden !important;
          word-break: break-word !important;
        }
        img, table, iframe, div, section, article {
          max-width: 100% !important;
          width: 100% !important;
          box-sizing: border-box;
          height: 100% !important;
          max-height: 100% !important;
          table-layout: fixed;
          word-wrap: break-word;
        }
        @font-face {
          font-family: "STC Forward";
        }
        * { max-width: 100% !important; }
      `,

      paste_preprocess: (plugin, args) => {
        args.content = args.content
          .replace(/ style="[^"]*"/gi, '')
          .replace(/width:\s?\d+px/gi, '')
          .replace(/max-width:\s?\d+px/gi, '')
          .replace(/height:\s?\d+px/gi, '')
          .replace(/max-height:\s?\d+px/gi, '')
          .replace(/<style[\s\S]*?<\/style>/gi, '');

        if (componentInstance.cleanPastedContent) {
          args.content = componentInstance.cleanPastedContent(args.content);
        }
      },

      powerpaste_word_import: 'merge',
      powerpaste_html_import: 'merge',

      toolbar: `
        undo redo | fontsize fontfamily forecolor backcolor bold italic underline |
        ltr rtl alignleft aligncenter alignright alignjustify outdent indent lineheight |
        bullist numlist | table | styles |
        tablecaption tablemergecells tablesplitcells tablecellvalign tablecellbackgroundcolor
        tablecellbordercolor tablecellborderstyle tabledeleterow tabledeletecol
        tabledelete spellcheckdialog pagebreak fullscreen
      `,

      font_family_formats: `
        STC Forward=STC Forward, sans-serif;
        Andale Mono=andale mono,times;
        Arial=arial,helvetica,sans-serif;
        Arial Black=arial black,avant garde;
        Book Antiqua=book antiqua,palatino;
        Comic Sans MS=comic sans ms,sans-serif;
        Courier New=courier new,courier;
        Georgia=georgia,palatino;
        Helvetica=helvetica;
        Impact=impact,chicago;
        Symbol=symbol;
        Tahoma=tahoma,arial,helvetica,sans-serif;
        Terminal=terminal,monaco;
        Times New Roman=times new roman,times;
        Trebuchet MS=trebuchet ms,geneva;
        Verdana=verdana,geneva;
        Webdings=webdings;
        Wingdings=wingdings,zapf dingbats;
      `,

      setup: (editor) => {
        editor.on('init', () => {
          if (componentInstance.i18n.getLanguage() === 'ar') {
            editor.formatter.apply('alignright');
          } else {
            editor.formatter.apply('alignleft');
          }

          if (componentInstance.ensureDirWrapper) {
            componentInstance.ensureDirWrapper(editor);
          }
        });

        editor.on('input', () => {
          if (componentInstance.ensureDirWrapper) {
            componentInstance.ensureDirWrapper(editor);
          }
        });

        editor.on('SetContent', () => {
          if (componentInstance.ensureDirWrapper) {
            componentInstance.ensureDirWrapper(editor);
          }
        });
      }
    };
  }
}
