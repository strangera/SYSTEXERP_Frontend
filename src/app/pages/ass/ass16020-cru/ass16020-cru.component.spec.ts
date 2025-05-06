import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS16020CRUComponent } from './ass16020-cru.component';

describe('ASS16020CRUComponent', () => {
  let component: ASS16020CRUComponent;
  let fixture: ComponentFixture<ASS16020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS16020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS16020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
