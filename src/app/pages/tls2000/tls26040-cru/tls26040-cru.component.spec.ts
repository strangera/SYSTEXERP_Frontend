import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS26040CRUComponent } from './tls26040-cru.component';

describe('TLS26040CRUComponent', () => {
  let component: TLS26040CRUComponent;
  let fixture: ComponentFixture<TLS26040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS26040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS26040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
