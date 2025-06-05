import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN63050Component } from './fin63050.component';

describe('FIN63050Component', () => {
  let component: FIN63050Component;
  let fixture: ComponentFixture<FIN63050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN63050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN63050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
