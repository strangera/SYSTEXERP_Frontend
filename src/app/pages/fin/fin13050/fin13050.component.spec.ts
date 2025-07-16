import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN13050Component } from './fin13050.component';

describe('FIN13050Component', () => {
  let component: FIN13050Component;
  let fixture: ComponentFixture<FIN13050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN13050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN13050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
