import { Injectable } from '@angular/core';
import * as coreEn from '../../i18n/en';
import * as coreAr from '../../i18n/ar';
import * as en from '@ui-workspace/localeEn';
import * as ar from '@ui-workspace/localeAr';

@Injectable()
export class I18nService {
  private locales: {[key: string]: {[key: string]: string}};
  private coreLocales: {[key: string]: {[key: string]: string}};
  private language : string;

  constructor() {
    this.language = (window as any).wmConfig.language;
    this.coreLocales = {en: coreEn.default, ar: coreAr.default };
    this.locales = {en: en.default, ar: ar.default};
  }

  translate(key) {
    let result = null;
    try {
      result = this.coreLocales[this.language][key];
      if (!result) {
        result = this.locales[this.language][key];
      }
    }
    catch(e) {
      result = null;
    }
    return result || key;
  }

  getLanguage() {
    return this.language;
  }
}
