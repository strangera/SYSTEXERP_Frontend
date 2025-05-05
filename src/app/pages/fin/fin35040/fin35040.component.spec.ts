import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN35040Component } from './fin35040.component';

describe('FIN35040Component', () => {
  let component: FIN35040Component;
  let fixture: ComponentFixture<FIN35040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN35040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN35040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
