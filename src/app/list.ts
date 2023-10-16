import { ListItem } from "./list-item";
import { ArrowKeyType, ExitEditType } from "./enums";
import { ListItemComponent } from "./list-item/list-item.component";
import { Directive, EventEmitter, Input, Output, QueryList, ViewChildren } from "@angular/core";

@Directive()
export class List {
    // Private
    private _loading!: boolean;
    private idOfEditedListItem: any;
    private ctrlKeyDown: boolean = false;
    private shiftKeyDown: boolean = false;
    private eventListenersAdded: boolean = false;
    private idOfNextSelectedListItemAfterDelete: any;
    private idsOfCurrentListItems: Array<any> = new Array<any>();

    // Public
    public stopMouseDownPropagation: boolean = false;
    public get loading(): boolean { return this._loading; }

    // Inputs
    @Input() public list: Array<ListItem> = new Array<ListItem>();

    // Events
    @Output() public loadListEvent: EventEmitter<void> = new EventEmitter();
    @Output() public inputTypedEvent: EventEmitter<string> = new EventEmitter();
    @Output() public addedListItemEvent: EventEmitter<string> = new EventEmitter();
    @Output() public editedListItemEvent: EventEmitter<ListItem> = new EventEmitter();
    @Output() public deletedListItemsEvent: EventEmitter<Array<any>> = new EventEmitter();
    @Output() public pastedListItemsEvent: EventEmitter<Array<string>> = new EventEmitter();
    @Output() public deleteKeyPressedEvent: EventEmitter<Array<ListItem>> = new EventEmitter();
    @Output() public listItemsToBeDeletedEvent: EventEmitter<Array<ListItem>> = new EventEmitter();

    // View Children
    @ViewChildren('listItemComponent') listItemComponents: QueryList<ListItemComponent> = new QueryList<ListItemComponent>();



    private ngOnInit(): void {
        this.load();
    }



    private ngOnChanges(): void {
        this.onLoadComplete();
        this.autoselectNewListItem();
        this.autoselectEditedListItem();
        this.autoselectNextListItemAfterDelete();
    }



    private load(): void {
        this._loading = true;
        this.loadListEvent.emit();
    }



    private onLoadComplete(): void {
        if (this._loading && this.list.length > 0) this._loading = false;
    }



    private addEventListeners(): void {
        if (!this.eventListenersAdded) {
            this.eventListenersAdded = true;
            window.addEventListener('keyup', this.onKeyUp);
            window.addEventListener('keydown', this.onKeyDown);
            window.addEventListener('mousedown', this.onMouseDown);
        }
    }



    private onKeyDown = (e: KeyboardEvent): void => {
        switch (e.key) {
            case 'Escape':
                this.onEscape();
                break;
            case 'Enter':
                this.onEnter(e);
                break;
            case 'ArrowUp': case 'ArrowDown':
                this.onArrowKey(e, e.key === 'ArrowUp' ? ArrowKeyType.Up : ArrowKeyType.Down);
                break;
            case 'Shift': case 'Control':
                e.key == 'Shift' ? this.shiftKeyDown = true : this.ctrlKeyDown = true;
                break;
            case 'Delete':
                this.emitPressedDeleteKey();
                break;
        }
    }



    private onKeyUp = (e: KeyboardEvent): void => {
        switch (e.key) {
            case 'Shift': case 'Control':
                e.key == 'Shift' ? this.shiftKeyDown = false : this.ctrlKeyDown = false;
                break;
        }
    }



    private onMouseDown = (): void => {
        if (this.stopMouseDownPropagation) {
            this.stopMouseDownPropagation = false;
            return
        }
        const editableListItem = this.listItemComponents.find(x => x.inEditMode);
        editableListItem ? editableListItem.exitEditMode(this) : this.reinitializeList();
    }



    private onEscape(): void {
        const editableListItem = this.listItemComponents.find(x => x.inEditMode);
        editableListItem ? editableListItem.exitEditMode(this, ExitEditType.Escape) : this.reinitializeList();
    }



    private onEnter(e: KeyboardEvent): void {
        e.preventDefault();
        const editableListItem = this.listItemComponents.find(x => x.inEditMode);
        if (editableListItem) editableListItem.exitEditMode(this, ExitEditType.Enter);
    }



    private onArrowKey(e: KeyboardEvent, arrowKeyType: ArrowKeyType): void {
        e.preventDefault();
        const currentListItem = this.listItemComponents.find(x => x.inEditMode || x.hasPrimarySelection || x.hasUnselection);
        if (currentListItem) currentListItem.onArrowKey(this, arrowKeyType);
    }



