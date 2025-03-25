import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN11050Component } from './fin11050.component';

describe('FIN11050Component', () => {
  let component: FIN11050Component;
  let fixture: ComponentFixture<FIN11050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN11050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN11050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
