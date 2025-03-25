import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS13060CRUComponent } from './ass13060-cru.component';

describe('ASS13060CRUComponent', () => {
  let component: ASS13060CRUComponent;
  let fixture: ComponentFixture<ASS13060CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS13060CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS13060CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
