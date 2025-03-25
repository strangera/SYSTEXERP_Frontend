import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN52020Component } from './fin52020.component';

describe('FIN52020Component', () => {
  let component: FIN52020Component;
  let fixture: ComponentFixture<FIN52020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN52020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN52020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
