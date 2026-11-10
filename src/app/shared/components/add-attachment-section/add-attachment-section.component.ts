/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/component-selector */
import { Component, Inject } from '@angular/core';
import {
  BaseComponent
} from '../../../../../../../libs/shared/src/lib/components/shared-components/form-field/base-component/base-component.component';
import { Subject } from 'rxjs';
import { SegmentDynamicLoaderService } from '../../services/segment-dynamic-loader.service';

@Component({
  selector: 'meo-add-attachment-section',
  templateUrl: './add-attachment-section.component.html',
  styleUrls: ['./add-attachment-section.component.scss']
})
export class CustomAttachmentSectionDataComponent extends BaseComponent {
  popupData: any = {};
  popupDataOrg: any = {};
  uploading: boolean;
  editMode: boolean;

  @Inject(SegmentDynamicLoaderService)
  private segmentDynamicLoaderService!: SegmentDynamicLoaderService;

  ngOnInit() {
    if (this.coreStateMachineService?.attachmentListData) {
      this.popupData = this.coreStateMachineService.attachmentListData;
      this.popupDataOrg = Object.assign({}, this.popupData);   ///// ibrahim solve isse related to discard data whenn click close
      this.editMode = true;
    }
    if (this.dialogData) {
      console.log(this.dialogData);

    }
  }

  close() {
    this.dialogRef.close(this.popupDataOrg);
  }

  handleEmitValue(data: any, fieldName: string) {
    this.popupData[fieldName] = data;
  }

  handleAttachmentEmitValue(data: any) {
    this.popupData = {
      'fileContents': data?.fileContents,
      'fileName': data?.fileName,
      'mimeType': data?.mimeType,
      'fileDescription': this.popupData?.fileDescription,
      'attachmentcomment': this.popupData?.attachmentcomment,
      'fileComments': this.popupData?.attachmentcomment,
      'attachmentId': data?.attachmentId
    };
  }

  addAttachments() {
    const data = {
      'fileDescription': this.popupData?.fileDescription,
      'attachmentcomment': this.popupData?.attachmentcomment,
      'fileComments': this.popupData?.attachmentcomment,
      'fileName': this.popupData?.fileName,
      'mimeType': this.popupData?.mimeType,
      'attachmentId': this.popupData?.attachmentId,
      'fileContents': this.popupData?.fileContents
    };
    this.uploading = true;
    this.coreStateMachineService.dispatch('getAttachments', data)
      .then((Response: any) => {
        this.uploading = false;
        if (Response) {
          this.coreStateMachineService.attachmentListData = null;
          const newObj = {
            'fileDescription': this.popupData?.fileDescription,
            'attachmentcomment': this.popupData?.attachmentcomment,
            'fileComments': this.popupData?.attachmentcomment,
            'fileName': this.popupData?.fileName,
            'attachmentId': Response.attachment.attachmentId,
            'mimeType': this.popupData?.mimeType
          };
          // this.dialogRef.close(newObj);
          this.coreStateMachineService._emitAfterCloseDialog.next(newObj);
          this.popupData = null;
        }
      });
  }

}
