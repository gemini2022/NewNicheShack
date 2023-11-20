import { ListItem } from "./list-item";
import { ListItemBase } from "./list-item-base";
import { ExitEditType, SecondarySelectionType } from "./enums";
import { Output, EventEmitter, ViewChild, ElementRef, Directive } from "@angular/core";
import { EditableListItemComponent } from "./editable-list-item/editable-list-item.component";

@Directive()
export class EditableListItemBase<T extends ListItem> extends ListItemBase<T> {
  // Private
  private itemAdded: boolean = false;
  private textCaretPosition!: Selection;
  protected listPasted: boolean = false;
  protected stopListItemSelectionPropagation: boolean = false;
  protected stopListItemDoubleClickPropagation: boolean = false;

  // Public
  public isNew: boolean = false;
  public isPivot: boolean = false;
  public isEnabled: boolean = true;
  public inEditMode: boolean = false;
  public hasUnselection: boolean = false;

  // Output
  @Output() public onInput: EventEmitter<string> = new EventEmitter();
  @Output() public showSpinner: EventEmitter<void> = new EventEmitter();
  @Output() public onDoubleClick: EventEmitter<void> = new EventEmitter();
  @Output() public reinitializeList: EventEmitter<void> = new EventEmitter();
  @Output() public editedItemEvent: EventEmitter<T> = new EventEmitter();
  @Output() public addedItemEvent: EventEmitter<string> = new EventEmitter();
  @Output() public stopMouseDownPropagation: EventEmitter<void> = new EventEmitter();
  @Output() public removeNewListItemFromList: EventEmitter<void> = new EventEmitter();
  @Output() public setListItemsEnableState: EventEmitter<boolean> = new EventEmitter();
  @Output() public addedItemsEvent: EventEmitter<Array<string>> = new EventEmitter();

  // View Child
  @ViewChild('listItemTextElement') protected listItemTextElement!: ElementRef<HTMLElement>;



  public identify() {
    this.isNew = true;
    this.enterEditMode();
  }



  public enterEditMode() {
    this.inEditMode = true;
    this.getTextCaretPosition();
    this.hasPrimarySelection = false;
    if (!this.isNew) this.selectRange();
    this.setListItemsEnableState.emit(false);
    setTimeout(() => this.listItemTextElement.nativeElement.focus());
  }



  public exitEditMode(exitEditType?: ExitEditType) {
    if (this.listItemTextElement.nativeElement.innerText.trim().length > 0) {
      exitEditType === ExitEditType.Escape ? this.cancelListItemEdit() : this.completeListItemEdit();
    } else if (exitEditType !== ExitEditType.Enter) this.cancelListItemEdit();
    this.setListItemsEnableState.emit(true);
  }



  private cancelListItemEdit(): void {
    if (this.isNew) {
      this.removeNewListItemFromList.emit();
      this.reinitializeList.emit();
    } else {
      const listItemTextElement = this.listItemTextElement;

      if (listItemTextElement && listItemTextElement.nativeElement) {
        listItemTextElement.nativeElement.innerText = '';

        setTimeout(() => {
          listItemTextElement.nativeElement.innerText = this.listItem.text;
          this.select();
        });
      }
    }
  }



  private completeListItemEdit(): void {
    if (this.isNew) {
      this.showSpinner.emit();
      if (!this.itemAdded) {
        this.itemAdded = true;
        this.listPasted ? this.addedItemsEvent.emit(this.listItemTextElement.nativeElement.innerText.split('\n')) : this.addedItemEvent.emit(this.listItemTextElement.nativeElement.innerText);
      }

    } else {
      const text = this.listItemTextElement.nativeElement.innerText.trim();
      this.listItemTextElement.nativeElement.innerText = '';

      setTimeout(() => {
        this.listItemTextElement.nativeElement.innerText = text;
        if (this.listItem.text != text) {
          this.showSpinner.emit();
          this.editedItemEvent.emit(({ id: this.listItem.id, text: text } as T));
        } else {
          this.select();
        }
      })
    }
  }



