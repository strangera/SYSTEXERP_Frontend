import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN63010Component } from './fin63010.component';

describe('FIN63010Component', () => {
  let component: FIN63010Component;
  let fixture: ComponentFixture<FIN63010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN63010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN63010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
