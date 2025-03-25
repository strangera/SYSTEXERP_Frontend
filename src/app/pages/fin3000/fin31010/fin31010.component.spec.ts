import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN31010Component } from './fin31010.component';

describe('FIN31010Component', () => {
  let component: FIN31010Component;
  let fixture: ComponentFixture<FIN31010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN31010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN31010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
