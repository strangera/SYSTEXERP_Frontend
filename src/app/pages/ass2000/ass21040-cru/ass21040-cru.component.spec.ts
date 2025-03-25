import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS21040CRUComponent } from './ass21040-cru.component';

describe('ASS21040CRUComponent', () => {
  let component: ASS21040CRUComponent;
  let fixture: ComponentFixture<ASS21040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS21040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS21040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
