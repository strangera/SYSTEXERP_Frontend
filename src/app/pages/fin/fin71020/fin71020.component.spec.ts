import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN71020Component } from './fin71020.component';

describe('FIN71020Component', () => {
  let component: FIN71020Component;
  let fixture: ComponentFixture<FIN71020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN71020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN71020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
