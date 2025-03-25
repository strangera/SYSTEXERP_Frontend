import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS16080CRUComponent } from './ass16080-cru.component';

describe('ASS16080CRUComponent', () => {
  let component: ASS16080CRUComponent;
  let fixture: ComponentFixture<ASS16080CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS16080CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS16080CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
