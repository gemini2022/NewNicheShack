import { ListItem } from "./list-item";
import { ListBase } from "./list-base";
import { ExitEditType } from "./enums";
import { Directive, EventEmitter, Input, Output, QueryList } from "@angular/core";
import { EditableListItemComponent } from "./editable-list-item/editable-list-item.component";

@Directive()
export class EditableListBase<T extends ListItem> extends ListBase<T> {
    // Private
    private idOfEditedListItem: any;
    private ctrlKeyDown: boolean = false;
    private shiftKeyDown: boolean = false;
    private removeKeyupListener!: () => void;
    private removeMousedownListener!: () => void;
    private idOfNextSelectedListItemAfterDelete: any;
    private idsOfCurrentListItems: Array<any> = new Array<any>();
    private editableListItemComponents!: QueryList<EditableListItemComponent>;

    // Public
    public stopMouseDownPropagation: boolean = false;

    // Inputs
    @Input() public isMultiselectable: boolean = true;    

    // Events
    @Output() public editedListItemEvent: EventEmitter<T> = new EventEmitter();
    @Output() public inputTypedEvent: EventEmitter<string> = new EventEmitter();
    @Output() public addedListItemEvent: EventEmitter<string> = new EventEmitter();
    @Output() public deleteKeyPressedEvent: EventEmitter<Array<T>> = new EventEmitter();
    @Output() public deletedListItemsEvent: EventEmitter<Array<any>> = new EventEmitter();
    @Output() public pastedListItemsEvent: EventEmitter<Array<string>> = new EventEmitter();
    @Output() public listItemsToBeDeletedEvent: EventEmitter<Array<T>> = new EventEmitter();



    private ngAfterViewInit() {
        this.editableListItemComponents = this.listItemComponents as QueryList<EditableListItemComponent>;
    }



    protected override ngOnChanges(changes: any): void {
        super.ngOnChanges(changes);
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
                if (this.isMultiselectable) e.key == 'Shift' ? this.shiftKeyDown = true : this.ctrlKeyDown = true;
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
        const editableListItemInEditMode = this.editableListItemComponents.find(x => x.inEditMode);
        editableListItemInEditMode ? editableListItemInEditMode.exitEditMode() : this.reinitializeList();
    }



    private onKeyUp(e: KeyboardEvent): void {
        switch (e.key) {
            case 'Shift': case 'Control':
                if (this.isMultiselectable) e.key == 'Shift' ? this.shiftKeyDown = false : this.ctrlKeyDown = false;
                break;
        }
    }



    private onEscape(): void {
        const editableListItemInEditMode = this.editableListItemComponents.find(x => x.inEditMode);
        editableListItemInEditMode ? editableListItemInEditMode.exitEditMode(ExitEditType.Escape) : this.reinitializeList();
    }



    protected override onEnter(e: KeyboardEvent): void {
        e.preventDefault();
        const editableListItemInEditMode = this.editableListItemComponents.find(x => x.inEditMode);
        if (editableListItemInEditMode) {
            editableListItemInEditMode.exitEditMode(ExitEditType.Enter);
        } else {
            super.onEnter(e);
        }
    }



    private emitPressedDeleteKey(): void {
        if (this.editableListItemComponents.find(x => x.inEditMode)) return;
        const listItemsToBeDeleted = this.editableListItemComponents.filter(x => x.hasSecondarySelection).map(x => ({ id: x.listItem.id, text: x.listItem.text } as T));
        if (listItemsToBeDeleted.length > 0) this.deleteKeyPressedEvent.emit(listItemsToBeDeleted);
    }



    protected override onArrowKey(e: KeyboardEvent, direction: number): void {
        e.preventDefault();
        if (this.editableListItemComponents.find(x => x.inEditMode)) return;
        const currentListItem = this.editableListItemComponents.find(x => x.hasPrimarySelection || x.hasUnselection);
        if (currentListItem) this.selectItemOnArrowKey(currentListItem, direction);
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
        let selectedItems: Array<T> = new Array<T>();

        this.editableListItemComponents.forEach(x => {
            x.hasUnselection = false;
            x.hasPrimarySelection = false;
            x.hasSecondarySelection = false;
            x.secondarySelectionType = null;
        });
        const selectedListItemIndex = this.list.indexOf(editableListItemComponent.listItem as T);
        const pivotListItem = this.editableListItemComponents.find(x => x.isPivot);
        const indexOfPivotListItem = pivotListItem ? this.list.indexOf(pivotListItem.listItem as T) : -1;
        const start = Math.min(indexOfPivotListItem, selectedListItemIndex);
        const end = Math.max(indexOfPivotListItem, selectedListItemIndex);

        for (let i = start; i <= end; i++) {
            selectedItems.push(this.list[i] as T);
            const itemComponent = this.editableListItemComponents.get(i);
            if (itemComponent !== undefined) itemComponent.hasSecondarySelection = true;
        }
        this.selectedItemsEvent.emit(selectedItems);
        editableListItemComponent.hasPrimarySelection = true;
    }



    private onItemSelectionUsingCtrlKey(editableListItemComponent: EditableListItemComponent) {
        this.editableListItemComponents.forEach(x => {
            x.isPivot = false;
            x.hasUnselection = false;
            x.hasPrimarySelection = false;
            x.secondarySelectionType = null;
        });
        editableListItemComponent.isPivot = true;
        editableListItemComponent.hasUnselection = editableListItemComponent.hasSecondarySelection;
        editableListItemComponent.hasPrimarySelection = !editableListItemComponent.hasSecondarySelection;
        editableListItemComponent.hasSecondarySelection = !editableListItemComponent.hasUnselection;
        this.selectedItemsEvent.emit([editableListItemComponent.listItem as T]);
    }



