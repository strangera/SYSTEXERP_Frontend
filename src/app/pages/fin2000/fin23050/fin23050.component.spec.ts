import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN23050Component } from './fin23050.component';

describe('FIN23050Component', () => {
  let component: FIN23050Component;
  let fixture: ComponentFixture<FIN23050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN23050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN23050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
