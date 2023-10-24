import { List } from "./list";
import { ListItem } from "./list-item";
import { ArrowKeyType, ExitEditType } from "./enums";
import { Directive, EventEmitter, Output } from "@angular/core";
import { EditableListItemComponent } from "./editable-list-item/editable-list-item.component";
import { ListItemComponent } from "./list-item/list-item.component";

@Directive()
export class EditableList extends List {
    // Private
    private idOfEditedListItem: any;
    private ctrlKeyDown: boolean = false;
    private shiftKeyDown: boolean = false;
    private removeKeyupListener!: () => void;
    private removeMousedownListener!: () => void;
    private idOfNextSelectedListItemAfterDelete: any;
    private idsOfCurrentListItems: Array<any> = new Array<any>();

    // Public
    public stopMouseDownPropagation: boolean = false;

    // Events
    @Output() public inputTypedEvent: EventEmitter<string> = new EventEmitter();
    @Output() public addedListItemEvent: EventEmitter<string> = new EventEmitter();
    @Output() public editedListItemEvent: EventEmitter<ListItem> = new EventEmitter();
    @Output() public deletedListItemsEvent: EventEmitter<Array<any>> = new EventEmitter();
    @Output() public pastedListItemsEvent: EventEmitter<Array<string>> = new EventEmitter();
    @Output() public deleteKeyPressedEvent: EventEmitter<Array<ListItem>> = new EventEmitter();
    @Output() public listItemsToBeDeletedEvent: EventEmitter<Array<ListItem>> = new EventEmitter();



    protected override ngOnChanges(): void {
        super.ngOnChanges();
        this.autoselectNewListItem();
        this.autoselectEditedListItem();
        this.autoselectNextListItemAfterDelete();
    }



    protected override addEventListeners(): void {
        if (this.eventListenersAdded) return;
        super.addEventListeners();
        this.removeMousedownListener = this.renderer.listen('window', 'mousedown', () => this.onMouseDown());
        this.removeKeyupListener = this.renderer.listen('window', 'keyup', (e: KeyboardEvent) => this.onKeyUp(e));
    }



    protected override onKeyDown(e: KeyboardEvent): void {
        super.onKeyDown(e);
        switch (e.key) {
            case 'Escape':
                this.onEscape();
                break;
            case 'Shift': case 'Control':
                e.key == 'Shift' ? this.shiftKeyDown = true : this.ctrlKeyDown = true;
                break;
            case 'Delete':
                this.emitPressedDeleteKey();
                break;
        }
    }



    private onMouseDown(): void {
        if (this.stopMouseDownPropagation) {
            this.stopMouseDownPropagation = false;
            return
        }
        const editableListItemInEditMode = this.listItemComponents.find(x => (x as EditableListItemComponent).inEditMode) as EditableListItemComponent;
        editableListItemInEditMode ? editableListItemInEditMode.exitEditMode() : this.reinitializeList();
    }



    private onKeyUp(e: KeyboardEvent): void {
        switch (e.key) {
            case 'Shift': case 'Control':
                e.key == 'Shift' ? this.shiftKeyDown = false : this.ctrlKeyDown = false;
                break;
        }
    }



    private onEscape(): void {
        const editableListItemInEditMode = this.listItemComponents.find(x => (x as EditableListItemComponent).inEditMode) as EditableListItemComponent;
        editableListItemInEditMode ? editableListItemInEditMode.exitEditMode(ExitEditType.Escape) : this.reinitializeList();
    }



    protected override onEnter(e: KeyboardEvent): void {
        e.preventDefault();
        const editableListItemInEditMode = this.listItemComponents.find(x => (x as EditableListItemComponent).inEditMode) as EditableListItemComponent;
        if (editableListItemInEditMode) {
            editableListItemInEditMode.exitEditMode(ExitEditType.Enter);
        } else {
            super.onEnter(e);
        }
    }



