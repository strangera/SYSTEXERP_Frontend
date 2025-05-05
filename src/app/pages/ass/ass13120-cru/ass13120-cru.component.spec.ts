import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS13120CRUComponent } from './ass13120-cru.component';

describe('ASS13120CRUComponent', () => {
  let component: ASS13120CRUComponent;
  let fixture: ComponentFixture<ASS13120CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS13120CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS13120CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
