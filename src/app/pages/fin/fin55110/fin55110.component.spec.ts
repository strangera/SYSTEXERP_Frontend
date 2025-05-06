import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN55110Component } from './fin55110.component';

describe('FIN55110Component', () => {
  let component: FIN55110Component;
  let fixture: ComponentFixture<FIN55110Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN55110Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN55110Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
