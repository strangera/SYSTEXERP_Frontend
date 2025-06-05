import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS11100CRUComponent } from './ass11100-cru.component';

describe('ASS11100CRUComponent', () => {
  let component: ASS11100CRUComponent;
  let fixture: ComponentFixture<ASS11100CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS11100CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS11100CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
