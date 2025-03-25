import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN63030Component } from './fin63030.component';

describe('FIN63030Component', () => {
  let component: FIN63030Component;
  let fixture: ComponentFixture<FIN63030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN63030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN63030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
