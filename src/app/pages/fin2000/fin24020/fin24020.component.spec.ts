import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN24020Component } from './fin24020.component';

describe('FIN24020Component', () => {
  let component: FIN24020Component;
  let fixture: ComponentFixture<FIN24020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN24020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN24020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
