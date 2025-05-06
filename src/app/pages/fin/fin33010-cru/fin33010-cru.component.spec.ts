import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN33010CRUComponent } from './fin33010-cru.component';

describe('FIN33010CRUComponent', () => {
  let component: FIN33010CRUComponent;
  let fixture: ComponentFixture<FIN33010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN33010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN33010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
