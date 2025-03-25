import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2J010CRUComponent } from './tls2j010-cru.component';

describe('TLS2J010CRUComponent', () => {
  let component: TLS2J010CRUComponent;
  let fixture: ComponentFixture<TLS2J010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2J010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2J010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
