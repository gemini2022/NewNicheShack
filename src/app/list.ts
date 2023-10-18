import { ListItem } from "./list-item";
import { ArrowKeyType } from "./enums";
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



    protected addEventListeners(): void {
        if (this.eventListenersAdded) return;
        this.eventListenersAdded = true;
        this.removeKeydownListener = this.renderer.listen('window', 'keydown', (e: KeyboardEvent) => this.onKeyDown(e));
    }



    protected onKeyDown(e: KeyboardEvent): void {
        switch (e.key) {
            case 'ArrowUp':
                this.onArrowKey(e, ArrowKeyType.Up);
                break;
            case 'ArrowDown':
                this.onArrowKey(e, ArrowKeyType.Down);
                break;
        }
    }



    protected onArrowKey(e: KeyboardEvent, arrowKeyType: ArrowKeyType): void {
        e.preventDefault();
        const currentListItem = this.listItemComponents.find(x => x.hasPrimarySelection);
        if (currentListItem) currentListItem.onArrowKey(this, arrowKeyType);
    }



    private load(): void {
        this._loading = true;
        this.loadListEvent.emit();
    }



    private onLoadComplete(): void {
        if (this._loading && this.list.length > 0) this._loading = false;
    }



    protected setSelectedItems(listItemComponent: ListItemComponent): void {
        this.listItemComponents.forEach(x => {
            x.hasPrimarySelection = false;
        });
        listItemComponent.hasPrimarySelection = true;
    }



    public selectListItem(listItem: ListItem): void {
        const listItemComponent = this.listItemComponents.find(x => x.listItem.id == listItem.id);
        if (listItemComponent) {
            this.addEventListeners();
            listItemComponent.htmlElement.nativeElement.focus();
            this.setSelectedItems(listItemComponent);
        }
    }
}