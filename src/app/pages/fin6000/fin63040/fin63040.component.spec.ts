import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN63040Component } from './fin63040.component';

describe('FIN63040Component', () => {
  let component: FIN63040Component;
  let fixture: ComponentFixture<FIN63040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN63040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN63040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
