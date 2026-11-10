import { ChangeDetectorRef, Component, Inject, Input } from '@angular/core';
import { ProfileRequestorService } from '@ui-workspace/services';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Form, Messages, Section } from '@ui-workspace/modules';
import { I18nService, StateMachineService } from '../../../shared';
import * as Constants from '@ui-workspace/shared';
import loadFormHooks from '@ui-workspace/loadHooks';

@Component({
  selector: 'continue',
  templateUrl: './continue.component.html',
  styleUrls: ['./continue.component.scss']
})
export class ContinueComponent {

  @Input() section: Section;
  @Input() lov: any;
  @Input() form: any;
  comments: string;
  actionKey: any;
  actionName: any;
  attachments: any[] = [];
  language: any;
  constructor(
    public profileRequestorService: ProfileRequestorService,
    public StateMachineService: StateMachineService,
    public i18n: I18nService,
    public cdRef: ChangeDetectorRef,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any
  ) {
    this.form = dialogData.data.form;
    this.section = dialogData.data.section;
    this.lov = dialogData.data.lov;
    this.actionKey = dialogData.data.actionKey;
    this.actionName = dialogData.data.actionName;   
    this.language = this.i18n.getLanguage()
  }



  confirm(): void {
    this.dialogRef.close({
      confirmed: true,
      content: null,
    });
  }

  close(): void {
    this.dialogRef.close({
      confirmed: false,
      content: null,
    });
  }




}
