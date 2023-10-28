import { ListItem } from './list-item';
import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import { EditableListContainerComponent } from './editable-list-container/editable-list-container.component';
import { DataService } from './services/data.service';
import { ListComponent } from './list/list.component';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { EditableCheckboxListComponent } from './editable-checkbox-list/editable-checkbox-list.component';
import { TrumpyListComponent } from './trumpy-list/trumpy-list.component';

@Component({
  selector: 'ns-root',
  standalone: true,
  imports: [CommonModule, ListComponent, TrumpyListComponent, CheckboxComponent, EditableCheckboxListComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  // Private
  private dataService = inject(DataService);

  // Public
  public testList: Array<ListItem> = new Array<ListItem>();

  // ViewChild
  @ViewChild('list') listComponent!: EditableListContainerComponent;





  onLoadList() {
    this.dataService.get('api/List').subscribe(
      (listItems: Array<ListItem>) => {
        this.testList = listItems;
      }
    )
  }



  onSelectedItems(selectedItems: Array<ListItem>) {
    // console.log(selectedItems);
  }




  onAddListItem() {
    this.listComponent.addListItem();
  }



  onListItemAdded(newListItemText: string) {
    this.dataService.post('api/List', {
      text: newListItemText
    }).subscribe((listItems: Array<ListItem>) => {
      this.testList = listItems;
    });
  }




  onEditListItem() {
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
}