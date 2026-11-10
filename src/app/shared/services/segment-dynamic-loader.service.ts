import {Injectable} from '@angular/core';
import {RequestDetailsSectionComponent} from '../../page-components/request-details-section/request-details-section.component';
import segmentDynamicLoaderConfiguration from '../../config/segment-dynamic-loader.config';
import * as Constants from '@ui-workspace/shared';
import {HrRequestDetailsSectionComponent} from '@ui-workspace/shared';
import {I18nService} from './i18n.service';

@Injectable()
export class SegmentDynamicLoaderService {
  requestDetailsSection = RequestDetailsSectionComponent;
  hrRequestDetailsSection = HrRequestDetailsSectionComponent;
  roleToApprovalSectionMapping = segmentDynamicLoaderConfiguration.roleToApprovalSectionMapping;

  constructor(private i18n: I18nService) {

  }

  getComponent(componentId: string) {
    if (componentId.toLowerCase() === Constants.SECTION_ID_REQUEST_DETAILS.toLowerCase()) {
      return this.requestDetailsSection;
    }
    if (componentId.toLowerCase() === 'hrRequestDetails'.toLowerCase()) {
      return this.hrRequestDetailsSection;
    }
    let role = componentId.toLowerCase().split(Constants.SECTION_ID_APPROVAL_PARTIAL_NAME.toLowerCase())[0].toLowerCase();
    return this.roleToApprovalSectionMapping[role];
  }

  getSectionName(componentId: string): string {
    if (componentId.toLowerCase() === Constants.SECTION_ID_REQUEST_DETAILS.toLowerCase()) {
      return this.i18n.translate('requestDetailsTitle');
    } else if (componentId.toLowerCase() === 'hrRequestDetails'.toLowerCase()) {
      return this.i18n.translate('hrRequestDetailsTitle');
    }
    let role = componentId.toLowerCase().split(Constants.SECTION_ID_APPROVAL_PARTIAL_NAME.toLowerCase())[0].toLowerCase();
    return this.i18n.translate(`${role.toLowerCase()}Role`);
  }


  getPrintPartialName(componentName: string) {
    if (componentName === Constants.SECTION_ID_REQUEST_DETAILS) {
      return 'sectionrequestDetails';
    } else if (componentName === 'meo_gceoApproval') { return 'sectiongceoOfficeForm';}
    else {
      return 'sectionmanagerialApprovalsForm';
    }
  }
}
