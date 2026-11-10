import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditableRequestDetailsComponent } from './editable-request-details.component';

describe('EditableRequestDetailsComponent', () => {
  let component: EditableRequestDetailsComponent;
  let fixture: ComponentFixture<EditableRequestDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditableRequestDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditableRequestDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
