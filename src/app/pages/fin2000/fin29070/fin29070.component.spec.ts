import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN29070Component } from './fin29070.component';

describe('FIN29070Component', () => {
  let component: FIN29070Component;
  let fixture: ComponentFixture<FIN29070Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN29070Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN29070Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
