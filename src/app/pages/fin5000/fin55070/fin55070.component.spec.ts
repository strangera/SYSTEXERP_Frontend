import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN55070Component } from './fin55070.component';

describe('FIN55070Component', () => {
  let component: FIN55070Component;
  let fixture: ComponentFixture<FIN55070Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN55070Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN55070Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
