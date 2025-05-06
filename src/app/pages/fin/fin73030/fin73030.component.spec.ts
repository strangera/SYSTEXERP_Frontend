import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN73030Component } from './fin73030.component';

describe('FIN73030Component', () => {
  let component: FIN73030Component;
  let fixture: ComponentFixture<FIN73030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN73030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN73030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
