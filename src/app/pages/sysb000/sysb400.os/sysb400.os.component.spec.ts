import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sysb400OsComponent } from './sysb400.os.component';

describe('Sysb400OsComponent', () => {
  let component: Sysb400OsComponent;
  let fixture: ComponentFixture<Sysb400OsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sysb400OsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sysb400OsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
