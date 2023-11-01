import { Component, EventEmitter, Input, Output, QueryList, Renderer2, SimpleChange, ViewChildren, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListItemComponent } from '../list-item/list-item.component';
import { SecondarySelectionType } from '../enums';
import { ListItem } from '../list-item';

@Component({
  selector: 'ns-list',
  standalone: true,
  imports: [CommonModule, ListItemComponent],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent {
  // Private
  protected loading: boolean = true;
  protected renderer = inject(Renderer2);
  protected removeKeydownListener!: () => void;
  protected eventListenersAdded: boolean = false;

  // Inputs
  @Input() public loopSelection: boolean = true;
  @Input() public noSelectOnArrowKey: boolean = false;
  @Input() public list: Array<ListItem> = new Array<ListItem>();

  // Events
  @Output() public loadListEvent: EventEmitter<void> = new EventEmitter();
  @Output() public selectedItemsEvent: EventEmitter<Array<ListItem>> = new EventEmitter();

  // View Children
  @ViewChildren('listItemComponent') protected listItemComponents: QueryList<ListItemComponent> = new QueryList<ListItemComponent>();


  



  protected ngOnChanges(changes: any): void {
    if((changes.list.isFirstChange() && this.loading && this.list.length > 0) || (!changes.list.isFirstChange() && this.loading)) {
      this.loading = false
    } 
  }


  protected addEventListeners(): void {
    if (this.eventListenersAdded) return;
    this.eventListenersAdded = true;
    this.removeKeydownListener = this.renderer.listen('window', 'keydown', (e: KeyboardEvent) => this.onKeyDown(e));
  }



  protected onKeyDown(e: KeyboardEvent): void {
    switch (e.key) {
      case 'Enter':
        this.onEnter(e);
        break;
      case 'ArrowUp':
        this.onArrowKey(e, -1);
        break;
      case 'ArrowDown':
        this.onArrowKey(e, 1);
        break;
    }
  }



  protected onEnter(e: KeyboardEvent): void {
    e.preventDefault();
    const listItemHasPrimarySelectionBorderOnly = this.listItemComponents.find(x => x.hasPrimarySelection && !x.hasSecondarySelection);
    if (listItemHasPrimarySelectionBorderOnly) {
      const index = this.list.indexOf(listItemHasPrimarySelectionBorderOnly.listItem);
      if (index != -1) this.selectListItem(this.list[index]);
    }
  }



  protected onArrowKey(e: KeyboardEvent, direction: number): void {
    e.preventDefault();
    const currentListItem = this.listItemComponents.find(x => x.hasPrimarySelection);
    if (currentListItem) this.selectItemOnArrowKey(currentListItem, direction);
  }



  protected selectItemOnArrowKey(currentListItem: ListItemComponent, direction: number) {
    const currentIndex = this.list.indexOf(currentListItem.listItem);
    const nextIndex = this.loopSelection ? (currentIndex + direction + this.list.length) % this.list.length : currentIndex + direction;

    if (this.noSelectOnArrowKey) {
      const listItemComponent = this.listItemComponents.get(nextIndex);
      if (listItemComponent) listItemComponent.hasPrimarySelectionBorderOnly = true;
    }
    if (nextIndex >= 0 && nextIndex < this.list.length) this.selectListItem(this.list[nextIndex]);
  }



  protected onItemSelectionUsingNoModifierKey(listItemComponent: ListItemComponent): void {
    this.initializeListItemsInList(listItemComponent.hasPrimarySelectionBorderOnly);
    listItemComponent.hasPrimarySelection = true;
    if (!listItemComponent.hasPrimarySelectionBorderOnly) {
      listItemComponent.hasSecondarySelection = true;
      this.selectedItemsEvent.emit([listItemComponent.listItem]);
    } else {
      listItemComponent.hasPrimarySelectionBorderOnly = false;
    }
  }



  protected initializeListItemsInList(primarySelectedListItemIsBorderOnly?: boolean): void {
    this.listItemComponents.forEach(listItemComponent => {
      listItemComponent.initialize(primarySelectedListItemIsBorderOnly);
    });
  }



  protected setSecondarySelectionType(): void {
    if (this.list.length !== 1) {
      if (this.listItemComponents.first.hasSecondarySelection && !this.listItemComponents.first.hasPrimarySelection) this.listItemComponents.first.secondarySelectionType = SecondarySelectionType.All;
      for (let i = 1; i < this.listItemComponents.length - 1; i++) {
        const currentListItem = this.listItemComponents.get(i);
        if (currentListItem && currentListItem.hasSecondarySelection && !currentListItem.hasPrimarySelection) currentListItem.secondarySelectionType = SecondarySelectionType.All;
      }
      if (this.listItemComponents.last.hasSecondarySelection && !this.listItemComponents.last.hasPrimarySelection) this.listItemComponents.last.secondarySelectionType = SecondarySelectionType.All;
    }
  }



  public selectListItem(listItem: ListItem): void {
    const listItemComponent = this.listItemComponents.find(x => x.listItem.id == listItem.id);
    if (listItemComponent) {
      this.addEventListeners();
      listItemComponent.listItemElement.nativeElement.focus();
      this.onItemSelectionUsingNoModifierKey(listItemComponent);
      this.setSecondarySelectionType();
    }
  }
}