import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN29120Component } from './fin29120.component';

describe('FIN29120Component', () => {
  let component: FIN29120Component;
  let fixture: ComponentFixture<FIN29120Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN29120Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN29120Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
