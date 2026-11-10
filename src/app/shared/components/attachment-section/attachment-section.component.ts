import { DeleteDialogComponent } from '@ui-workspace/shared';
import { BaseComponent } from '../../../../../../../libs/shared/src/lib/components/shared-components/form-field/base-component/base-component.component';
/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/component-selector */
import { Component, ElementRef, Inject, Input, ViewChild } from '@angular/core';
import { CustomAttachmentSectionDataComponent } from '../add-attachment-section/add-attachment-section.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import * as Constants from '@ui-workspace/shared';
import { SegmentDynamicLoaderService } from '../../services/segment-dynamic-loader.service';

@Component({
  selector: 'meo-attachment-section',
  templateUrl: './attachment-section.component.html',
  styleUrls: ['./attachment-section.component.scss']
})
export class CustomAttachmentSectionComponent extends BaseComponent {
  @Input() className = 'info-section';
  @Input() attachments = [];
  @Input() label = '';
  @Input() attachmentsMax = 1000;
  @Input() isSortable = false;
  @Input() downloadAll = false;
  popupData: any = {};
  @ViewChild('placeholder') placeholderElement: ElementRef;
  @Inject(SegmentDynamicLoaderService) 
    private segmentDynamicLoaderService!: SegmentDynamicLoaderService;
 



  ngOnInit(): void {
    this.coreStateMachineService._emitAfterCloseDialog.subscribe(res => {
      if (res != 'close') {
        if (res?.attachmentId) {
          this.attachments.push(res);
          this.emitedValue.emit(this.attachments);
        }
      }
    })
    this.resetPropagator.subscribe(this, this.resetAttachmentData);
    if (this.attachments) {
      this.attachments.forEach(element => {
        element.name = element.fileName;
      });
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.attachments, event.previousIndex, event.currentIndex);
  }


  resetAttachmentData() {
    if (!this.isReadOnly) {
      this.attachments = [];
      this.emitedValue.emit(this.attachments);
      // if (this.multiple) {

      // } else {
      //   const emptyObj = {
      //     mimeType: "",
      //     fileContents: "",
      //     fileName: "",
      //   }
      //   this.emitedValue.emit(emptyObj)
      //   this.emitedValue.emit(this.attachments)
      // }
    }
  }

  handleEmitValue(data: any, fieldName: string) {
    this.popupData[fieldName] = data;
  }

  addAttahment(): void {
    this.coreStateMachineService.attachmentListData = null;
    const dialogRef = this.dialog.open(CustomAttachmentSectionDataComponent, {
      panelClass: ['main-popup', 'add-attachment-dialog'],
      data: {
        data: this.allowedExtensions,
        isRequired: this.isRequired,
        multiple: this.multiple,
        attachments: this.attachments
      }
    });
    dialogRef.afterClosed().subscribe((resultData) => {
      if (resultData != 'close') {
        if (resultData?.attachmentId) {
          this.attachments.push(resultData);
          this.emitedValue.emit(this.attachments);
        }
      }
    });
  }

  deleteAttachments(index: number, item: any) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      panelClass: ['main-popup', 'add-attachment-dialog']
    });
    dialogRef.afterClosed().subscribe((resultData) => {
      if (resultData == 'yes') {
        this.deleteAttachment(index, item);
      }
    });
  }

  deleteAttachment(index: number, item: any) {
    this.attachments = this.attachments.filter((row: any) => {
      return row.attachmentId != item.attachmentId;
    });
    this.emitedValue.emit(this.attachments);
  }

  editRow(rowData, index): void {
    this.coreStateMachineService.attachmentListData = Object.assign(rowData);
    const dialogRef = this.dialog.open(CustomAttachmentSectionDataComponent, {
      panelClass: ['main-popup', 'add-attachment-dialog'],
      data: {
        data: this.allowedExtensions,
        isRequired: this.isRequired,
        multiple: this.multiple,
        attachments: this.attachments
      }
    });
    dialogRef.afterClosed().subscribe((resultData) => {
      if (resultData != 'close') {
        if (resultData?.attachmentId) {
          this.attachments[index] = resultData;
          this.emitedValue.emit(this.attachments);
        }
      }
    });
  }

  downloadAllAttachments(event) {
    this.attachments.forEach((file) => {
      this.downloadFile(event, file);
    });
  }

  /*downloadFile(event, field) {
    const placeholder = event.target.nextElementSibling;
    this.coreStateMachineService.dispatch(Constants.STATE_MACHINE_ACTION_LOAD_FILE, field.attachmentId).then((responseObject) => {
      const fileInformation = responseObject.body;
      const fileBlob = this.dataURItoBlob(fileInformation.fileContents);
      const file = new File([fileBlob], fileInformation.fileName, { type: fileInformation.mimeType });
      placeholder.href = URL.createObjectURL(file);
      placeholder.download = file.name;
      placeholder.click();
    });
  }*/

  downloadFile(event, field) {
  this.coreStateMachineService.dispatch(Constants.STATE_MACHINE_ACTION_LOAD_FILE, field.attachmentId).then((responseObject) => {
    const fileInformation = responseObject.body;
    const fileBlob = this.dataURItoBlob(fileInformation.fileContents);
    const file = new File([fileBlob], fileInformation.fileName, { type: fileInformation.mimeType });
    this.placeholderElement.nativeElement.href = URL.createObjectURL(file);
    this.placeholderElement.nativeElement.download = file.name;
    this.placeholderElement.nativeElement.click();
  });
}

  dataURItoBlob(dataURI: any) {
    const byteString = atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
    return blob;
  }

  protected readonly onmouseleave = onmouseleave;
  protected readonly isNaN = isNaN;
}
