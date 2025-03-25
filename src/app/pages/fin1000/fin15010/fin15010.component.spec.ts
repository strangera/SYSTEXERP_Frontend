import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN15010Component } from './fin15010.component';

describe('FIN15010Component', () => {
  let component: FIN15010Component;
  let fixture: ComponentFixture<FIN15010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN15010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN15010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
