import { ListItem } from "./list-item";
import { ArrowKeyType, SecondarySelectionType } from "./enums";
import { ListItemComponent } from "./list-item/list-item.component";
import { Directive, EventEmitter, Input, Output, QueryList, Renderer2, ViewChildren, inject } from "@angular/core";

@Directive()
export class List {
    // Private
    protected _loading!: boolean;
    protected renderer = inject(Renderer2);
    protected removeKeydownListener!: () => void;
    protected eventListenersAdded: boolean = false;

    // Public
    public get loading(): boolean { return this._loading; }

    // Inputs
    @Input() public noSelectOnArrowKey: boolean = false;
    @Input() public list: Array<ListItem> = new Array<ListItem>();

    // Events
    @Output() public loadListEvent: EventEmitter<void> = new EventEmitter();
    @Output() public selectedItemsEvent: EventEmitter<Array<ListItem>> = new EventEmitter();

    // View Children
    @ViewChildren('listItemComponent') public listItemComponents: QueryList<ListItemComponent> = new QueryList<ListItemComponent>();



    private ngOnInit(): void {
        this.load();
    }



    protected ngOnChanges(): void {
        this.onLoadComplete();
    }


    private load(): void {
        this._loading = true;
        this.loadListEvent.emit();
    }



    private onLoadComplete(): void {
        if (this._loading && this.list.length > 0) this._loading = false;
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
                this.onArrowKey(e, ArrowKeyType.Up);
                break;
            case 'ArrowDown':
                this.onArrowKey(e, ArrowKeyType.Down);
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



    protected onArrowKey(e: KeyboardEvent, arrowKeyType: ArrowKeyType): void {
        e.preventDefault();
        const currentListItem = this.listItemComponents.find(x => x.hasPrimarySelection);
        if (currentListItem) this.selectItemOnArrowKey(currentListItem, arrowKeyType);
    }



    protected selectItemOnArrowKey(currentListItem: ListItemComponent, arrowKeyType: ArrowKeyType) {
        const currentIndex = this.list.indexOf(currentListItem.listItem);
        const nextIndex = arrowKeyType === ArrowKeyType.Up ? currentIndex - 1 : currentIndex + 1;

        if (nextIndex >= 0 && nextIndex < this.list.length) {
            if (this.noSelectOnArrowKey) {
                const listItemComponent = this.listItemComponents.get(nextIndex);
                if (listItemComponent) listItemComponent.hasPrimarySelectionBorderOnly = true;
            }
            this.selectListItem(this.list[nextIndex]);
        }
    }



    protected onItemSelectionUsingNoModifierKey(listItemComponent: ListItemComponent): void {
        this.resetListItemProperties(listItemComponent.hasPrimarySelectionBorderOnly);
        listItemComponent.hasPrimarySelection = true;
        if (!listItemComponent.hasPrimarySelectionBorderOnly) {
            listItemComponent.hasSecondarySelection = true;
            this.selectedItemsEvent.emit([listItemComponent.listItem]);
        } else {
            listItemComponent.hasPrimarySelectionBorderOnly = false;
        }
    }



    protected resetListItemProperties(primarySelectedListItemIsBorderOnly?: boolean): void {
        this.listItemComponents.forEach(x => {
            this.initializeProperties(x, primarySelectedListItemIsBorderOnly);
        });
    }



    protected initializeProperties(listItemComponent: ListItemComponent, primarySelectedListItemIsBorderOnly?: boolean) {
        listItemComponent.hasPrimarySelection = false;
        listItemComponent.secondarySelectionType = null;
        if (!primarySelectedListItemIsBorderOnly) listItemComponent.hasSecondarySelection = false;
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
            listItemComponent.htmlElement.nativeElement.focus();
            this.onItemSelectionUsingNoModifierKey(listItemComponent);
            this.setSecondarySelectionType();
        }
    }
}