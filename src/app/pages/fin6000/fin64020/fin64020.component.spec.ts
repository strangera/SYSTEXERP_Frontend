import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN64020Component } from './fin64020.component';

describe('FIN64020Component', () => {
  let component: FIN64020Component;
  let fixture: ComponentFixture<FIN64020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN64020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN64020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
