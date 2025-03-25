import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN29030Component } from './fin29030.component';

describe('FIN29030Component', () => {
  let component: FIN29030Component;
  let fixture: ComponentFixture<FIN29030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN29030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN29030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
