import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN72040Component } from './fin72040.component';

describe('FIN72040Component', () => {
  let component: FIN72040Component;
  let fixture: ComponentFixture<FIN72040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN72040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN72040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