    private emitPressedDeleteKey(): void {
        if (this.listItemComponents.find(x => (x as EditableListItemComponent).inEditMode)) return;
        const listItemsToBeDeleted = this.listItemComponents.filter(x => x.hasSecondarySelection).map(x => new ListItem(x.listItem.id, x.listItem.text));
        if (listItemsToBeDeleted.length > 0) this.deleteKeyPressedEvent.emit(listItemsToBeDeleted);
    }



    protected override onArrowKey(e: KeyboardEvent, arrowKeyType: ArrowKeyType): void {
        e.preventDefault();
        if (this.listItemComponents.find(x => (x as EditableListItemComponent).inEditMode)) return;
        const currentListItem = this.listItemComponents.find(x => x.hasPrimarySelection || (x as EditableListItemComponent).hasUnselection);
        if (currentListItem) this.selectItemOnArrowKey(currentListItem, arrowKeyType);
    }



    private setSelectedItems(listItem: EditableListItemComponent): void {
        if (this.shiftKeyDown) {
            this.onItemSelectionUsingShiftKey(listItem);
        } else if (this.ctrlKeyDown) {
            this.onItemSelectionUsingCtrlKey(listItem);
        } else {
            this.onItemSelectionUsingNoModifierKey(listItem);
        }
        this.setSecondarySelectionType();
    }



    private onItemSelectionUsingShiftKey(editableListItemComponent: EditableListItemComponent) {
        let selectedItems: Array<ListItem> = new Array<ListItem>();

        this.listItemComponents.forEach(x => {
            (x as EditableListItemComponent).hasUnselection = false;
            x.hasPrimarySelection = false;
            x.hasSecondarySelection = false;
            x.secondarySelectionType = null;
        });
        const selectedListItemIndex = this.list.indexOf(editableListItemComponent.listItem);
        const pivotListItem = this.listItemComponents.find(x => (x as EditableListItemComponent).isPivot);
        const indexOfPivotListItem = pivotListItem ? this.list.indexOf(pivotListItem.listItem) : -1;
        const start = Math.min(indexOfPivotListItem, selectedListItemIndex);
        const end = Math.max(indexOfPivotListItem, selectedListItemIndex);

        for (let i = start; i <= end; i++) {
            selectedItems.push(this.list[i]);
            const itemComponent = this.listItemComponents.get(i);
            if (itemComponent !== undefined) itemComponent.hasSecondarySelection = true;
        }
        this.selectedItemsEvent.emit(selectedItems);
        editableListItemComponent.hasPrimarySelection = true;
    }



    private onItemSelectionUsingCtrlKey(editableListItemComponent: EditableListItemComponent) {
        this.listItemComponents.forEach(x => {
            (x as EditableListItemComponent).isPivot = false;
            (x as EditableListItemComponent).hasUnselection = false;
            x.hasPrimarySelection = false;
            x.secondarySelectionType = null;
        });
        editableListItemComponent.isPivot = true;
        editableListItemComponent.hasUnselection = editableListItemComponent.hasSecondarySelection;
        editableListItemComponent.hasPrimarySelection = !editableListItemComponent.hasSecondarySelection;
        editableListItemComponent.hasSecondarySelection = !editableListItemComponent.hasUnselection;
        this.selectedItemsEvent.emit([editableListItemComponent.listItem]);
    }



    protected override onItemSelectionUsingNoModifierKey(editableListItemComponent: EditableListItemComponent): void {
        super.onItemSelectionUsingNoModifierKey(editableListItemComponent);
        editableListItemComponent.isPivot = true;
    }



