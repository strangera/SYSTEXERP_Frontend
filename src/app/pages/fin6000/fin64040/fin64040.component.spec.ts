import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN64040Component } from './fin64040.component';

describe('FIN64040Component', () => {
  let component: FIN64040Component;
  let fixture: ComponentFixture<FIN64040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN64040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN64040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
