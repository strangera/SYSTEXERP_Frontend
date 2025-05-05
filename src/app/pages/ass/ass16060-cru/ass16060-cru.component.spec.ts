import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS16060CRUComponent } from './ass16060-cru.component';

describe('ASS16060CRUComponent', () => {
  let component: ASS16060CRUComponent;
  let fixture: ComponentFixture<ASS16060CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS16060CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS16060CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
