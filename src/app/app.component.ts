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

@Component({
  selector: 'ns-root',
  standalone: true,
  imports: [CommonModule, ListComponent, CheckboxComponent, EditableCheckboxListComponent, EditableListComponent, IconFontListComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  // Private
  private dataService = inject(DataService);

  // Public
  public testList: Array<ListItem> = new Array<ListItem>();
  public checkboxList: Array<CheckboxListItem> = new Array<CheckboxListItem>();

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




  public iconFontList: Array<IconFontListItem> = [
    { id: '0', iconFont: 'fa-solid fa-user', text: 'Your Account' },
    { id: '1', iconFont: 'fa-solid fa-cart-shopping', text: 'Your Orders' },
    { id: '2', iconFont: 'fa-solid fa-file-lines', text: 'Your List' },
    { id: '3', iconFont: 'fa-solid fa-address-card', text: 'Your Profile' },
    { id: '4', iconFont: 'fa-solid fa-envelope', text: 'Email Preferences' },
    { id: '5', iconFont: 'fa-solid fa-right-from-bracket', text: 'Log Out' }
  ];


  ngOnInit() {
    this.dataService.get('api/List').subscribe(
      (listItems: Array<ListItem>) => {
        this.testList = listItems;
      }
    )


    this.dataService.get('api/CheckboxList').subscribe(
      (checkboxListItems: Array<CheckboxListItem>) => {
        this.checkboxList = checkboxListItems;
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



  onCheckboxListItemEdited(checkboxListItem: ListItem) {
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
}