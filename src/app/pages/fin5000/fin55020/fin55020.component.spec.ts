import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN55020Component } from './fin55020.component';

describe('FIN55020Component', () => {
  let component: FIN55020Component;
  let fixture: ComponentFixture<FIN55020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN55020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN55020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
