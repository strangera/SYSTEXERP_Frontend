import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS56080CRUComponent } from './tls56080-cru.component';

describe('TLS56080CRUComponent', () => {
  let component: TLS56080CRUComponent;
  let fixture: ComponentFixture<TLS56080CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS56080CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS56080CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
