import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN54020Component } from './fin54020.component';

describe('FIN54020Component', () => {
  let component: FIN54020Component;
  let fixture: ComponentFixture<FIN54020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN54020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN54020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
