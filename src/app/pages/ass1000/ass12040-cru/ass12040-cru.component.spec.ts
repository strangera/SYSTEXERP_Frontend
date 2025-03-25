import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS12040CRUComponent } from './ass12040-cru.component';

describe('ASS12040CRUComponent', () => {
  let component: ASS12040CRUComponent;
  let fixture: ComponentFixture<ASS12040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS12040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS12040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
