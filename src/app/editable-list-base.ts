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
    private editableItemComponents!: QueryList<EditableListItemComponent>;

    // Public
    public putItem!: (item: T) => Observable<void>;
    public stopMouseDownPropagation: boolean = false;
    public postItem!: (text: string) => Observable<any>;
    public deleteItems!: (ids: Array<any>) => Observable<void>;
    public postItems!: (texts: Array<string>) => Observable<Array<T>>;

    // Inputs
    @Input() public isMultiselectable: boolean = true;
    @Input() public caseType: CaseType = CaseType.None;

    // Events
    @Output() public inputTypedEvent: EventEmitter<string> = new EventEmitter();
    @Output() public deleteKeyPressedEvent: EventEmitter<Array<T>> = new EventEmitter();


    private ngAfterViewInit(): void {
        this.editableItemComponents = this.itemComponents as QueryList<EditableListItemComponent>;
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
        const itemInEditMode = this.editableItemComponents.find(x => x.inEditMode);
        itemInEditMode ? itemInEditMode.exitEditMode() : this.reinitializeItems();
    }



    private onKeyUp(e: KeyboardEvent): void {
        switch (e.key) {
            case 'Shift': case 'Control':
                if (this.isMultiselectable) e.key == 'Shift' ? this.shiftKeyDown = false : this.ctrlKeyDown = false;
                break;
        }
    }



    private onEscape(): void {
        const itemInEditMode = this.editableItemComponents.find(x => x.inEditMode);
        itemInEditMode ? itemInEditMode.exitEditMode(ExitEditType.Escape) : this.reinitializeItems();
    }



    protected override onEnter(e: KeyboardEvent): void {
        e.preventDefault();
        const itemInEditMode = this.editableItemComponents.find(x => x.inEditMode);
        if (itemInEditMode) {
            itemInEditMode.exitEditMode(ExitEditType.Enter);
        } else {
            super.onEnter(e);
        }
    }



    private emitPressedDeleteKey(): void {
        if (this.editableItemComponents.find(x => x.inEditMode)) return;
        const itemsToBeDeleted = this.editableItemComponents.filter(x => x.hasSecondarySelection).map(x => ({ id: x.item.id, text: x.item.text } as T));
        if (itemsToBeDeleted.length > 0) this.deleteKeyPressedEvent.emit(itemsToBeDeleted);
    }



    protected override onArrowKey(e: KeyboardEvent, direction: number): void {
        e.preventDefault();
        if (this.editableItemComponents.find(x => x.inEditMode)) return;
        const currentItem = this.editableItemComponents.find(x => x.hasPrimarySelection || x.hasUnselection);
        if (currentItem) this.selectItemOnArrowKey(currentItem, direction);
    }



    private setSelectedItems(item: EditableListItemComponent): void {
        if (this.shiftKeyDown) {
            this.onItemSelectionUsingShiftKey(item);
        } else if (this.ctrlKeyDown) {
            this.onItemSelectionUsingCtrlKey(item);
        } else {
            this.onItemSelectionUsingNoModifierKey(item);
        }
        this.setSecondarySelectionType();
    }



    private onItemSelectionUsingShiftKey(itemComponent: EditableListItemComponent): void {
        let selectedItems: Array<T> = new Array<T>();

        this.editableItemComponents.forEach(x => {
            x.hasUnselection = false;
            x.hasPrimarySelection = false;
            x.hasSecondarySelection = false;
            x.secondarySelectionType = null;
        });
        const selectedItemIndex = this.items.indexOf(itemComponent.item as T);
        const pivotItem = this.editableItemComponents.find(x => x.isPivot);
        const indexOfPivotItem = pivotItem ? this.items.indexOf(pivotItem.item as T) : -1;
        const start = Math.min(indexOfPivotItem, selectedItemIndex);
        const end = Math.max(indexOfPivotItem, selectedItemIndex);

        for (let i = start; i <= end; i++) {
            selectedItems.push(this.items[i] as T);
            const itemComponent = this.editableItemComponents.get(i);
            if (itemComponent !== undefined) itemComponent.hasSecondarySelection = true;
        }
        this.selectedItemsEvent.emit(selectedItems);
        itemComponent.hasPrimarySelection = true;
    }



    private onItemSelectionUsingCtrlKey(itemComponent: EditableListItemComponent): void {
        this.editableItemComponents.forEach(x => {
            x.isPivot = false;
            x.hasUnselection = false;
            x.hasPrimarySelection = false;
            x.secondarySelectionType = null;
        });
        itemComponent.isPivot = true;
        itemComponent.hasUnselection = itemComponent.hasSecondarySelection;
        itemComponent.hasPrimarySelection = !itemComponent.hasSecondarySelection;
        itemComponent.hasSecondarySelection = !itemComponent.hasUnselection;
        this.selectedItemsEvent.emit([itemComponent.item as T]);
    }



    protected override onItemSelectionUsingNoModifierKey(itemComponent: EditableListItemComponent): void {
        super.onItemSelectionUsingNoModifierKey(itemComponent);
        itemComponent.isPivot = true;
    }



    protected override setSecondarySelectionType(): void {
        if (this.items.length !== 1) {
            const secondItem = this.editableItemComponents.get(1);
            const secondToLastItem = this.editableItemComponents.get(this.items.length - 2);

            if (secondItem) this.editableItemComponents.first.setFirstItemSecondarySelectionType(secondItem);
            for (let i = 1; i < this.items.length - 1; i++) {
                const currentItem = this.editableItemComponents.get(i);
                const prevItem = this.editableItemComponents.get(i - 1);
                const nextItem = this.editableItemComponents.get(i + 1);
                if (prevItem && currentItem && nextItem) currentItem.setMiddleItemSecondarySelectionType(prevItem, nextItem);
            }
            if (secondToLastItem) this.editableItemComponents.last.setLastItemSecondarySelectionType(secondToLastItem);
        }
    }



    public override selectItem(item: T): void {
        const itemComponent = this.editableItemComponents.find(x => x.item.id == item.id);
        if (itemComponent) {
            this.addEventListeners();
            itemComponent.itemElement.nativeElement.focus();
            this.setSelectedItems(itemComponent);
        }
    }



    public add(): void {
        this.addEventListeners();
        this.initializeItems();
        this.stopMouseDownPropagation = false;
        this.items.unshift({ id: '', text: '' } as T);
        setTimeout(() => this.editableItemComponents.first.identify(this.caseType));
    }



    protected onItemAdded(text: string): void {
        this.postItem(text)
            .pipe(take(1))
            .subscribe((id: any) => {
                this.loading = false;
                const newItem = { id: id, text: text } as T;
                this.items.splice(0, 1, newItem);
                this.sort();

                setTimeout(() => {
                    const newItemComponent = this.editableItemComponents.find(itemComponent => itemComponent.item === newItem);
                    if (newItemComponent) newItemComponent.select();
                });
            })
    }



    protected onItemsAdded(texts: Array<string>): void {
        this.postItems(texts)
            .pipe(take(1))
            .subscribe((newItems: Array<T>) => {
                this.loading = false;
                newItems.forEach(newItem => {
                    this.items.push(newItem);
                })
                this.removeNewItem();
                this.sort();

                let itemComponent: EditableListItemComponent;
                setTimeout(() => {
                    this.items.forEach((item, index) => {
                        const isNewItem = newItems.includes(item);
                        const currentItemComponent = this.editableItemComponents.get(index);

                        if (isNewItem && currentItemComponent) {
                            itemComponent = currentItemComponent;
                            itemComponent.hasSecondarySelection = true;
                        }
                    });
                    this.setSecondarySelectionType();
                    if (itemComponent) itemComponent.select();
                });
            })
    }



    public edit(): void {
        const item = this.editableItemComponents.find(x => x.hasPrimarySelection);
        if (!item) return;
        item.enterEditMode(this.caseType);
    }



    protected onItemEdited(editedItem: T): void {
        this.putItem(editedItem)
            .pipe(take(1))
            .subscribe(() => {
                this.loading = false;
                this.sort(editedItem);

                setTimeout(() => {
                    const editedItemComponent = this.editableItemComponents.find(itemComponent => itemComponent.item === editedItem);
                    if (editedItemComponent) editedItemComponent.select();
                });
            })
    }



    public delete(): void {
        if (this.editableItemComponents.find(x => x.inEditMode)) return;
        const idsOfItemsToDelete = this.getIdsOfItemsToDelete();
        if (idsOfItemsToDelete.length == 0) return;
        this.loading = true;
        this.selectNextItemAfterDelete();
        this.deleteItems(idsOfItemsToDelete).pipe(take(1)).subscribe(()=> this.loading = false);
        this.items = this.items.filter(item => !idsOfItemsToDelete.includes(item.id));
    }



    protected getIdsOfItemsToDelete(): Array<any> {
        return this.editableItemComponents.filter(x => x.hasSecondarySelection).map(x => x.item.id);
    }



    protected selectNextItemAfterDelete(): void {
        const indexOfFirstSelectedItem = this.editableItemComponents.toArray().findIndex(x => x.hasSecondarySelection);
        let nextItem = this.editableItemComponents.toArray().slice(indexOfFirstSelectedItem + 1).find(x => !x.hasSecondarySelection);
        if (!nextItem) nextItem = this.editableItemComponents.toArray().reverse().find(x => !x.hasSecondarySelection);
        if (!nextItem) return;
        if (this.noSelectOnArrowKey) {
            nextItem.hasPrimarySelectionBorderOnly = true;
            this.selectItem(nextItem.item as T);
        } else {
            nextItem.select();
        }
    }



    protected sort(item?: T): void {
        this.items.sort((a, b) => a.text.localeCompare(b.text));
    }



    public getSelectedItems(): Array<T> {
        return this.editableItemComponents.filter(x => x.hasSecondarySelection).map(x => ({ id: x.item.id, text: x.item.text } as T));
    }



    protected onInput(text: string): void {
        if (this.items.some(item => item.text === text)) console.log('Duplicate Found');
    }



    protected removeNewItem(): void {
        const newItemIndex = this.editableItemComponents.toArray().findIndex(itemComponent => itemComponent.isNew);
        if (newItemIndex != -1) this.items.splice(newItemIndex, 1);
    }



    protected setAllItemsEnableState(isEnabled: boolean): void {
        this.editableItemComponents.forEach(itemComponent => itemComponent.setEnableState(isEnabled));
    }



    protected override initializeItems(primarySelectedItemIsBorderOnly?: boolean): void {
        this.editableItemComponents.forEach(itemComponent => itemComponent.initialize(primarySelectedItemIsBorderOnly));
    }



    protected reinitializeItems(): void {
        this.removeKeyupListener();
        this.removeKeydownListener();
        this.removeMousedownListener();
        this.initializeItems();
        this.eventListenersAdded = false;
    }
}