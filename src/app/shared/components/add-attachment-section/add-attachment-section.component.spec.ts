import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAttachmentSectionComponent } from './add-attachment-section.component';

describe('AddAttachmentSectionComponent', () => {
  let component: AddAttachmentSectionComponent;
  let fixture: ComponentFixture<AddAttachmentSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddAttachmentSectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAttachmentSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
