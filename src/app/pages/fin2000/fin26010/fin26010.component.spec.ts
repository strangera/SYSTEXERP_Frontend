import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN26010Component } from './fin26010.component';

describe('FIN26010Component', () => {
  let component: FIN26010Component;
  let fixture: ComponentFixture<FIN26010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN26010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN26010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
