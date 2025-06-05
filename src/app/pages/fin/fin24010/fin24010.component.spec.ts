import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN24010Component } from './fin24010.component';

describe('FIN24010Component', () => {
  let component: FIN24010Component;
  let fixture: ComponentFixture<FIN24010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN24010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN24010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
