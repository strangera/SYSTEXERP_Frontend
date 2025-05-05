import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS27040CRUComponent } from './tls27040-cru.component';

describe('TLS27040CRUComponent', () => {
  let component: TLS27040CRUComponent;
  let fixture: ComponentFixture<TLS27040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS27040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS27040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
