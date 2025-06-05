import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN54025Component } from './fin54025.component';

describe('FIN54025Component', () => {
  let component: FIN54025Component;
  let fixture: ComponentFixture<FIN54025Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN54025Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN54025Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