  private selectRange() {
    const listItemTextElement = this.listItemTextElement;

    if (listItemTextElement && listItemTextElement.nativeElement) {
      const firstChild = listItemTextElement.nativeElement.firstChild;

      if (firstChild) {
        const range = document.createRange();
        range.selectNodeContents(firstChild);
        const selection = window.getSelection();

        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }
  }



  public select(): void {
    this.isNew = false;
    this.inEditMode = false;
    this.hasPrimarySelection = true;
    this.hasSecondarySelection = true;
    this.listItemElement.nativeElement.focus();
  }



  public setFirstListItemSecondarySelectionType(secondListItem: EditableListItemComponent) {
    if (this.hasSecondarySelection && !this.hasPrimarySelection) {
      this.secondarySelectionType = secondListItem.hasSecondarySelection || secondListItem.hasUnselection ? SecondarySelectionType.Top : SecondarySelectionType.All;
    }
  }



  public setMiddleListItemSecondarySelectionType(prevListItem: EditableListItemComponent, nextListItem: EditableListItemComponent) {
    if (this.hasSecondarySelection && !this.hasPrimarySelection) {
      if (!prevListItem.hasSecondarySelection && nextListItem.hasSecondarySelection) {
        this.secondarySelectionType = prevListItem.hasUnselection ? SecondarySelectionType.Middle : SecondarySelectionType.Top;
      } else if (prevListItem.hasSecondarySelection && !nextListItem.hasSecondarySelection) {
        this.secondarySelectionType = nextListItem.hasUnselection ? SecondarySelectionType.Middle : SecondarySelectionType.Bottom;
      } else if (!prevListItem.hasSecondarySelection && !nextListItem.hasSecondarySelection) {
        this.secondarySelectionType = prevListItem.hasUnselection ? SecondarySelectionType.Bottom : nextListItem.hasUnselection ? SecondarySelectionType.Top : SecondarySelectionType.All;
      } else if (prevListItem.hasSecondarySelection && nextListItem.hasSecondarySelection) {
        this.secondarySelectionType = SecondarySelectionType.Middle;
      }
    }
  }



  public setLastListItemSecondarySelectionType(secondToLastListItem: EditableListItemComponent) {
    if (this.hasSecondarySelection && !this.hasPrimarySelection) {
      this.secondarySelectionType = secondToLastListItem.hasSecondarySelection || secondToLastListItem.hasUnselection ? SecondarySelectionType.Bottom : SecondarySelectionType.All;
    }
  }



  protected getTextCaretPosition(): void {
    if (this.inEditMode) setTimeout(() => {
      this.textCaretPosition = window.getSelection()!;
    });
  }



  public onPaste = (e: Event): void => {
    e.preventDefault();
    if (!this.inEditMode) return;

    const clipboardData = (e as ClipboardEvent).clipboardData?.getData('text/plain').trim();
    if (!clipboardData) return

    const clipboardDataList = clipboardData.split('\n');

    if (!this.isNew) {
      if (clipboardDataList.length == 1) this.pasteClipboardData(clipboardData);
    } else {

      clipboardDataList.length > 1 ? this.pasteClipboardListData(clipboardDataList) : this.pasteClipboardData(clipboardData);
    }
  }



  private pasteClipboardData(clipboardData: string): void {
    const listItemTextElement = this.listItemTextElement;

    if (listItemTextElement && listItemTextElement.nativeElement) {
      const firstChild = listItemTextElement.nativeElement.firstChild;

      if (firstChild) {
        const textContent = firstChild.textContent;
        const caretOffset = this.textCaretPosition.anchorOffset;

        if (textContent !== null) {
          const updatedTextContent = textContent.slice(0, caretOffset) + clipboardData + textContent.slice(this.textCaretPosition.focusOffset);

          firstChild.textContent = updatedTextContent;

          const range = document.createRange();
          range.setStart(firstChild, caretOffset + clipboardData.length);
          const sel = window.getSelection();

          if (sel) {
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }
      }
    }
  }



  private pasteClipboardListData(clipboardListData: Array<string>): void {
    this.listPasted = true;
    const divElements: string[] = clipboardListData.map(pastedListItem => "<div class=pasted-list-item>" + pastedListItem + "</div>");
    const singleString = divElements.join("");
    const listItemTextElement = this.listItemTextElement;

    if (listItemTextElement && listItemTextElement.nativeElement) {
      listItemTextElement.nativeElement.innerHTML = singleString;

      // Set cursor at the end of the pasted text
      const range = document.createRange();
      range.selectNodeContents(listItemTextElement.nativeElement);
      range.collapse(false);
      const selection = window.getSelection();

      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }



  protected override onListItemDown(e: MouseEvent) {
    const rightMouseButton = 2;
    this.stopMouseDownPropagation.emit();

    if (!this.inEditMode) {
      if (e.button == rightMouseButton) console.log('right click')

      if (!(e.button === rightMouseButton && this.hasSecondarySelection)) {
        if (this.stopListItemSelectionPropagation) {
          this.stopListItemSelectionPropagation = false;
          return
        }
        super.onListItemDown(e);
      }
    }
  }



  protected onListItemDoubleClick() {
    if (this.stopListItemDoubleClickPropagation) {
      this.stopListItemDoubleClickPropagation = false;
      return
    }
    this.onDoubleClick.emit();
  }



  public setEnableState(isEnabled: boolean) {
    if (!this.inEditMode) this.isEnabled = isEnabled;
  }



  public override initialize(primarySelectedListItemIsBorderOnly?: boolean): void {
    super.initialize(primarySelectedListItemIsBorderOnly);
    this.isPivot = false;
    this.isEnabled = true;
    this.inEditMode = false;
    this.hasUnselection = false;
  }
}