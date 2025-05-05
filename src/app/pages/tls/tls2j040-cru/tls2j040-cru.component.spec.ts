import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2J040CRUComponent } from './tls2j040-cru.component';

describe('TLS2J040CRUComponent', () => {
  let component: TLS2J040CRUComponent;
  let fixture: ComponentFixture<TLS2J040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2J040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2J040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
