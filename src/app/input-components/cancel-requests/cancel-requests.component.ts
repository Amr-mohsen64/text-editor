import { ChangeDetectorRef, Component, Inject, Input } from '@angular/core';
import { ProfileRequestorService } from '@ui-workspace/services';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Form, Messages, Section } from '@ui-workspace/modules';
import { I18nService, StateMachineService } from '../../shared';
import * as Constants from '@ui-workspace/shared';
import loadFormHooks from '@ui-workspace/loadHooks';

@Component({
  selector: 'cancel-requests',
  templateUrl: './cancel-requests.component.html',
  styleUrls: ['./cancel-requests.component.scss']
})
export class CancelRequestsComponent {

  @Input() section: Section;
  @Input() lov: any;
  @Input() data: any;
  @Input() form: any;
  comments: string;
  attachments: any[] = [];

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
    this.data = dialogData.data.data;
  }

  close() {
    this.dialogRef.close();
  }

  handleEmitValue(data: any, fieldName: string) {
    if (fieldName == 'rowcomment') {
      this.comments = data;
    } else {
      this.section.body.details[fieldName] = data;
    }
  }

  validcreateSubRequest() {
    return !!(this.comments);
  }

  errorMessages: any[] = [];

  createSubRequest() {
    this.errorMessages = [];
    this.profileRequestorService.appFullLoader = true;
    this.profileRequestorService.isSubmitting['ask'] = true;
    this.StateMachineService.dispatch('cancelSubManual', {
      formId: this.data?.formId,
      comment: this.comments,
      language: this.i18n.getLanguage(),
      action: 'CANCEL'
    })
      .then((Response: Messages) => {
        if (Response) {
          if (Response instanceof Messages) {
            this.profileRequestorService.isSubmitting['ask'] = false;
            this.profileRequestorService.appFullLoader = false;
            this.errorResponse(Response);
          } else {
            window.location.reload();
          }
        }
      });


    /* this.errorMessages = [];
     this.profileRequestorService.appFullLoader = true;
     this.profileRequestorService.isSubmitting['ask'] = true;
     this.StateMachineService.dispatch('createSubRequest', {
       comment: this.comments,
       email: this.section.body.details.employeeReview.personEmail,
       attachments: this.attachments
     })
       .then((Response: Messages) => {

         if (Response) {
           if (Response instanceof Messages) {
             this.profileRequestorService.isSubmitting['ask'] = false;
             this.profileRequestorService.appFullLoader = false;
             this.errorMessages = Response?.error;
             setTimeout(() => {
               this.errorMessages = [];
             }, 5000);
             // this.errorResponse(Response);
           } else {
             window.location.reload();
           }
         }
       });*/
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

}
