import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatSortModule } from '@angular/material/sort'
import { TreetableComponent } from './component/treetable.component';
export { Node, Options} from './models';

@NgModule({
  declarations: [
    TreetableComponent
  ],
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule,
    MatSortModule
  ],
  exports: [
    TreetableComponent
  ]
})
export class TreetableModule { }
