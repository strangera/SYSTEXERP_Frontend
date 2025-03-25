import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN42040Component } from './fin42040.component';

describe('FIN42040Component', () => {
  let component: FIN42040Component;
  let fixture: ComponentFixture<FIN42040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN42040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN42040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
