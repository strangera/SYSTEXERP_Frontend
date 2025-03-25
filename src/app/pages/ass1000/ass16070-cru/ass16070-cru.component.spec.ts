import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS16070CRUComponent } from './ass16070-cru.component';

describe('ASS16070CRUComponent', () => {
  let component: ASS16070CRUComponent;
  let fixture: ComponentFixture<ASS16070CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS16070CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS16070CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
