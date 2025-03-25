import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS11060CRUComponent } from './ass11060-cru.component';

describe('ASS11060CRUComponent', () => {
  let component: ASS11060CRUComponent;
  let fixture: ComponentFixture<ASS11060CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS11060CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS11060CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
