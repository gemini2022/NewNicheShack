import { ListItem } from './list-item';
import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import { EditableListComponent } from './editable-list/editable-list.component';
import { DataService } from './services/data.service';

@Component({
  selector: 'ns-root',
  standalone: true,
  imports: [CommonModule, EditableListComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  // Private
  private dataService = inject(DataService);

  // Public
  public testList: Array<ListItem> = new Array<ListItem>();

  // ViewChild
  @ViewChild('list') listComponent!: EditableListComponent;





  onLoadList() {
    this.dataService.get('api/List').subscribe(
      (listItems: Array<ListItem>) => {
        this.testList = listItems;
      }
    )
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