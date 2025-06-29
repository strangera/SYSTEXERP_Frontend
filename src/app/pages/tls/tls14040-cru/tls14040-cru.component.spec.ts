import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tls14040CRUComponent } from './tls14040-cru.component';

describe('Tls14040CRUComponent', () => {
  let component: Tls14040CRUComponent;
  let fixture: ComponentFixture<Tls14040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tls14040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tls14040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
