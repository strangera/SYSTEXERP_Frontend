import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN11020Component } from './fin11020.component';

describe('FIN11020Component', () => {
  let component: FIN11020Component;
  let fixture: ComponentFixture<FIN11020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN11020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN11020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
