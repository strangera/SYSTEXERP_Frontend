import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS56030CRUComponent } from './tls56030-cru.component';

describe('TLS56030CRUComponent', () => {
  let component: TLS56030CRUComponent;
  let fixture: ComponentFixture<TLS56030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS56030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS56030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
