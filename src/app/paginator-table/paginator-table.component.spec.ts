import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginatorTableComponent } from './paginator-table.component';

describe('PaginatorTableComponent', () => {
  let component: PaginatorTableComponent;
  let fixture: ComponentFixture<PaginatorTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaginatorTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaginatorTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
