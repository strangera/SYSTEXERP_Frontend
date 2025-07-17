import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN11210Component } from './fin11210.component';

describe('FIN11210Component', () => {
  let component: FIN11210Component;
  let fixture: ComponentFixture<FIN11210Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN11210Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN11210Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
