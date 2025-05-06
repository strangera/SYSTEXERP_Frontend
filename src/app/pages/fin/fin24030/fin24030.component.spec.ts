import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN24030Component } from './fin24030.component';

describe('FIN24030Component', () => {
  let component: FIN24030Component;
  let fixture: ComponentFixture<FIN24030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN24030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN24030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
