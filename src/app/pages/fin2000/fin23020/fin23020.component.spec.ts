import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN23020Component } from './fin23020.component';

describe('FIN23020Component', () => {
  let component: FIN23020Component;
  let fixture: ComponentFixture<FIN23020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN23020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN23020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
