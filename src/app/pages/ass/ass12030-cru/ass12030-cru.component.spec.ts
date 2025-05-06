import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS12030CRUComponent } from './ass12030-cru.component';

describe('ASS12030CRUComponent', () => {
  let component: ASS12030CRUComponent;
  let fixture: ComponentFixture<ASS12030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS12030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS12030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
