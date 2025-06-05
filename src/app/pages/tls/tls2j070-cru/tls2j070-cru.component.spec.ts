import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2J070CRUComponent } from './tls2j070-cru.component';

describe('TLS2J070CRUComponent', () => {
  let component: TLS2J070CRUComponent;
  let fixture: ComponentFixture<TLS2J070CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2J070CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2J070CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
