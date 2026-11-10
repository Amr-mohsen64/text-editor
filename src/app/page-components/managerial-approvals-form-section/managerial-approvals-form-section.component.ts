import { Component, Input } from '@angular/core';
import { Section, Form } from '@ui-workspace/modules';
import * as Constants from '@ui-workspace/shared';
import { I18nService } from '../../shared/services/i18n.service';
import { StateMachineService } from '../../shared/services/state-machine.service';
import { ListenerService, ProfileRequestorService } from '@ui-workspace/services';

@Component({
  selector: 'app-managerial-approvals-form-section',
  templateUrl: './managerial-approvals-form-section.component.html',
  styleUrls: ['./managerial-approvals-form-section.component.scss']
})
export class ManagerialApprovalsFormSectionComponent {

  @Input() isReadOnly: boolean;
  @Input() section: Section;
  @Input() lov: any;
  @Input() className: string = "info-section";



currentSectionId: string;
lastSectionId: string;
form: Form;
constructor(public i18n: I18nService ,
  public profileRequestorService: ProfileRequestorService,
  public StateMachineService : StateMachineService,
  public _listenerService: ListenerService,
) {

}

ngAfterViewInit() {
  this.ServicesSubScriptions();
  this.expandStage();
}

public ServicesSubScriptions() {
  this.profileRequestorService.getForm().subscribe(data => {
    this.form = data;
    this.lastSectionId = this.form.sections[this.form.sections.length - 1].id;
    this.currentSectionId = this.section.id;
  });
}

handleEmitValue( data: any,fieldName: string) {
  this.section.body.details[fieldName] = data;
}



  validForm(action) {
    let returnValue = true;
    const lastSection = this.section.body.details
    let commentValid;
    if (lastSection.comment && lastSection.comment.length > 0) {
      if (
        lastSection.comment.length >= 15 &&
        lastSection.comment.length <= 500
      ) {
        commentValid = true;
      } else {
        commentValid = false;
      }
    } else {
      commentValid = true;
    }
    switch (action) {
      case 'SUBMIT':
        // if (lastSectionId == 'requestDetails') {
        //   /* empty */
        // }
        break;

      case 'APPROVE':
          returnValue = true;
        /*if (commentValid) {
          returnValue = true;
        } else {
          returnValue = false;
        }*/
        break;
      case 'REJECT':
        if (lastSection.comment && commentValid) {
          returnValue = true;
        } else {
          returnValue = false;
        }
        break;
      case 'SENDBACK':
        if (lastSection.comment && commentValid) {
          returnValue = true;
        } else {
          returnValue = false;
        }
        break;
      case 'SAVE_CHANGES':
        returnValue = true;
        break;
      case 'CANCEL':
          if (lastSection.comment && commentValid) {
          returnValue = true;
        } else {
          returnValue = false;
        }
        break;
      case 'SENDTODO':
        returnValue = false;

        break;
    }
    return returnValue;
  }

  onSubmit(action: any) {
    if (this.validForm(action)) {
      this.profileRequestorService.disableButtons = true;
      this.profileRequestorService.isSubmitting[action] = true;
  //     this.section.body.details.requestDetails = this.form.sections[0].body.details.requestDetails;
  //     this.section.body.details.attachments = this.form.sections[0].body.details.attachments
  //     this.section.body.details.requestTitle = this.form.sections[0].body.details.requestTitle
  //     this.section.body.details.typeOfRequest = this.form.sections[0].body.details.typeOfRequest
  //     this.section.body.details.otherRequestType = this.form.sections[0].body.details.otherRequestType
  //     this.section.body.details.requestStatus = this.form.sections[0].body.details.requestStatus

      const obj = {
        function: 'onSubmit',
        action:action,
        data:this.section
      };
      this._listenerService.filter(obj);
    }
  }

  resetForm() {
    const obj = {
      function: 'resetForm'
    };
    this._listenerService.filter(obj);
  }

  private expandStage(){
    if(!this.isReadOnly || (this.isReadOnly && this.section.body?.details?.comment)) this.section.body.details.expandStage = 'true';
  }
}
