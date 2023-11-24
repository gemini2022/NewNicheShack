import { ListItem } from "./list-item";
import { ListBase } from "./list-base";
import { CaseType, ExitEditType } from "./enums";
import { Directive, EventEmitter, Input, Output, QueryList } from "@angular/core";
import { EditableListItemComponent } from "./editable-list-item/editable-list-item.component";
import { Observable, take } from "rxjs";

@Directive()
export class EditableListBase<T extends ListItem> extends ListBase<T> {
    // Private
    private ctrlKeyDown: boolean = false;
    private shiftKeyDown: boolean = false;
    private removeKeyupListener!: () => void;
    private removeMousedownListener!: () => void;
    private editableListItemComponents!: QueryList<EditableListItemComponent>;

    // Public
    public putItem!: (item: T) => Observable<void>;
    public stopMouseDownPropagation: boolean = false;
    public postItem!: (text: string) => Observable<any>;
    public deleteItems!: (items: Array<T>) => Observable<void>;
    public postItems!: (texts: Array<string>) => Observable<Array<T>>;

    // Inputs
    @Input() public isMultiselectable: boolean = true;
    @Input() public caseType: CaseType = CaseType.None;

    // Events
    @Output() public inputTypedEvent: EventEmitter<string> = new EventEmitter();
    @Output() public deleteKeyPressedEvent: EventEmitter<Array<T>> = new EventEmitter();


    private ngAfterViewInit() {
        this.editableListItemComponents = this.listItemComponents as QueryList<EditableListItemComponent>;
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



    public override selectListItem(listItem: T): void {
        const listItemComponent = this.editableListItemComponents.find(x => x.listItem.id == listItem.id);
        if (listItemComponent) {
            this.addEventListeners();
            listItemComponent.listItemElement.nativeElement.focus();
            this.setSelectedItems(listItemComponent);
        }
    }



    public add(): void {
        this.addEventListeners();
        this.initializeListItemsInList();
        this.stopMouseDownPropagation = false;
        this.list.unshift({ id: '', text: '' } as T);
        setTimeout(() => this.editableListItemComponents.first.identify(this.caseType));
    }



    protected onItemAdded(text: string) {
        this.postItem(text)
            .pipe(take(1))
            .subscribe((id: any) => {
                this.loading = false;
                const newItem = { id: id, text: text } as T;
                this.list.splice(0, 1, newItem);
                this.sort();

                setTimeout(() => {
                    const newItemComponent = this.editableListItemComponents.find(itemComponent => itemComponent.listItem === newItem);
                    if (newItemComponent) newItemComponent.select();
                });
            })
    }



    protected onItemsAdded(texts: Array<string>) {
        this.postItems(texts)
            .pipe(take(1))
            .subscribe((newItems: Array<T>) => {
                this.loading = false;
                newItems.forEach(newItem => {
                    this.list.push(newItem);
                })
                this.removeNewListItemFromList();
                this.sort();

                let editableListItemComponent: EditableListItemComponent;
                setTimeout(() => {
                    this.list.forEach((item, index) => {
                        const isNewListItem = newItems.includes(item);
                        const currentListItemComponent = this.editableListItemComponents.get(index);

                        if (isNewListItem && currentListItemComponent) {
                            editableListItemComponent = currentListItemComponent;
                            editableListItemComponent.hasSecondarySelection = true;
                        }
                    });
                    this.setSecondarySelectionType();
                    if (editableListItemComponent) editableListItemComponent.select();
                });
            })
    }



    public edit(): void {
        const listItem = this.editableListItemComponents.find(x => x.hasPrimarySelection);
        if (!listItem) return;
        listItem.enterEditMode(this.caseType);
    }



    protected onItemEdited(editedItem: T) {
        this.putItem(editedItem)
            .pipe(take(1))
            .subscribe(() => {
                this.loading = false;
                this.sort(editedItem);

                setTimeout(() => {
                    const editedItemComponent = this.editableListItemComponents.find(itemComponent => itemComponent.listItem === editedItem);
                    if (editedItemComponent) editedItemComponent.select();
                });
            })
    }



    public delete(): void {
        if (this.editableListItemComponents.find(x => x.inEditMode)) return;

        const idsOfItemsToDelete = this.editableListItemComponents.filter(x => x.hasSecondarySelection).map(x => x.listItem.id);
        if (idsOfItemsToDelete.length == 0) return;

        this.loading = true;
        const indexOfPrimarySelectedItem = this.editableListItemComponents.toArray().findIndex(x => x.hasPrimarySelection);
        const nextItem = indexOfPrimarySelectedItem !== -1 ? this.editableListItemComponents.toArray().slice(indexOfPrimarySelectedItem + 1).find(x => !x.hasSecondarySelection) : null;

        if (nextItem) {
            if (this.noSelectOnArrowKey) {
                nextItem.hasPrimarySelectionBorderOnly = true;
                this.selectListItem(nextItem.listItem as T);
            } else {
                nextItem.select();
            }
        }
        this.deleteItems(idsOfItemsToDelete).pipe(take(1)).subscribe(()=> this.loading = false);
        this.list = this.list.filter(item => !idsOfItemsToDelete.includes(item.id));
    }



    protected sort(item?: T) {
        this.list.sort((a, b) => a.text.localeCompare(b.text));
    }



    public getSelectedItems(): Array<T> {
        return this.editableListItemComponents.filter(x => x.hasSecondarySelection).map(x => ({ id: x.listItem.id, text: x.listItem.text } as T));
    }



    protected onInput(text: string) {
        if (this.list.some(listItem => listItem.text === text)) console.log('Duplicate Found');
    }



    protected removeNewListItemFromList() {
        const newItemIndex = this.editableListItemComponents.toArray().findIndex(itemComponent => itemComponent.isNew);
        if (newItemIndex != -1) this.list.splice(newItemIndex, 1);
    }



    protected setListItemsEnableState(isEnabled: boolean) {
        this.editableListItemComponents.forEach(editableListItemComponent => editableListItemComponent.setEnableState(isEnabled));
    }



    protected override initializeListItemsInList(primarySelectedListItemIsBorderOnly?: boolean): void {
        this.editableListItemComponents.forEach(editableListItemComponent => editableListItemComponent.initialize(primarySelectedListItemIsBorderOnly));
    }



    protected reinitializeList(): void {
        this.removeKeyupListener();
        this.removeKeydownListener();
        this.removeMousedownListener();
        this.initializeListItemsInList();
        this.eventListenersAdded = false;
    }
}