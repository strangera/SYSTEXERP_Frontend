import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN21020Component } from './fin21020.component';

describe('FIN21020Component', () => {
  let component: FIN21020Component;
  let fixture: ComponentFixture<FIN21020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN21020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN21020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
