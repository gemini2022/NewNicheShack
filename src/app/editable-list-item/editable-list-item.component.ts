import { ListItem } from '../list-item';
import { CommonModule } from '@angular/common';
import { ExitEditType, SecondarySelectionType } from '../enums';
import { ListItemComponent } from '../list-item/list-item.component';
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'ns-editable-list-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './editable-list-item.component.html',
  styleUrls: ['./editable-list-item.component.scss']
})
export class EditableListItemComponent extends ListItemComponent {
  // Private
  private textCaretPosition!: Selection;
  protected listPasted: boolean = false;

  // Public
  public isNew: boolean = false;
  public isPivot: boolean = false;
  public isEnabled: boolean = true;
  public inEditMode: boolean = false;
  public hasUnselection: boolean = false;

  // Output
  @Output() public onInput: EventEmitter<string> = new EventEmitter();
  @Output() public onDoubleClick: EventEmitter<void> = new EventEmitter();
  @Output() public reinitializeList: EventEmitter<void> = new EventEmitter();
  @Output() public addedListItemEvent: EventEmitter<string> = new EventEmitter();
  @Output() public editedListItemEvent: EventEmitter<ListItem> = new EventEmitter();
  @Output() public stopMouseDownPropagation: EventEmitter<void> = new EventEmitter();
  @Output() public removeNewListItemFromList: EventEmitter<void> = new EventEmitter();
  @Output() public setListItemsEnableState: EventEmitter<boolean> = new EventEmitter();
  @Output() public pastedListItemsEvent: EventEmitter<Array<string>> = new EventEmitter();

  // View Child
  @ViewChild('listItemTextElement') protected listItemTextElement!: ElementRef<HTMLElement>;



  public identify() {
    this.isNew = true;
    this.setToEditMode();
  }



  public setToEditMode() {
    this.selectRange();
    this.inEditMode = true;
    this.getTextCaretPosition();
    this.hasPrimarySelection = false;
    this.setListItemsEnableState.emit(false);
    setTimeout(() => this.listItemTextElement.nativeElement.focus());
  }



  private selectRange() {
    const range = document.createRange();
    if (this.listItemTextElement.nativeElement.firstChild) range.selectNodeContents(this.listItemTextElement.nativeElement.firstChild);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }



  public exitEditMode(exitEditType?: ExitEditType) {
    if (this.listItemTextElement.nativeElement.innerText.trim().length > 0) {
      exitEditType === ExitEditType.Escape ? this.cancelListItemEdit() : this.completeListItemEdit();
    } else if (exitEditType !== ExitEditType.Enter) this.cancelListItemEdit();
  }



  private cancelListItemEdit(): void {
    if (this.isNew) {
      this.removeNewListItemFromList.emit();
      this.reinitializeList.emit();
    } else {
      this.listItemTextElement.nativeElement.innerText = '';

      setTimeout(() => {
        this.listItemTextElement.nativeElement.innerText = this.listItem.text;
        this.reselectItem();
      });
    }
  }



  private completeListItemEdit(): void {
    const text = this.listItemTextElement.nativeElement.innerText.trim();
    this.listItemTextElement.nativeElement.innerText = '';

    setTimeout(() => {
      this.listItemTextElement.nativeElement.innerText = text;
      if (this.isNew) {
        this.listPasted ? this.pastedListItemsEvent.emit(this.listItemTextElement.nativeElement.innerText.split('\n')) : this.addedListItemEvent.emit(this.listItemTextElement.nativeElement.innerText);
      } else {
        this.editedListItemEvent.emit(new ListItem(this.listItem.id, this.listItemTextElement.nativeElement.innerText));
      }
    });
  }



  public reselectItem(): void {
    this.isNew = false;
    this.inEditMode = false;
    this.hasPrimarySelection = true;
    this.hasSecondarySelection = true;
    this.listItemElement.nativeElement.focus();
    this.setListItemsEnableState.emit(true);
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
    if (this.listItemTextElement.nativeElement.firstChild) {
      const textContent = this.listItemTextElement.nativeElement.firstChild.textContent;
      const caretOffset = this.textCaretPosition.anchorOffset;

      if (textContent) this.listItemTextElement.nativeElement.firstChild.textContent = textContent.slice(0, caretOffset) + clipboardData + textContent.slice(this.textCaretPosition.focusOffset);

      const range = document.createRange();
      range.setStart(this.listItemTextElement.nativeElement.firstChild, caretOffset + clipboardData.length);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }

  }



  private pasteClipboardListData(clipboardListData: Array<string>): void {
    this.listPasted = true;
    const divElements: string[] = clipboardListData.map(pastedListItem => "<div class=pasted-list-item>" + pastedListItem + "</div>");
    const singleString = divElements.join("");
    this.listItemTextElement.nativeElement.innerHTML = singleString;

    // Set cursor at the end of the pasted text
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(this.listItemTextElement.nativeElement);
    range.collapse(false);
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }



  protected override onListItemDown(e: MouseEvent) {
    const rightMouseButton = 2;
    this.stopMouseDownPropagation.emit();

    // As long as this list item is (NOT) currently in edited mode
    if (!this.inEditMode) {

      // If this list item is being selected from a right mouse down
      if (e.button == rightMouseButton) console.log('right click')

      // As long as we're (NOT) right clicking on a list item that's already selected
      if (!(e.button === rightMouseButton && this.hasSecondarySelection)) {
        super.onListItemDown(e);
      }
    }
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