    protected override setSecondarySelectionType(): void {
        if (this.list.length !== 1) {
            const length = this.listItemComponents.length;
            const firstListItem = this.listItemComponents.first as EditableListItemComponent;
            const secondListItem = this.listItemComponents.get(1) as EditableListItemComponent;
            const lastListItem = this.listItemComponents.last as EditableListItemComponent;
            const secondToLastListItem = this.listItemComponents.get(length - 2) as EditableListItemComponent;

            if (secondListItem) firstListItem.setFirstListItemSecondarySelectionType(secondListItem);
            for (let i = 1; i < length - 1; i++) {
                const currentListItem = this.listItemComponents.get(i) as EditableListItemComponent;
                const prevListItem = this.listItemComponents.get(i - 1) as EditableListItemComponent;
                const nextListItem = this.listItemComponents.get(i + 1) as EditableListItemComponent;
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
        let editableListItemComponent: EditableListItemComponent | undefined;

        setTimeout(() => {
            this.list.forEach((item, index) => {
                const isNewListItem = !this.idsOfCurrentListItems.includes(item.id);
                const currentListItemComponent = this.listItemComponents.get(index) as EditableListItemComponent;

                if (isNewListItem && currentListItemComponent) {
                    editableListItemComponent = currentListItemComponent;
                    editableListItemComponent!.hasSecondarySelection = true;
                }
            });
            this.setSecondarySelectionType();
            if (editableListItemComponent) editableListItemComponent.hasPrimarySelection = true;
            this.listItemComponents.forEach(component => (component as EditableListItemComponent).isDisabled = false);
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
        setTimeout(() => {
            const editableListItemComponent = this.listItemComponents.get(index) as EditableListItemComponent;
            if (editableListItemComponent) editableListItemComponent.reselectItem();
        });
    }



    protected override initializeProperties(listItemComponent: ListItemComponent, primarySelectedListItemIsBorderOnly?: boolean): void {
        super.initializeProperties(listItemComponent,primarySelectedListItemIsBorderOnly);
        (listItemComponent as EditableListItemComponent).isPivot = false;
        (listItemComponent as EditableListItemComponent).isDisabled = false;
        (listItemComponent as EditableListItemComponent).inEditMode = false;
        (listItemComponent as EditableListItemComponent).hasUnselection = false;
    }



    public override selectListItem(listItem: ListItem): void {
        const listItemComponent = this.listItemComponents.find(x => x.listItem.id == listItem.id) as EditableListItemComponent;
        if (listItemComponent) {
            this.addEventListeners();
            listItemComponent.htmlElement.nativeElement.focus();
            this.setSelectedItems(listItemComponent);
        }
        const editableListItemInEditMode = this.listItemComponents.find(x => (x as EditableListItemComponent).inEditMode) as EditableListItemComponent;
        if (editableListItemInEditMode) editableListItemInEditMode.exitEditMode();
    }



    public addListItem(): void {
        this.idsOfCurrentListItems = [];
        this.addEventListeners();
        this.resetListItemProperties();
        this.idOfEditedListItem = null;
        this.stopMouseDownPropagation = false;
        this.list.length == 0 ? this.idsOfCurrentListItems.push(0) : this.list.forEach(x => this.idsOfCurrentListItems.push(x.id));
        this.list.unshift(new ListItem('', ''));
        setTimeout(() => {
            (this.listItemComponents.first as EditableListItemComponent).identify();
        })
    }



    public editListItem(): void {
        const listItem = this.listItemComponents.find(x => x.hasPrimarySelection) as EditableListItemComponent;
        if (!listItem) return;
        this.idsOfCurrentListItems = [];
        this.idOfEditedListItem = listItem.listItem.id;
        listItem.setToEditMode();
    }



    public deleteListItems(): void {
        if (this.listItemComponents.find(x => (x as EditableListItemComponent).inEditMode)) return;
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



    public removeNewListItemFromList() {
        this.list.shift();
    }



    public disableEnableListItems(isDisabled: boolean) {
        this.listItemComponents.forEach(x => {
            if (!(x as EditableListItemComponent).inEditMode) (x as EditableListItemComponent).isDisabled = isDisabled;
        });
    }



    public reinitializeList(): void {
        this.removeKeyupListener();
        this.removeKeydownListener();
        this.removeMousedownListener();
        this.resetListItemProperties();
        this.eventListenersAdded = false;
    }
}