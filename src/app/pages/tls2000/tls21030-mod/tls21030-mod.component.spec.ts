import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tls21030ModComponent } from './tls21030-mod.component';

describe('Tls21030ModComponent', () => {
  let component: Tls21030ModComponent;
  let fixture: ComponentFixture<Tls21030ModComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tls21030ModComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tls21030ModComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
