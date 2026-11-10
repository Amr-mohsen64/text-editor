import { ChangeDetectorRef, Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { I18nService, StateMachineService } from '../../../shared';
import { SidenavService } from '@ui-workspace/services';

@Component({
  selector: 'ui-workspace-cancel-edit',
  templateUrl: './cancel-edit.component.html',
  styleUrls: ['./cancel-edit.component.scss'],
})
export class CancelEditComponent {
  
  language: any;
  dialogData: any;

  constructor(
    public stateMachineService: StateMachineService,
    public i18n: I18nService,
    public cdRef: ChangeDetectorRef,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<any>,
    private sidenavService: SidenavService
  ) {}

  confirm(): void {
    this.dialogRef.close({
      confirmed: true,
      content: null,
    });
    this.sidenavService.publish('close', null);
  }

  close(): void {
    this.dialogRef.close({
      confirmed: false,
      content: null,
    });
  }
}
