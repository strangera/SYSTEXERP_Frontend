import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN72020Component } from './fin72020.component';

describe('FIN72020Component', () => {
  let component: FIN72020Component;
  let fixture: ComponentFixture<FIN72020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN72020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN72020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
