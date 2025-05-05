import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS11040CRUComponent } from './ass11040-cru.component';

describe('ASS11040CRUComponent', () => {
  let component: ASS11040CRUComponent;
  let fixture: ComponentFixture<ASS11040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS11040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS11040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
