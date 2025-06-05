import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2E070CRUComponent } from './tls2e070-cru.component';

describe('TLS2E070CRUComponent', () => {
  let component: TLS2E070CRUComponent;
  let fixture: ComponentFixture<TLS2E070CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2E070CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2E070CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
