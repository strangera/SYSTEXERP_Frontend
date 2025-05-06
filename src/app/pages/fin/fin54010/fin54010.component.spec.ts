import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN54010Component } from './fin54010.component';

describe('FIN54010Component', () => {
  let component: FIN54010Component;
  let fixture: ComponentFixture<FIN54010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN54010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN54010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
