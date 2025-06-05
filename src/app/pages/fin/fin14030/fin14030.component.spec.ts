import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN14030Component } from './fin14030.component';

describe('FIN14030Component', () => {
  let component: FIN14030Component;
  let fixture: ComponentFixture<FIN14030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN14030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN14030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
