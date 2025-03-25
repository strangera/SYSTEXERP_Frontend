import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN15010CRUComponent } from './fin15010-cru.component';

describe('FIN15010CRUComponent', () => {
  let component: FIN15010CRUComponent;
  let fixture: ComponentFixture<FIN15010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN15010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN15010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
