import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN23040Component } from './fin23040.component';

describe('FIN23040Component', () => {
  let component: FIN23040Component;
  let fixture: ComponentFixture<FIN23040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN23040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN23040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