    private emitPressedDeleteKey(): void {
        if (this.listItemComponents.find(x => x.inEditMode)) return;
        const listItemsToBeDeleted = this.listItemComponents.filter(x => x.hasSecondarySelection).map(x => new ListItem(x.listItem.id, x.listItem.text));
        if (listItemsToBeDeleted.length > 0) this.deleteKeyPressedEvent.emit(listItemsToBeDeleted);
    }



    private setSelectedItems(listItem: ListItemComponent): void {
        this.addEventListeners();
        listItem.htmlElement.nativeElement.focus();

        if (this.shiftKeyDown) {
            this.onItemSelectionUsingShiftKey(listItem);
        } else if (this.ctrlKeyDown) {
            this.onItemSelectionUsingCtrlKey(listItem);
        } else {
            this.onItemSelectionUsingNoModifierKey(listItem);
        }
        this.setSecondarySelectionType();
    }



    private onItemSelectionUsingShiftKey(listItemComponent: ListItemComponent) {
        this.listItemComponents.forEach(x => {
            x.hasUnselection = false;
            x.hasPrimarySelection = false;
            x.hasSecondarySelection = false;
            x.secondarySelectionType = null;
        });
        const selectedListItemIndex = this.list.indexOf(listItemComponent.listItem);
        const pivotListItem = this.listItemComponents.find(x => x.isPivot);
        const indexOfPivotListItem = pivotListItem ? this.list.indexOf(pivotListItem.listItem) : -1;
        const start = Math.min(indexOfPivotListItem, selectedListItemIndex);
        const end = Math.max(indexOfPivotListItem, selectedListItemIndex);

        for (let i = start; i <= end; i++) {
            const itemComponent = this.listItemComponents.get(i);
            if (itemComponent !== undefined) itemComponent.hasSecondarySelection = true;
        }
        listItemComponent.hasPrimarySelection = true;
    }



    private onItemSelectionUsingCtrlKey(listItemComponent: ListItemComponent) {
        this.listItemComponents.forEach(x => {
            x.isPivot = false;
            x.hasUnselection = false;
            x.hasPrimarySelection = false;
            x.secondarySelectionType = null;
        });
        listItemComponent.isPivot = true;
        listItemComponent.hasUnselection = listItemComponent.hasSecondarySelection;
        listItemComponent.hasPrimarySelection = !listItemComponent.hasSecondarySelection;
        listItemComponent.hasSecondarySelection = !listItemComponent.hasUnselection;
    }



    private onItemSelectionUsingNoModifierKey(listItemComponent: ListItemComponent): void {
        this.resetListItemProperties();
        listItemComponent.isPivot = true;
        listItemComponent.hasPrimarySelection = true;
        listItemComponent.hasSecondarySelection = true;
    }



    private setSecondarySelectionType(): void {
        if (length !== 1) {
            const length = this.listItemComponents.length;
            const firstListItem = this.listItemComponents.first;
            const secondListItem = this.listItemComponents.get(1);
            const lastListItem = this.listItemComponents.last;
            const secondToLastListItem = this.listItemComponents.get(length - 2);

            if (secondListItem) firstListItem.setFirstListItemSecondarySelectionType(secondListItem);
            for (let i = 1; i < length - 1; i++) {
                const currentListItem = this.listItemComponents.get(i);
                const prevListItem = this.listItemComponents.get(i - 1);
                const nextListItem = this.listItemComponents.get(i + 1);
                if (prevListItem && currentListItem && nextListItem) currentListItem.setMiddleListItemSecondarySelectionType(prevListItem, nextListItem);
            }
            if (secondToLastListItem) lastListItem.setLastListItemSecondarySelectionType(secondToLastListItem);
        }
    }



    private autoselectNewListItem(): void {
        if (this.idsOfCurrentListItems.length === 0) return;
        const newListItemCount = this.list.length - this.idsOfCurrentListItems.length;
        newListItemCount > 1 ? this.autoselectMultipleListItems() : this.autoselectOneListItem();
    }



    private autoselectOneListItem(): void {
        const indexOfListItemToSelect = this.list.findIndex(item => !this.idsOfCurrentListItems.includes(item.id));
        this.autoselectListItemByIndex(indexOfListItemToSelect);
    }



