import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tls24010DiscodeComponent } from './tls24010-discode.component';

describe('Tls24010DiscodeComponent', () => {
  let component: Tls24010DiscodeComponent;
  let fixture: ComponentFixture<Tls24010DiscodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tls24010DiscodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tls24010DiscodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
