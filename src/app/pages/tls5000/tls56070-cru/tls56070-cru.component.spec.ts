import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS56070CRUComponent } from './tls56070-cru.component';

describe('TLS56070CRUComponent', () => {
  let component: TLS56070CRUComponent;
  let fixture: ComponentFixture<TLS56070CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS56070CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS56070CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
