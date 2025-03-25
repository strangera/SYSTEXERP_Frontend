import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN11040Component } from './fin11040.component';

describe('FIN11040Component', () => {
  let component: FIN11040Component;
  let fixture: ComponentFixture<FIN11040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN11040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN11040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
