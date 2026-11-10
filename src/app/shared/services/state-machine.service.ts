import { CoreStateMachineService } from '@ui-workspace/services';
import { environment } from './../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Messages } from '@ui-workspace/modules';
import * as Constants from '@ui-workspace/shared';
import { Subject } from 'rxjs';

@Injectable()
export class StateMachineService {
  private currentSubmitter: any;
  feedbackForm: boolean = false;
  private formName: string;
  private serviceName!: string;
  private refreshToken: string;
  pendingForm: boolean = false;
  responderForm: boolean = false;
  feedBackSent: boolean = false;
  isEmpty: boolean = false;
  contentLength: number = 0
  isApprovalLoading: boolean = false;
  public ressetedApproverList$ = new Subject<any[]>()
  //public approvalLoader$ = new Subject<any[]>()
  dataModel: any;
  reviewDataModel: any;

  feedbackReponse: any = {
    requestFrom: null,
    requestTo: null,
    requestFeedback: null,
    responseFeedback: null
  };
  private transitions: { [key: string]: { [key: string]: Function } };
  private state: string;
  private authToken: string;
  private formId: string;
  public isReadOnly: string;
  public inboxUrl: string;
  private isMobile: boolean;
  private requesterEmail!: string;
  private authorizedEmail!: string;
  base64PDF: any;

  constructor(private http: HttpClient, private coreStateMachineService: CoreStateMachineService) {
    this.isMobile = (window as any).wmConfig.isMobile;
    this.state = Constants.STATE_MACHINE_STATUS_IDLE;
    this.currentSubmitter = null;
    this.authToken = '';
    this.refreshToken = '';
    this.formId = (window as any).wmConfig.formId;
    this.formName = (window as any).wmConfig.formPrefix;
    if (this.formName.includes('-new')) {
      const myArray = this.formName.split('-');
      this.formName = myArray['0'];
    }
    this.inboxUrl = (window as any).wmConfig.inboxUri;
    console.log('inboxUrl', this.inboxUrl);
    console.log('inboxUrl', location.host + this.inboxUrl);

    /* istanbul ignore next  */
    this.transitions = {
      idle: {
        remindSubRequestApprover: function (data: any, ...args: any) {
          let body = {
            method: Constants.HTTP_METHOD_POST, //GET - PUT - POST
            destination: Constants.TARGET_SERVER_WM,
            serviceName: 'remindSubRequestApprover', //,
            formName: this.formName,
            queryParameters: {
              formId: data.formId,
              currentApprover: this.coreStateMachineService.loggedInUserId(),
              language: (window as any).wmConfig.language,
              mailBody: data.content,

            }
          };
          let options = this.getRequestOptions();
          let succ = 'serviceResponce';
          return this.callPost(body, succ, options);
        },

        restoreRequestDetails: function () {
          let body = {
            method: Constants.HTTP_METHOD_POST, //GET - PUT - POST
            destination: Constants.TARGET_SERVER_WM,
            serviceName: 'restoreRequestDetails', //,
            formName: this.formName,
            queryParameters: {
              email: this.coreStateMachineService.loggedInUserId(),
              formId: this.formId,
              stageName: this.coreStateMachineService.stageName,
            }
          };
          let options = this.getRequestOptions();
          let succ = 'serviceResponce';
          return this.callPost(body, succ, options);
        },
        checkApprover: function (approverEmail: string, ...args: any) {
          let body = {
            method: Constants.HTTP_METHOD_GET, //GET - PUT - POST
            destination: Constants.TARGET_SERVER_WM,
            serviceName: 'checkApprover', //,
            formName: this.formName,
            queryParameters: {
              approverEmail: approverEmail
            }
          };
          let options = this.getRequestOptions();
          let succ = 'serviceResponce';
          return this.callPost(body, succ, options);
        },
        printRequestDetails: function (data: any, ...args: any) {
          console.log(data);

          let body = {
            method: Constants.HTTP_METHOD_GET, //GET - PUT - POST
            destination: Constants.TARGET_SERVER_WM,
            serviceName: 'printRequestDetails', //,
            formName: this.formName,
            queryParameters: {
              email: data.email,
              language: data.language,
              requestTitle: data.requestTitle,
              requestDetails: data.requestDetails,
              typeOfRequest: data.typeOfRequest,
              otherRequestType: data.otherRequestType,
              requestStatus: data.requestStatus,
            }
          };
          let options = this.getRequestOptions();
          let succ = 'serviceResponce';
          return this.callPost(body, succ, options);
        },
        printFormDetails: function (data: any, ...args: any) {
          console.log(data);

          let body = {
            method: Constants.HTTP_METHOD_GET, //GET - PUT - POST
            destination: Constants.TARGET_SERVER_WM,
            serviceName: 'printFormDetails', //,
            formName: this.formName,
            queryParameters: {
              email: data.email,
              language: data.language,
              comments: data.comments ?? null,
              role: data.role,
              formId:data.formId

            }
          };
          let options = this.getRequestOptions();
          let succ = 'serviceResponce';
          return this.callPost(body, succ, options);
        },
        saveRequestDetails: function (data: any, ...args: any) {
          console.log("DFGGGGGGGGGGGGGG", data)

          let body = {

            method: Constants.HTTP_METHOD_POST, //GET - PUT - POST
            destination: Constants.TARGET_SERVER_WM,
            serviceName: 'saveRequestDetails', //,
            formName: this.formName,
            queryParameters: {
              approverEmail: data.email,
              attachments: data.attachments,
              gceoComment: data.comment,
              formId: this.formId,
              language: (window as any).wmConfig.language
            }
          };
          let options = this.getRequestOptions();
          let succ = 'serviceResponce';
          return this.callPost(body, succ, options);
        },
        createSubRequest: function (data: any, ...args: any) {
          let body = {
            method: Constants.HTTP_METHOD_POST, //GET - PUT - POST
            destination: Constants.TARGET_SERVER_WM,
            serviceName: 'createSubRequest', //,
            formName: this.formName,
            queryParameters: {
              approverEmail: data.email,
              attachments: environment?.production ? data.attachments : null,
              gceoComment: data.comment,
              formId: this.formId,
              language: (window as any).wmConfig.language
            }
          };
          let options = this.getRequestOptions();
          let succ = 'serviceResponce';
          return this.callPost(body, succ, options);
        },
        cancelSubManual: function (data: any, ...args: any) {
          let body = {
            method: Constants.HTTP_METHOD_POST, //GET - PUT - POST
            destination: Constants.TARGET_SERVER_WM,
            serviceName: 'cancelSubManual', //,
            formName: this.formName,
            queryParameters: {
              action: data.action,
              comment: data.comment,
              formId: data.formId,
              language: data.language
            }
          };
          let options = this.getRequestOptions();
          let succ = 'serviceResponce';
          return this.callPost(body, succ, options);
        }
      },
      fetching: {
        serviceResponce: function (...args: any) {
          let [payload] = args;
          let result = payload;
          this.state = Constants.STATE_MACHINE_STATUS_IDLE;
          return result;
        },
        failure: function (...args) {
          let [errors] = args;
          this.state = Constants.STATE_MACHINE_STATUS_ERROR;
          return this.dispatch(Constants.STATE_MACHINE_ACTION_HANDLE_ERROR, errors);
        }
      },
      error: {
        handleError: function (...args) {
          let [errors] = args;
          let result = new Messages(
            {},
            [],
            [],
            []
          );
          if (errors?.meta?.messages) {
            errors.meta.messages.forEach((message) => {
              result[message.type].push(message.message);
              if (message.payloadReference) {
                let payloadReferenceTokens = message.payloadReference.split('/');
                payloadReferenceTokens.slice(1, payloadReferenceTokens.length - 1);
                let element = result.errorFields;
                payloadReferenceTokens.forEach((token) => {
                  element[token] = {};
                  element = element[token];
                });
                element = true;
              }
            });
          } else if (errors?.errors) {
            errors.errors.forEach((message) => {
              result['error'].push(message.message);
            });
          }
          this.state = Constants.STATE_MACHINE_STATUS_IDLE;
          return result;
        }
      },
      sending: {
        failure: function (...args) {
          let [errors] = args;
          this.state = Constants.STATE_MACHINE_STATUS_ERROR;
          return this.dispatch(Constants.STATE_MACHINE_ACTION_HANDLE_ERROR, errors);
        }
      }
    };
  }

