import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN23030Component } from './fin23030.component';

describe('FIN23030Component', () => {
  let component: FIN23030Component;
  let fixture: ComponentFixture<FIN23030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN23030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN23030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
