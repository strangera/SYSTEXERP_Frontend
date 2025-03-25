import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS11020CRUComponent } from './ass11020-cru.component';

describe('ASS11020CRUComponent', () => {
  let component: ASS11020CRUComponent;
  let fixture: ComponentFixture<ASS11020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS11020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS11020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
