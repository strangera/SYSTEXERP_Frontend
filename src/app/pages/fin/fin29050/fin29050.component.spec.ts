import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN29050Component } from './fin29050.component';

describe('FIN29050Component', () => {
  let component: FIN29050Component;
  let fixture: ComponentFixture<FIN29050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN29050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN29050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
