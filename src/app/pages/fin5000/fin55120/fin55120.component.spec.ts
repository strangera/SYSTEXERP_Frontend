import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN55120Component } from './fin55120.component';

describe('FIN55120Component', () => {
  let component: FIN55120Component;
  let fixture: ComponentFixture<FIN55120Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN55120Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN55120Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
