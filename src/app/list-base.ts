import { Observable, take } from "rxjs";
import { ListItem } from "./list-item";
import { SecondarySelectionType } from "./enums";
import { ListItemComponent } from "./list-item/list-item.component";
import { Directive, EventEmitter, Input, Output, QueryList, Renderer2, ViewChildren, inject } from "@angular/core";

@Directive()
export abstract class ListBase<T extends ListItem> {
  // Private
  protected loading: boolean = true;
  protected renderer = inject(Renderer2);
  protected items: Array<T> = new Array<T>();
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
  @ViewChildren('listItemComponent') protected itemComponents: QueryList<ListItemComponent> = new QueryList<ListItemComponent>();


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
    this.items = items;
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
    const itemHasPrimarySelectionBorderOnly = this.itemComponents.find(x => x.hasPrimarySelection && !x.hasSecondarySelection);
    if (itemHasPrimarySelectionBorderOnly) {
      const index = this.items.indexOf(itemHasPrimarySelectionBorderOnly.item as T);
      if (index != -1) this.selectItem(this.items[index]);
    }
  }



  protected onArrowKey(e: KeyboardEvent, direction: number): void {
    e.preventDefault();
    const currentItem = this.itemComponents.find(x => x.hasPrimarySelection);
    if (currentItem) this.selectItemOnArrowKey(currentItem, direction);
  }



  protected selectItemOnArrowKey(currentItemComponent: ListItemComponent, direction: number) {
    const currentIndex = this.items.indexOf(currentItemComponent.item as T);
    const nextIndex = this.loopSelection ? (currentIndex + direction + this.items.length) % this.items.length : currentIndex + direction;

    if (this.noSelectOnArrowKey) {
      const itemComponent = this.itemComponents.get(nextIndex);
      if (itemComponent) itemComponent.hasPrimarySelectionBorderOnly = true;
    }
    if (nextIndex >= 0 && nextIndex < this.items.length) this.selectItem(this.items[nextIndex]);
  }



  protected onItemSelectionUsingNoModifierKey(itemComponent: ListItemComponent): void {
    this.initializeItems(itemComponent.hasPrimarySelectionBorderOnly);
    itemComponent.hasPrimarySelection = true;
    if (!itemComponent.hasPrimarySelectionBorderOnly) {
      itemComponent.hasSecondarySelection = true;
      this.selectedItemsEvent.emit([itemComponent.item as T]);
    } else {
      itemComponent.hasPrimarySelectionBorderOnly = false;
    }
  }



  protected initializeItems(primarySelectedItemIsBorderOnly?: boolean): void {
    this.itemComponents.forEach(itemComponent => {
      itemComponent.initialize(primarySelectedItemIsBorderOnly);
    });
  }



  protected setSecondarySelectionType(): void {
    if (this.items.length !== 1) {
      if (this.itemComponents.first.hasSecondarySelection && !this.itemComponents.first.hasPrimarySelection) this.itemComponents.first.secondarySelectionType = SecondarySelectionType.All;
      for (let i = 1; i < this.itemComponents.length - 1; i++) {
        const currentItem = this.itemComponents.get(i);
        if (currentItem && currentItem.hasSecondarySelection && !currentItem.hasPrimarySelection) currentItem.secondarySelectionType = SecondarySelectionType.All;
      }
      if (this.itemComponents.last.hasSecondarySelection && !this.itemComponents.last.hasPrimarySelection) this.itemComponents.last.secondarySelectionType = SecondarySelectionType.All;
    }
  }



  public selectItem(item: T): void {
    const itemComponent = this.itemComponents.find(x => x.item.id == item.id);
    if (itemComponent) {
      this.addEventListeners();
      itemComponent.itemElement.nativeElement.focus();
      this.onItemSelectionUsingNoModifierKey(itemComponent);
      this.setSecondarySelectionType();
    }
  }
}