import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN29100Component } from './fin29100.component';

describe('FIN29100Component', () => {
  let component: FIN29100Component;
  let fixture: ComponentFixture<FIN29100Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN29100Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN29100Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
