import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN63020Component } from './fin63020.component';

describe('FIN63020Component', () => {
  let component: FIN63020Component;
  let fixture: ComponentFixture<FIN63020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN63020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN63020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
