import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN14050Component } from './fin14050.component';

describe('FIN14050Component', () => {
  let component: FIN14050Component;
  let fixture: ComponentFixture<FIN14050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN14050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN14050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
