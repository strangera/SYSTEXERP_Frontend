import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN14070Component } from './fin14070.component';

describe('FIN14070Component', () => {
  let component: FIN14070Component;
  let fixture: ComponentFixture<FIN14070Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN14070Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN14070Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
