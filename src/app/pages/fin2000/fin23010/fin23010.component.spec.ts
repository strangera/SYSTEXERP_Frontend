import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN23010Component } from './fin23010.component';

describe('FIN23010Component', () => {
  let component: FIN23010Component;
  let fixture: ComponentFixture<FIN23010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN23010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN23010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
