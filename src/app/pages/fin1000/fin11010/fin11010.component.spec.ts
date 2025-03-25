import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN11010Component } from './fin11010.component';

describe('FIN11010Component', () => {
  let component: FIN11010Component;
  let fixture: ComponentFixture<FIN11010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN11010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN11010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
