import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS22040CRUComponent } from './ass22040-cru.component';

describe('ASS22040CRUComponent', () => {
  let component: ASS22040CRUComponent;
  let fixture: ComponentFixture<ASS22040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS22040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS22040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