  public dispatch(actionName, ...args) {
    const actions = this.transitions[this.state];
    const action = actions[actionName];

    if (action) {
      return action.apply(this, args);
    }
  }

  private getRequestOptions() {
    return {
      headers: new HttpHeaders({
        authToken: this.coreStateMachineService.getSessionToken(),
        'Content-Type': Constants.HEADER_CONTENT_TYPE_FORM
      }),
      observe: 'response'
    };
  }

  public callPost(body, succ, options) {
    let apiUrl = environment.proxyServiceBaseUrl + (window as any).wmConfig.language + environment.proxyFullAddress + environment.proxyServiceExecute;
    return this.http.post(apiUrl, encodeURIComponent(JSON.stringify(body)), options).toPromise()
      .then(
        (responseObject: any) => {
          let payload = responseObject.body;
          this.state = Constants.STATE_MACHINE_STATUS_FETCHING;
          return this.dispatch(succ, payload);
        }
      ).catch(
        (httpError: any) => {
          let responseError = httpError.error;
          if (responseError) {
            this.state = Constants.STATE_MACHINE_STATUS_FETCHING;
            return this.dispatch(Constants.STATE_MACHINE_ACTION_FAILURE, responseError);
          } else {
            this.state = Constants.STATE_MACHINE_STATUS_IDLE;
            throw httpError;
          }
        }
      );
  }
}
