import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTableEditorComponent } from './data-table-editor.component';

describe('DataTableEditorComponent', () => {
  let component: DataTableEditorComponent;
  let fixture: ComponentFixture<DataTableEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTableEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataTableEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
