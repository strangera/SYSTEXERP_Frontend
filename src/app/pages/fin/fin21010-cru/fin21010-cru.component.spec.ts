import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN21010CRUComponent } from './fin21010-cru.component';

describe('FIN21010CRUComponent', () => {
  let component: FIN21010CRUComponent;
  let fixture: ComponentFixture<FIN21010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN21010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN21010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
