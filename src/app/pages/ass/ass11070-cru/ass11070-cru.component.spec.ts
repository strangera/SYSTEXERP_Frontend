import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS11070CRUComponent } from './ass11070-cru.component';

describe('ASS11070CRUComponent', () => {
  let component: ASS11070CRUComponent;
  let fixture: ComponentFixture<ASS11070CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS11070CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS11070CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
