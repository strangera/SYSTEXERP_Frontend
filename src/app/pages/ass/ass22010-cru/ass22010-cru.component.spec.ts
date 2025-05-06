import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS22010CRUComponent } from './ass22010-cru.component';

describe('ASS22010CRUComponent', () => {
  let component: ASS22010CRUComponent;
  let fixture: ComponentFixture<ASS22010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS22010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS22010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
