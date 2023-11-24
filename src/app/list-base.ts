import { ListItem } from "./list-item";
import { SecondarySelectionType } from "./enums";
import { ListItemComponent } from "./list-item/list-item.component";
import { Directive, EventEmitter, Input, Output, QueryList, Renderer2, ViewChildren, inject } from "@angular/core";
import { Observable, take } from "rxjs";

@Directive()
export abstract class ListBase<T extends ListItem> {
  // Private
  protected loading: boolean = true;
  protected renderer = inject(Renderer2);
  protected list: Array<T> = new Array<T>();
  protected removeKeydownListener!: () => void;
  protected eventListenersAdded: boolean = false;

  // Public
  public getItems!: () => Observable<Array<T>>;

  // Inputs
  @Input() public loopSelection: boolean = true;
  @Input() public noSelectOnArrowKey: boolean = false;

  // Events
  @Output() public selectedItemsEvent: EventEmitter<Array<T>> = new EventEmitter();

  // View Children
  @ViewChildren('listItemComponent') protected listItemComponents: QueryList<ListItemComponent> = new QueryList<ListItemComponent>();


  private ngOnInit() {
    const loadListener = setInterval(() => {
      if (this.getItems != null) {
        clearInterval(loadListener);
        this.getItems()
          .pipe(take(1))
          .subscribe((items: Array<T>) => {
            if (this.loading) {
              this.loading = false
              this.loadItems(items)
            }
          })
      }
    })
  }



  protected loadItems(items: Array<T>) {
    this.list = items;
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
      const index = this.list.indexOf(listItemHasPrimarySelectionBorderOnly.listItem as T);
      if (index != -1) this.selectListItem(this.list[index]);
    }
  }



  protected onArrowKey(e: KeyboardEvent, direction: number): void {
    e.preventDefault();
    const currentListItem = this.listItemComponents.find(x => x.hasPrimarySelection);
    if (currentListItem) this.selectItemOnArrowKey(currentListItem, direction);
  }



  protected selectItemOnArrowKey(currentListItemComponent: ListItemComponent, direction: number) {
    const currentIndex = this.list.indexOf(currentListItemComponent.listItem as T);
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
      this.selectedItemsEvent.emit([listItemComponent.listItem as T]);
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



  public selectListItem(listItem: T): void {
    const listItemComponent = this.listItemComponents.find(x => x.listItem.id == listItem.id);
    if (listItemComponent) {
      this.addEventListeners();
      listItemComponent.listItemElement.nativeElement.focus();
      this.onItemSelectionUsingNoModifierKey(listItemComponent);
      this.setSecondarySelectionType();
    }
  }
}