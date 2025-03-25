import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS21060CRUComponent } from './ass21060-cru.component';

describe('ASS21060CRUComponent', () => {
  let component: ASS21060CRUComponent;
  let fixture: ComponentFixture<ASS21060CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS21060CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS21060CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
