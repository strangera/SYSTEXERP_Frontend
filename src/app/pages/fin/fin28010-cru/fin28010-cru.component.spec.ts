import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN28010CRUComponent } from './fin28010-cru.component';

describe('FIN28010CRUComponent', () => {
  let component: FIN28010CRUComponent;
  let fixture: ComponentFixture<FIN28010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN28010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN28010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
