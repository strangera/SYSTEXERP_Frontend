import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS14020CRUComponent } from './ass14020-cru.component';

describe('ASS14020CRUComponent', () => {
  let component: ASS14020CRUComponent;
  let fixture: ComponentFixture<ASS14020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS14020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS14020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
