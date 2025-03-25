import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN29040Component } from './fin29040.component';

describe('FIN29040Component', () => {
  let component: FIN29040Component;
  let fixture: ComponentFixture<FIN29040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN29040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN29040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
