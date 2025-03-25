import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN42030Component } from './fin42030.component';

describe('FIN42030Component', () => {
  let component: FIN42030Component;
  let fixture: ComponentFixture<FIN42030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN42030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN42030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
