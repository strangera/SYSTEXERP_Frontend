import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS25010CRUComponent } from './tls25010-cru.component';

describe('TLS25010CRUComponent', () => {
  let component: TLS25010CRUComponent;
  let fixture: ComponentFixture<TLS25010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS25010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS25010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
