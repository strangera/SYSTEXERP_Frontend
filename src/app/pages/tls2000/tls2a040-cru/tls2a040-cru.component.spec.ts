import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2A040CRUComponent } from './tls2a040-cru.component';

describe('TLS2A040CRUComponent', () => {
  let component: TLS2A040CRUComponent;
  let fixture: ComponentFixture<TLS2A040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2A040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2A040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
