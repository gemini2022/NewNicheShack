import { ListItem } from './list-item';
import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import { EditableListComponent } from './editable-list/editable-list.component';
import { DataService } from './services/data.service';
import { ListComponent } from './list/list.component';
import { EditableCheckboxListComponent } from './editable-checkbox-list/editable-checkbox-list.component';
import { IconFontListComponent } from './icon-font-list/icon-font-list.component';
import { IconFontListItem } from './icon-font-list-item';
import { CheckboxListItem } from './checkbox-list-item';
import { ImageListItem } from './image-list-item';
import { ImageListComponent } from './image-list/image-list.component';
import { EditableHierarchyListComponent } from './editable-hierarchy-list/editable-hierarchy-list.component';
import { HierarchyItem } from './hierarchy-list-item';
import { KeywordsHierarchyComponent } from './keywords-hierarchy/keywords-hierarchy.component';

@Component({
  selector: 'ns-root',
  standalone: true,
  imports: [CommonModule,
    ListComponent,
    EditableCheckboxListComponent,
    EditableListComponent,
    IconFontListComponent,
    ImageListComponent,
    EditableHierarchyListComponent,
    KeywordsHierarchyComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  // Private
  private dataService = inject(DataService);
  protected testList: Array<ListItem> = new Array<ListItem>();
  protected imageList: Array<ImageListItem> = new Array<ImageListItem>();
  protected checkboxList: Array<CheckboxListItem> = new Array<CheckboxListItem>();
  protected hierarchyList: Array<HierarchyItem> = new Array<HierarchyItem>();
  protected hierarchyChildren: Array<HierarchyItem> = new Array<HierarchyItem>();

  // ViewChild
  @ViewChild('list') list!: EditableListComponent;
  @ViewChild('hierarchy') hierarchy!: EditableHierarchyListComponent;



  // // ===============================================================
  // // This code will be in the lazy-laod script

  // public tabElements: Array<HTMLElement> = new Array<HTMLElement>();
  // @ViewChildren('tabElement') HTMLElements!: QueryList<any>;

  // ngAfterViewInit() {
  //   this.HTMLElements.forEach(x => {
  //     if (x.tabElement) {
  //       this.tabElements.push(x.tabElement)
  //     } else {
  //       this.tabElements.push(x);
  //     }
  //   })
  //   console.log(this.tabElements)
  // }
  // // ===============================================================




  protected iconFontList: Array<IconFontListItem> = [
    { id: '0', iconFont: 'fa-solid fa-user', text: 'Your Account' },
    { id: '1', iconFont: 'fa-solid fa-cart-shopping', text: 'Your Orders' },
    { id: '2', iconFont: 'fa-solid fa-file-lines', text: 'Your List' },
    { id: '3', iconFont: 'fa-solid fa-address-card', text: 'Your Profile' },
    { id: '4', iconFont: 'fa-solid fa-envelope', text: 'Email Preferences' },
    { id: '5', iconFont: 'fa-solid fa-right-from-bracket', text: 'Log Out' }
  ];





  ngAfterViewInit() {
    // List
    this.list.getItems = () => { return this.dataService.get('api/List') };
    this.list.postItem = (text: string) => { return this.dataService.post('api/List', { text: text }) };
    this.list.deleteItems = (ids: Array<any>) => { return this.dataService.delete('api/List', { ids: ids }) };
    this.list.postItems = (texts: Array<string>) => { return this.dataService.post('api/List/PostItems', { texts: texts }) };
    this.list.putItem = (listItem: ListItem) => { return this.dataService.put('api/List', { id: listItem.id, text: listItem.text }) };

    // Hierarchy
    this.hierarchy.getItems = () => { return this.dataService.get('api/Hierarchy') };
    this.hierarchy.deleteItems = (ids: Array<any>) => { return this.dataService.delete('api/Hierarchy', { ids: ids }) };
    this.hierarchy.getChildItems = (parentId: any) => { return this.dataService.get('api/Hierarchy/Children', [{ key: 'parentId', value: parentId }]) };
    this.hierarchy.postHierarchyItem = (parentId: any, text: string) => { return this.dataService.post('api/Hierarchy', { parentId: parentId, text: text }) };
    this.hierarchy.putItem = (hierarchyItem: HierarchyItem) => { return this.dataService.put('api/Hierarchy', { id: hierarchyItem.id, text: hierarchyItem.text, tier: hierarchyItem.tier }) };
  }




  onSelectedListItems(selectedItems: Array<ListItem>) {
    // console.log(selectedItems);
  }


  deleteListItems() {
    this.list.getSelectedItems();
    this.list.delete();
  }




  onSelectedHierarchyItems(selectedItems: Array<ListItem>) {
    // console.log(selectedItems);
  }



  deleteHierarchyItems() {
    this.hierarchy.getSelectedItems();
    this.hierarchy.delete();
  }



  onHierarchyCollapseStateUpdated(isCollapsed: boolean) {
    // console.log(isCollapsed);
  }
}