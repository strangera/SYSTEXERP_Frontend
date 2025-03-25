import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS16010CRUComponent } from './ass16010-cru.component';

describe('ASS16010CRUComponent', () => {
  let component: ASS16010CRUComponent;
  let fixture: ComponentFixture<ASS16010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS16010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS16010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
