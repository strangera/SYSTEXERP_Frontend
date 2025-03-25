import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN14110Component } from './fin14110.component';

describe('FIN14110Component', () => {
  let component: FIN14110Component;
  let fixture: ComponentFixture<FIN14110Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN14110Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN14110Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
