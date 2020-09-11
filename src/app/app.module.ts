import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { TreetableModule } from './treetable/treetable.module';
import { PaginatorTableComponent } from './paginator-table/paginator-table.component';

@NgModule({
  declarations: [
    AppComponent,
    PaginatorTableComponent
  ],
  imports: [
    BrowserAnimationsModule,
    TreetableModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
