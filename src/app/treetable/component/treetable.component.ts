import { Component, OnInit, Input, Output, ElementRef, ViewChild, AfterViewInit, ContentChildren } from '@angular/core';
import { Node, TreeTableNode, Options, SearchableNode } from '../models';
import { TreeService } from '../services/tree/tree.service';
import { MatSort, MatSortable } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ValidatorService } from '../services/validator/validator.service';
import { ConverterService } from '../services/converter/converter.service';
import { defaultOptions } from '../default.options';
import { flatMap, defaults } from 'lodash-es';
import { Subject } from 'rxjs';

@Component({
  selector: 'ng-treetable, treetable', // 'ng-treetable' is currently being deprecated
  templateUrl: './treetable.component.html',
  styleUrls: ['./treetable.component.scss']
})
export class TreetableComponent<T> implements OnInit, AfterViewInit {
  @Input() options: Options<T> = {};
  @Input() tree: Node<T> | Node<T>[];
  @Output() nodeClicked: Subject<TreeTableNode<T>> = new Subject();
  private searchableTree: SearchableNode<T>[];
  private treeTable: TreeTableNode<T>[];
  displayedColumns: string[];
  dataSource: MatTableDataSource<TreeTableNode<T>>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  // private innerNodesCount: number = 0; 
  private sorttechniqueMap : {columnName : string, sortType : string}[] = []

  constructor(
    private treeService: TreeService,
    private validatorService: ValidatorService,
    private converterService: ConverterService,
    elem: ElementRef
  ) {
    const tagName = elem.nativeElement.tagName.toLowerCase();
    if (tagName === 'ng-treetable') {
      console.warn(`DEPRECATION WARNING: \n The 'ng-treetable' selector is being deprecated. Please use the new 'treetable' selector`);
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnInit() {
    this.tree = Array.isArray(this.tree) ? this.tree : [this.tree];
    this.options = this.parseOptions(defaultOptions);
    const root = this.tree[0];
    const customOrderValidator = this.validatorService.validateCustomOrder<T, Node<T>>(root, this.options.customColumnOrder);
    if (this.options.customColumnOrder && !customOrderValidator.valid) {
      throw new Error(`
        Properties ${customOrderValidator.xor.map(x => `'${x}'`).join(', ')} incorrect or missing in customColumnOrder`
      );
    }
    this.displayedColumns = this.options.customColumnOrder
      ? this.options.customColumnOrder
      : this.extractNodeProps(this.tree[0]);
    for(let i = 0; i < this.displayedColumns.length; i++){
      this.sorttechniqueMap.push({columnName : this.displayedColumns[i].toString(),sortType : 'asc'})
    }
    this.searchableTree = this.tree.map(t => this.converterService.toSearchableTree(t));
    const treeTableTree = this.searchableTree.map(st => this.converterService.toTreeTableTree(st,this.options));
    this.treeTable = flatMap(treeTableTree, this.treeService.flatten);
    this.dataSource = this.generateDataSource();
    this.foldTree();
  }

  sortColumn = (column : any) => {
    // this.dataSource.sort((a,b) => a[column] > b[column] ? 1 : a[column] < b[column] ? -1 : 0)
    let sortType = ''
    for(let i=0;i<this.sorttechniqueMap.length;i++){
      if(column === this.sorttechniqueMap[i].columnName){
        sortType = this.sorttechniqueMap[i].sortType;
        if(this.sorttechniqueMap[i].sortType === 'asc'){
          this.sorttechniqueMap[i].sortType = 'desc';
        }else{
          this.sorttechniqueMap[i].sortType = 'asc';
        }
      }
    }
    this.dataSource.sort.sort(<MatSortable>({ id : column, start : sortType}));
    this.dataSource.data.sort((a:any, b:any) => {
      if(sortType === 'asc'){
        if(a.value[column] < b.value[column]){
          return -1;
        }else if(a.value[column] > b.value[column]){
          return 1;
        }
        return 0;
      }else if(sortType === 'desc'){
        if(a.value[column] > b.value[column]){
          return -1;
        }else if(a.value[column] < b.value[column]){
          return 1;
        }
        return 0;
      }
    })
  }

  extractNodeProps(tree: Node<T> & { value: { [k: string]: any } }): string[] {
    return Object.keys(tree.value).filter(x => typeof tree.value[x] !== 'object');
  }

  generateDataSource(): MatTableDataSource<TreeTableNode<T>> {
    return new MatTableDataSource(this.treeTable.filter(x => x.isVisible));
  }

  formatIndentation(node: TreeTableNode<T>, step: number = 5): string {
    return '&nbsp;'.repeat(node.depth * step);
  }

	formatElevation(): string {
		return `mat-elevation-z${this.options.elevation}`;
  }
  
  // closeAllInnerNodes = (clickedNode : any) => {
  //   if(clickedNode.length === 0){
  //     return
  //   }
  //   if(clickedNode.length > 0){
  //     this.innerNodesCount += clickedNode.length
  //     for(let i=0; i < clickedNode.length; i++){
  //       clickedNode[i].isExpanded = false
  //       if(clickedNode[i].children.length > 0){
  //         this.closeAllInnerNodes(clickedNode[i].children)
  //       }
  //     }
  //   }
  // }

  onNodeClick(clickedNode: TreeTableNode<T>): void {
    clickedNode.isExpanded = !clickedNode.isExpanded;
    // let paginatorIndex = this.dataSource.paginator.pageIndex;
    this.foldTree()
    // this.dataSource.paginator.pageIndex = paginatorIndex;
    // if(clickedNode.isExpanded){
    //   this.dataSource.paginator._changePageSize(this.dataSource.paginator.pageSize + clickedNode.children.length)
    // }else{
    //   this.innerNodesCount = 0
    //   this.closeAllInnerNodes(clickedNode.children);
    //   this.dataSource.paginator._changePageSize(this.dataSource.paginator.pageSize - this.innerNodesCount)
    // }
    this.nodeClicked.next(clickedNode);
  }
  // Overrides default options with those specified by the user
  parseOptions(defaultOpts: Options<T>): Options<T> {
    return defaults(this.options, defaultOpts);
  }

  private foldTree() {
    this.treeTable.forEach(el => {
      el.isVisible = this.searchableTree.every(st => {
        return this.treeService.searchById(st, el.id).
          fold([], n => n.pathToRoot)
          .every(p => this.treeTable.find(x => x.id === p.id).isExpanded);
      });
    });
    this.dataSource = this.generateDataSource();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }


}
