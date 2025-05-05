import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS16040CRUComponent } from './ass16040-cru.component';

describe('ASS16040CRUComponent', () => {
  let component: ASS16040CRUComponent;
  let fixture: ComponentFixture<ASS16040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS16040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS16040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