    private autoselectMultipleListItems(): void {
        let listItemComponent: ListItemComponent | undefined;

        window.setTimeout(() => {
            this.list.forEach((item, index) => {
                const isNewListItem = !this.idsOfCurrentListItems.includes(item.id);
                const currentListItemComponent = this.listItemComponents.get(index);

                if (isNewListItem && currentListItemComponent) {
                    listItemComponent = currentListItemComponent;
                    listItemComponent!.hasSecondarySelection = true;
                }
            });
            this.setSecondarySelectionType();
            if (listItemComponent) listItemComponent.hasPrimarySelection = true;
            this.listItemComponents.forEach(component => (component.isDisabled = false));
        });
    }



    private autoselectEditedListItem(): void {
        if (this.idOfEditedListItem != null) {
            const indexOfListItemToSelect = this.list.findIndex(x => x.id === this.idOfEditedListItem);
            this.autoselectListItemByIndex(indexOfListItemToSelect);
        }
    }



    private autoselectNextListItemAfterDelete(): void {
        if (this.idOfNextSelectedListItemAfterDelete != null) {
            const indexOfListItemToSelect = this.list.findIndex(x => x.id === this.idOfNextSelectedListItemAfterDelete);
            this.autoselectListItemByIndex(indexOfListItemToSelect);
        }
    }



    private autoselectListItemByIndex(index: number): void {
        window.setTimeout(() => {
            const listItemComponent = this.listItemComponents.get(index);
            if (listItemComponent) listItemComponent.reselectItem(this);
        });
    }



    private resetListItemProperties(): void {
        this.listItemComponents.forEach(x => {
            x.isPivot = false;
            x.isDisabled = false;
            x.inEditMode = false;
            x.hasUnselection = false;
            x.hasPrimarySelection = false;
            x.hasSecondarySelection = false;
            x.secondarySelectionType = null;
        });
    }



    public selectListItem(listItem: ListItem): void {
        const editableListItem = this.listItemComponents.find(x => x.inEditMode);
        if (editableListItem) editableListItem.exitEditMode(this);

        const listItemComponent = this.listItemComponents.find(x => x.listItem.id == listItem.id);
        if (listItemComponent) this.setSelectedItems(listItemComponent);
    }



    public addListItem(): void {
        this.idsOfCurrentListItems = [];
        this.addEventListeners();
        this.resetListItemProperties();
        this.idOfEditedListItem = null;
        this.stopMouseDownPropagation = false;
        this.list.length == 0 ? this.idsOfCurrentListItems.push(0) : this.list.forEach(x => this.idsOfCurrentListItems.push(x.id));
        this.list.unshift(new ListItem('', ''));
        window.setTimeout(() => {
            this.listItemComponents.first.identify(this);
        })
    }



    public editListItem(): void {
        const listItem = this.listItemComponents.find(x => x.hasPrimarySelection);
        if (!listItem) return;
        this.idsOfCurrentListItems = [];
        this.idOfEditedListItem = listItem.listItem.id;
        listItem.setToEditMode(this);
    }



    public deleteListItems(): void {
        if (this.listItemComponents.find(x => x.inEditMode)) return;
        const selectedListItems = this.listItemComponents.filter(x => x.hasSecondarySelection);
        if (selectedListItems.length == 0) return;

        const indexOfPrimarySelectedListItem = this.listItemComponents.toArray().findIndex(x => x.hasPrimarySelection);
        const nextListComponent = indexOfPrimarySelectedListItem != -1 ? this.listItemComponents.toArray().slice(indexOfPrimarySelectedListItem + 1).find(x => !x.hasSecondarySelection) : null;
        this.idOfNextSelectedListItemAfterDelete = nextListComponent ? this.list.find(x => x.id == nextListComponent.listItem.id)?.id : null;

        const idsOfListItemsToBeDeleted = selectedListItems.map(x => x.listItem.id);
        this.deletedListItemsEvent.emit(idsOfListItemsToBeDeleted);
    }



    public getListItemsToBeDeleted(): void {
        const listItemsToBeDeleted = this.listItemComponents.filter(x => x.hasSecondarySelection).map(x => new ListItem(x.listItem.id, x.listItem.text));
        this.listItemsToBeDeletedEvent.emit(listItemsToBeDeleted);
    }



    public onInput(text: string) {
        if (this.list.some(listItem => listItem.text === text)) console.log('Duplicate Found');
    }



    public onTrackBy(index: number, listItem: ListItem): any {
        return listItem.id;
    }



    public reinitializeList(): void {
        this.resetListItemProperties();
        this.eventListenersAdded = false;
        window.removeEventListener('keyup', this.onKeyUp);
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('mousedown', this.onMouseDown);
    }
}