    protected override onItemSelectionUsingNoModifierKey(editableListItemComponent: EditableListItemComponent): void {
        super.onItemSelectionUsingNoModifierKey(editableListItemComponent);
        editableListItemComponent.isPivot = true;
    }



    protected override setSecondarySelectionType(): void {
        if (this.list.length !== 1) {
            const secondListItem = this.editableListItemComponents.get(1);
            const secondToLastListItem = this.editableListItemComponents.get(this.list.length - 2);

            if (secondListItem) this.editableListItemComponents.first.setFirstListItemSecondarySelectionType(secondListItem);
            for (let i = 1; i < this.list.length - 1; i++) {
                const currentListItem = this.editableListItemComponents.get(i);
                const prevListItem = this.editableListItemComponents.get(i - 1);
                const nextListItem = this.editableListItemComponents.get(i + 1);
                if (prevListItem && currentListItem && nextListItem) currentListItem.setMiddleListItemSecondarySelectionType(prevListItem, nextListItem);
            }
            if (secondToLastListItem) this.editableListItemComponents.last.setLastListItemSecondarySelectionType(secondToLastListItem);
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
        let editableListItemComponent: EditableListItemComponent;

        setTimeout(() => {
            this.list.forEach((item, index) => {
                const isNewListItem = !this.idsOfCurrentListItems.includes(item.id);
                const currentListItemComponent = this.editableListItemComponents.get(index);

                if (isNewListItem && currentListItemComponent) {
                    editableListItemComponent = currentListItemComponent;
                    editableListItemComponent.hasSecondarySelection = true;
                }
            });
            this.setSecondarySelectionType();
            editableListItemComponent.hasPrimarySelection = true;
            this.editableListItemComponents.forEach(x => x.isEnabled = true);
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
            const editableListItemComponent = this.editableListItemComponents.get(index);
            if (editableListItemComponent) editableListItemComponent.reselectItem();
        });
    }



    public override selectListItem(listItem: T): void {
        const listItemComponent = this.editableListItemComponents.find(x => x.listItem.id == listItem.id);
        if (listItemComponent) {
            this.addEventListeners();
            listItemComponent.listItemElement.nativeElement.focus();
            this.setSelectedItems(listItemComponent);
        }
        const editableListItemInEditMode = this.editableListItemComponents.find(x => x.inEditMode);
        if (editableListItemInEditMode) editableListItemInEditMode.exitEditMode();
    }



    public addListItem(): void {
        this.idsOfCurrentListItems = [];
        this.addEventListeners();
        this.initializeListItemsInList();
        this.idOfEditedListItem = null;
        this.stopMouseDownPropagation = false;
        this.list.length == 0 ? this.idsOfCurrentListItems.push(0) : this.list.forEach(x => this.idsOfCurrentListItems.push(x.id));
        this.list.unshift(({ id: '', text: '' } as T));
        setTimeout(() => {
            this.editableListItemComponents.first.identify();
        })
    }



    public editListItem(): void {
        const listItem = this.editableListItemComponents.find(x => x.hasPrimarySelection);
        if (!listItem) return;
        this.idsOfCurrentListItems = [];
        this.idOfEditedListItem = listItem.listItem.id;
        listItem.setToEditMode();
    }



    public deleteListItems(): void {
        if (this.editableListItemComponents.find(x => x.inEditMode)) return;
        const selectedListItems = this.editableListItemComponents.filter(x => x.hasSecondarySelection);
        if (selectedListItems.length == 0) return;

        const indexOfPrimarySelectedListItem = this.editableListItemComponents.toArray().findIndex(x => x.hasPrimarySelection);
        const nextListComponent = indexOfPrimarySelectedListItem != -1 ? this.editableListItemComponents.toArray().slice(indexOfPrimarySelectedListItem + 1).find(x => !x.hasSecondarySelection) : null;
        this.idOfNextSelectedListItemAfterDelete = nextListComponent ? this.list.find(x => x.id == nextListComponent.listItem.id)?.id : null;

        const idsOfListItemsToBeDeleted = selectedListItems.map(x => x.listItem.id);
        this.deletedListItemsEvent.emit(idsOfListItemsToBeDeleted);
    }



    public getListItemsToBeDeleted(): void {
        const listItemsToBeDeleted = this.editableListItemComponents.filter(x => x.hasSecondarySelection).map(x => ({ id: x.listItem.id, text: x.listItem.text } as T));
        this.listItemsToBeDeletedEvent.emit(listItemsToBeDeleted);
    }



    public onInput(text: string) {
        if (this.list.some(listItem => listItem.text === text)) console.log('Duplicate Found');
    }



    public onTrackBy(index: number, listItem: T): any {
        return listItem.id;
    }



    public removeNewListItemFromList() {
        this.list.shift();
    }



    public setListItemsEnableState(isEnabled: boolean) {
        this.editableListItemComponents.forEach(x => x.setEnableState(isEnabled));
    }



    protected override initializeListItemsInList(primarySelectedListItemIsBorderOnly?: boolean): void {
        this.editableListItemComponents.forEach(x => x.initialize(primarySelectedListItemIsBorderOnly));
    }



    public reinitializeList(): void {
        this.removeKeyupListener();
        this.removeKeydownListener();
        this.removeMousedownListener();
        this.initializeListItemsInList();
        this.eventListenersAdded = false;
    }
}