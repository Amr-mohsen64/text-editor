import {Component, Inject, OnInit} from '@angular/core';
import {CoreStateMachineService} from '../../../../../../../libs/shared/src/lib/services/core-state-machine.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {I18nService} from '../../../shared';
import {Router} from '@angular/router';

@Component({
  selector: 'ui-workspace-terms-conditions',
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.scss'],
})
export class TermsConditionsComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<TermsConditionsComponent>,
    public i18n: I18nService,
    public coreStateMachineService: CoreStateMachineService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router
  ) {
   /* this.dialogRef.backdropClick().subscribe(() => {
      window.open(location.origin, '_self');
    });*/
  }

  ngOnInit(): void {}

  close() {
    window.open(location.origin, '_self');
  }

  agree() {
    this.dialogRef.close();
  }
}
