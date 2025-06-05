import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS44010CRUComponent } from './tls44010-cru.component';

describe('TLS44010CRUComponent', () => {
  let component: TLS44010CRUComponent;
  let fixture: ComponentFixture<TLS44010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS44010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS44010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
