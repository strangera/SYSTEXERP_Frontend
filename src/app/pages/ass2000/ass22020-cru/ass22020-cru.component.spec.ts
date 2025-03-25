import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS22020CRUComponent } from './ass22020-cru.component';

describe('ASS22020CRUComponent', () => {
  let component: ASS22020CRUComponent;
  let fixture: ComponentFixture<ASS22020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS22020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS22020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
