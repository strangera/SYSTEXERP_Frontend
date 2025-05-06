import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN55050Component } from './fin55050.component';

describe('FIN55050Component', () => {
  let component: FIN55050Component;
  let fixture: ComponentFixture<FIN55050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN55050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN55050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
