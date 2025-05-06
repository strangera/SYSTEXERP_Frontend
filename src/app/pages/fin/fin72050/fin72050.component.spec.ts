import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN72050Component } from './fin72050.component';

describe('FIN72050Component', () => {
  let component: FIN72050Component;
  let fixture: ComponentFixture<FIN72050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN72050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN72050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
