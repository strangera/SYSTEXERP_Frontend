import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS13040CRUComponent } from './ass13040-cru.component';

describe('ASS13040CRUComponent', () => {
  let component: ASS13040CRUComponent;
  let fixture: ComponentFixture<ASS13040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS13040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS13040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
