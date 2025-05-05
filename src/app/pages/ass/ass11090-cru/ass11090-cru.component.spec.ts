import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS11090CRUComponent } from './ass11090-cru.component';

describe('ASS11090CRUComponent', () => {
  let component: ASS11090CRUComponent;
  let fixture: ComponentFixture<ASS11090CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS11090CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS11090CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
