import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN35020Component } from './fin35020.component';

describe('FIN35020Component', () => {
  let component: FIN35020Component;
  let fixture: ComponentFixture<FIN35020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN35020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN35020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
