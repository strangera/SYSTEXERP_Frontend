import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS25010ModComponent } from './tls25010-mod.component';

describe('TLS25010ModComponent', () => {
  let component: TLS25010ModComponent;
  let fixture: ComponentFixture<TLS25010ModComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS25010ModComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS25010ModComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
