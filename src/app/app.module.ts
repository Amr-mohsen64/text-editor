import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { AppComponent } from './app.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { DynamicModule } from 'ng-dynamic-component';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  CoreI18nService,
  CoreStateMachineService,
  ListenerService,
  ProfileRequestorService,
  ResetPropagationService,
} from '@ui-workspace/services';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  AppComponentModule,
  SharedComponentModule,
  SharedUiModule,
} from '@ui-workspace/shared';
import { PrintSectionComponent } from './input-components';
import { MatSidenavModule } from '@angular/material/sidenav';
import {
  I18nService,
  SegmentDynamicLoaderService,
  StateMachineService,
} from './shared';

import { RequestDetailsSectionComponent } from './page-components/request-details-section/request-details-section.component';
import { ManagerialApprovalsFormSectionComponent } from './page-components/managerial-approvals-form-section/managerial-approvals-form-section.component';
import { GceoOfficeFormSectionComponent } from './page-components/gceo-office-form-section/gceo-office-form-section.component';
import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { environment } from '../environments/environment';
import { CommonModule } from '@angular/common';
import { SatPopoverModule } from '@ncstate/sat-popover';
import { TermsConditionsComponent } from './page-components/request-details-section/terms-conditions/terms-conditions.component';
import { CustomAttachmentSectionDataComponent } from './shared/components/add-attachment-section/add-attachment-section.component';
import { CustomAttachmentSectionComponent } from './shared/components/attachment-section/attachment-section.component';
import { ReviewRequestsComponent } from './input-components/review requests/review-requests.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { ImageViewerModule } from 'ngx-image-viewer';

import {
  MAT_RIPPLE_GLOBAL_OPTIONS,
  RippleGlobalOptions,
} from '@angular/material/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { EditRequestDetailsComponent } from './page-components/request-details-section/editable-request-details/editable-request-details.component';
import { CancelRequestsComponent } from './input-components/cancel-requests/cancel-requests.component';
import { ContinueComponent } from './page-components/gceo-office-form-section/continue/continue.component';
import { RestoreComponent } from './page-components/request-details-section/restore/restore.component';
import { CancelEditComponent } from './page-components/request-details-section/cancel-edit/cancel-edit.component';

const globalRippleConfig: RippleGlobalOptions = {
  disabled: true,
  animation: {
    enterDuration: 300,
    exitDuration: 0,
  },
};

@NgModule({
  declarations: [
    AppComponent,
    PrintSectionComponent,
    EditRequestDetailsComponent,
    RequestDetailsSectionComponent,
    ManagerialApprovalsFormSectionComponent,
    GceoOfficeFormSectionComponent,
    TermsConditionsComponent,
    CustomAttachmentSectionComponent,
    CustomAttachmentSectionDataComponent,
    ReviewRequestsComponent,
    CancelRequestsComponent,
    ContinueComponent,
    RestoreComponent,
    CancelEditComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    SharedUiModule,
    DynamicModule,
    BrowserModule,
    HttpClientModule,
    MatDialogModule,
    MatSidenavModule,
    AppComponentModule,
    SharedComponentModule,
    ImageViewerModule,
    DragDropModule,
    ToastrModule.forRoot({
      timeOut: 10000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
    NgSelectModule,
    BrowserAnimationsModule,
    // RichTextEditorAllModule,
    EditorModule,
    SatPopoverModule,
    NgxExtendedPdfViewerModule,
    CdkAccordionModule,
  ],
  entryComponents: [
    // HrRequestDetailsSectionComponent,
    RequestDetailsSectionComponent,
    EditRequestDetailsComponent,
  ],
  providers: [
    SegmentDynamicLoaderService,
    StateMachineService,
    CoreStateMachineService,
    I18nService,
    CoreI18nService,
    ListenerService,
    ResetPropagationService,
    ProfileRequestorService,
    { provide: MAT_RIPPLE_GLOBAL_OPTIONS, useValue: globalRippleConfig },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    {
      provide: MatDialogRef,
      useValue: {},
    },
    {
      provide: TINYMCE_SCRIPT_SRC,
      useValue: environment.production
        ? '/newigate/group/i-gate/angular/gar-new/assets/tinymce/tinymce.js'
        : '/assets/tinymce/tinymce.js',
    },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule {}
