import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS22030CRUComponent } from './ass22030-cru.component';

describe('ASS22030CRUComponent', () => {
  let component: ASS22030CRUComponent;
  let fixture: ComponentFixture<ASS22030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS22030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS22030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
