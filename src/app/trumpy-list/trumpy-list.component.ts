import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditableListContainerComponent } from '../editable-list-container/editable-list-container.component';
import { ListItem } from '../list-item';

@Component({
  selector: 'ns-trumpy-list',
  standalone: true,
  imports: [CommonModule, EditableListContainerComponent],
  templateUrl: './trumpy-list.component.html',
  styleUrls: ['./trumpy-list.component.scss']
})
export class TrumpyListComponent {

  // Inputs
  @Input() public loopSelection: boolean = true;
  @Input() public noSelectOnArrowKey: boolean = false;
  @Input() public list: Array<ListItem> = new Array<ListItem>();

  // Events
  @Output() public loadListEvent: EventEmitter<void> = new EventEmitter();
  @Output() public selectedItemsEvent: EventEmitter<Array<ListItem>> = new EventEmitter();




  // -------editable--------
  @Input() public isMultiselectable: boolean = true;

  @Output() public inputTypedEvent: EventEmitter<string> = new EventEmitter();
  @Output() public addedListItemEvent: EventEmitter<string> = new EventEmitter();
  @Output() public editedListItemEvent: EventEmitter<ListItem> = new EventEmitter();
  @Output() public deletedListItemsEvent: EventEmitter<Array<any>> = new EventEmitter();
  @Output() public pastedListItemsEvent: EventEmitter<Array<string>> = new EventEmitter();
  @Output() public deleteKeyPressedEvent: EventEmitter<Array<ListItem>> = new EventEmitter();
  @Output() public listItemsToBeDeletedEvent: EventEmitter<Array<ListItem>> = new EventEmitter();
}