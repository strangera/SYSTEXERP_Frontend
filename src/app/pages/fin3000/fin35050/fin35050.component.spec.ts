import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN35050Component } from './fin35050.component';

describe('FIN35050Component', () => {
  let component: FIN35050Component;
  let fixture: ComponentFixture<FIN35050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN35050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN35050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
