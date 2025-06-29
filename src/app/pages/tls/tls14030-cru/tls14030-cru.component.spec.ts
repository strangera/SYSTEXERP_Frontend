import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tls14030CRUComponent } from './tls14030-cru.component';

describe('Tls14030CRUComponent', () => {
  let component: Tls14030CRUComponent;
  let fixture: ComponentFixture<Tls14030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tls14030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tls14030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
