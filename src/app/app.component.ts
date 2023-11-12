import { ListItem } from './list-item';
import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import { EditableListComponent } from './editable-list/editable-list.component';
import { DataService } from './services/data.service';
import { ListComponent } from './list/list.component';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { EditableCheckboxListComponent } from './editable-checkbox-list/editable-checkbox-list.component';
import { IconFontListComponent } from './icon-font-list/icon-font-list.component';
import { IconFontListItem } from './icon-font-list-item';
import { CheckboxListItem } from './checkbox-list-item';
import { ImageListItem } from './image-list-item';
import { ImageListComponent } from './image-list/image-list.component';
import { EditableHierarchyListComponent } from './editable-hierarchy-list/editable-hierarchy-list.component';
import { HierarchyArrowComponent } from './hierarchy-arrow/hierarchy-arrow.component';
import { HierarchyListItem } from './hierarchy-list-item';

@Component({
  selector: 'ns-root',
  standalone: true,
  imports: [CommonModule,
    ListComponent,
    CheckboxComponent,
    EditableCheckboxListComponent,
    EditableListComponent,
    IconFontListComponent,
    ImageListComponent,
    EditableHierarchyListComponent,
    HierarchyArrowComponent
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
  protected hierarchyList: Array<HierarchyListItem> = new Array<HierarchyListItem>();
  protected hierarchyChildren: Array<HierarchyListItem> = new Array<HierarchyListItem>();

  // ViewChild
  @ViewChild('list') listComponent!: EditableListComponent;



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



  // protected hierarchyList: Array<HierarchyListItem> = [
  //   {id: '0', text: 'Hierarchy List Item 1', tier: 0, hidden: false},
  //           {id: '1', text: 'Hierarchy List Item 1A', tier: 1, isParent: true, hidden: true},
  //                   {id: '2', text: 'Hierarchy List Item 1A1', tier: 2, hidden: true},
  //                   {id: '3', text: 'Hierarchy List Item 1A2', tier: 2, hidden: true},
  //                   {id: '4', text: 'Hierarchy List Item 1A3', tier: 2, hidden: true},
  //           {id: '5', text: 'Hierarchy List Item 1B', tier: 1, isParent: true, hidden: true},
  //                   {id: '6', text: 'Hierarchy List Item 1B1', tier: 2, hidden: true},
  //                   {id: '7', text: 'Hierarchy List Item 1B2', tier: 2, hidden: true},
  //                   {id: '8', text: 'Hierarchy List Item 1B3', tier: 2, hidden: true},
  //           {id: '9', text: 'Hierarchy List Item 1C', tier: 1, isParent: true, hidden: true},
  //                   {id: '10', text: 'Hierarchy List Item 1C1', tier: 2, hidden: true},
  //                   {id: '11', text: 'Hierarchy List Item 1C2', tier: 2, hidden: true},
  //                   {id: '12', text: 'Hierarchy List Item 1C3', tier: 2, hidden: true},

  //   {id: '13', text: 'Hierarchy List Item 2', tier: 0, hidden: false},
  //         {id: '14', text: 'Hierarchy List Item 2A', tier: 1, isParent: true, hidden: true},
  //                 {id: '15', text: 'Hierarchy List Item 2A1', tier: 2, hidden: true},
  //                 {id: '16', text: 'Hierarchy List Item 2A2', tier: 2, hidden: true},
  //                 {id: '17', text: 'Hierarchy List Item 2A3', tier: 2, hidden: true},
  //         {id: '18', text: 'Hierarchy List Item 2B', tier: 1, isParent: true, hidden: true},
  //                 {id: '19', text: 'Hierarchy List Item 2B1', tier: 2, hidden: true},
  //                 {id: '20', text: 'Hierarchy List Item 2B2', tier: 2, hidden: true},
  //                 {id: '21', text: 'Hierarchy List Item 2B3', tier: 2, hidden: true},
  //         {id: '22', text: 'Hierarchy List Item 2C', tier: 1, isParent: true, hidden: true},
  //                 {id: '23', text: 'Hierarchy List Item 2C1', tier: 2, hidden: true},
  //                 {id: '24', text: 'Hierarchy List Item 2C2', tier: 2, hidden: true},
  //                 {id: '25', text: 'Hierarchy List Item 2C3', tier: 2, hidden: true},

  //   {id: '26', text: 'Hierarchy List Item 3', tier: 0, hidden: false  },
  //           {id: '27', text: 'Hierarchy List Item 3A', tier: 1, isParent: true, hidden: true},
  //                   {id: '28', text: 'Hierarchy List Item 3A1', tier: 2, hidden: true},
  //                   {id: '29', text: 'Hierarchy List Item 3A2', tier: 2, hidden: true},
  //                   {id: '30', text: 'Hierarchy List Item 3A3', tier: 2, hidden: true},
  //           {id: '31', text: 'Hierarchy List Item 3B', tier: 1, isParent: true, hidden: true},
  //                   {id: '32', text: 'Hierarchy List Item 3B1', tier: 2, hidden: true},
  //                   {id: '33', text: 'Hierarchy List Item 3B2', tier: 2, hidden: true},
  //                   {id: '34', text: 'Hierarchy List Item 3B3', tier: 2, hidden: true},
  //           {id: '35', text: 'Hierarchy List Item 3C', tier: 1, isParent: true, hidden: true},
  //                   {id: '36', text: 'Hierarchy List Item 3C1', tier: 2, hidden: true},
  //                   {id: '37', text: 'Hierarchy List Item 3C2', tier: 2, hidden: true},
  //                   {id: '38', text: 'Hierarchy List Item 3C3', tier: 2, hidden: true},
  // ]


  ngOnInit() {
    this.dataService.get('api/List').subscribe(
      (listItems: Array<ListItem>) => {
        this.testList = listItems;
      }
    )

    this.dataService.get('api/ImageList').subscribe(
      (imageListItems: Array<ImageListItem>) => {
        this.imageList = imageListItems;
      }
    )


    this.dataService.get('api/CheckboxList').subscribe(
      (checkboxListItems: Array<CheckboxListItem>) => {
        this.checkboxList = checkboxListItems;
      }
    )


    this.dataService.get('api/HierarchyList').subscribe(
      (niches: Array<HierarchyListItem>) => {
        this.hierarchyList = niches;
      }
    )
  }




  onSelectedItems(selectedItems: Array<ListItem>) {
    // console.log(selectedItems);
  }




  onAddListItemButtonClick() {
    this.listComponent.addListItem();
  }



  onListItemAdded(newListItemText: string) {
    this.dataService.post('api/List', {
      text: newListItemText
    }).subscribe((listItems: Array<ListItem>) => {
      this.testList = listItems;
    });
  }




  onEditListItemButtonClick() {
    this.listComponent.editListItem();
  }




  onListItemEdited(listItem: ListItem) {
    this.dataService.put('api/List', {
      id: listItem.id,
      text: listItem.text
    }).subscribe((listItems: Array<ListItem>) => {
      this.testList = listItems;
    });
  }




  onListItemsToBeDeleted(listItemsToBeDeleted: Array<ListItem>) {
    this.listComponent.deleteListItems();
  }



  onDeletedListItems(idsOfDeletedListItems: Array<any>) {
    this.dataService.delete('api/List', {
      ids: idsOfDeletedListItems
    }).subscribe((listItems: Array<ListItem>) => {
      this.testList = listItems;
    });
  }





  onPastedListItems(pastedListItemsText: Array<string>) {
    this.dataService.post('api/List/Pasted', {
      texts: pastedListItemsText
    }).subscribe((listItems: Array<ListItem>) => {
      this.testList = listItems;
    });
  }







  onCheckboxListItemAdded(newCheckboxListItemText: string) {
    this.dataService.post('api/CheckboxList', {
      text: newCheckboxListItemText
    }).subscribe((checkboxListItems: Array<CheckboxListItem>) => {
      this.checkboxList = checkboxListItems;
    });
  }



  onCheckboxListItemEdited(checkboxListItem: CheckboxListItem) {
    this.dataService.put('api/CheckboxList', {
      id: checkboxListItem.id,
      text: checkboxListItem.text
    }).subscribe((checkboxListItems: Array<CheckboxListItem>) => {
      this.checkboxList = checkboxListItems;
    });
  }



  onCheckboxChanged(checkboxListItem: CheckboxListItem) {
    this.dataService.put('api/CheckboxList/CheckboxChange', {
      id: checkboxListItem.id,
      isChecked: checkboxListItem.isChecked
    }).subscribe();
  }






  onHierarchyChildrenRequested(parent: HierarchyListItem) {
    this.dataService.get('api/HierarchyList/Children', [
      { key: 'tier', value: parent.tier },
      { key: 'parentId', value: parent.id }
    ]).subscribe((children: Array<HierarchyListItem>) => {
      this.hierarchyChildren = children;
    })
  }



  onHierarchyCollapseStateUpdated(isCollapsed: boolean) {
    // console.log(isCollapsed);
  }
}