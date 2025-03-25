import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpmLostPersonComponent } from './cpm-lost-person.component';

describe('CpmLostPersonComponent', () => {
  let component: CpmLostPersonComponent;
  let fixture: ComponentFixture<CpmLostPersonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CpmLostPersonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CpmLostPersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
