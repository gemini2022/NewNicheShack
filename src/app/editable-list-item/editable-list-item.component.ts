import { ListItem } from '../list-item';
import { CommonModule } from '@angular/common';
import { EditableList } from '../editable-list';
import { Component, EventEmitter, Output } from '@angular/core';
import { ListItemComponent } from '../list-item/list-item.component';
import { ArrowKeyType, ExitEditType, SecondarySelectionType } from '../enums';

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

  // Public
  public isNew: boolean = false;
  public isPivot: boolean = false;
  public isDisabled: boolean = false;
  public inEditMode: boolean = false;
  public listPasted: boolean = false;
  public hasUnselection: boolean = false;

  // Output
  @Output() public onInput: EventEmitter<string> = new EventEmitter();
  @Output() public onDoubleClick: EventEmitter<void> = new EventEmitter();
  @Output() public reinitializeList: EventEmitter<void> = new EventEmitter();
  @Output() public addedListItemEvent: EventEmitter<string> = new EventEmitter();
  @Output() public editedListItemEvent: EventEmitter<ListItem> = new EventEmitter();
  @Output() public stopMouseDownPropagation: EventEmitter<void> = new EventEmitter();
  @Output() public disableEnableListItems: EventEmitter<boolean> = new EventEmitter();
  @Output() public removeNewListItemFromList: EventEmitter<void> = new EventEmitter();
  @Output() public pastedListItemsEvent: EventEmitter<Array<string>> = new EventEmitter();


  public identify() {
    this.isNew = this.inEditMode = this.hasSecondarySelection = true;
    setTimeout(() => this.htmlElement.nativeElement.focus());
    this.disableEnableListItems.emit(true);
  }



  public setToEditMode() {
    this.inEditMode = true;
    this.hasPrimarySelection = false;
    this.disableEnableListItems.emit(true);
    this.selectRange();
    this.textCaretPosition = window.getSelection()!;
  }



  private selectRange() {
    const range = document.createRange();
    range.selectNodeContents(this.htmlElement.nativeElement.firstChild!);
    const selection = window.getSelection();
    selection!.removeAllRanges();
    selection!.addRange(range);
  }



  public exitEditMode(exitEditType?: ExitEditType) {
    if (this.htmlElement!.nativeElement.innerText.trim().length > 0) {
      exitEditType === ExitEditType.Escape ? this.cancelListItemEdit() : this.completeListItemEdit();
    } else if (exitEditType !== ExitEditType.Enter) this.cancelListItemEdit();
  }



  private cancelListItemEdit(): void {
    if (this.isNew) {
      this.removeNewListItemFromList.emit();
      this.reinitializeList.emit();
    } else {
      const text = this.htmlElement.nativeElement.innerText.trim();
      this.htmlElement!.nativeElement.innerText = '';

      setTimeout(() => {
        this.htmlElement!.nativeElement.innerText = text;
        this.reselectItem();
      });
    }
  }



  private completeListItemEdit(): void {
    const text = this.htmlElement.nativeElement.innerText.trim();
    this.htmlElement!.nativeElement.innerText = '';

    setTimeout(() => {
      this.htmlElement!.nativeElement.innerText = text;
      if (this.isNew) {
        this.listPasted ? this.pastedListItemsEvent.emit(this.htmlElement.nativeElement.innerText.split('\n')) : this.addedListItemEvent.emit(this.htmlElement.nativeElement.innerText);
      } else {
        this.editedListItemEvent.emit(new ListItem(this.listItem.id, this.htmlElement.nativeElement.innerText));
      }
    });
  }



  public reselectItem(): void {
    this.isNew = false;
    this.inEditMode = false;
    this.hasPrimarySelection = true;
    this.hasSecondarySelection = true;
    this.htmlElement!.nativeElement.focus();
    this.disableEnableListItems.emit(false);
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



  public getTextCaretPosition(): void {
    if (this.inEditMode) setTimeout(() => {
      this.textCaretPosition = window.getSelection()!
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
    const textContent = this.htmlElement.nativeElement.firstChild!.textContent!;
    const caretOffset = this.textCaretPosition.anchorOffset;

    this.htmlElement.nativeElement.firstChild!.textContent = textContent.slice(0, caretOffset) + clipboardData + textContent.slice(this.textCaretPosition.focusOffset);

    const range = document.createRange();
    range.setStart(this.htmlElement.nativeElement.firstChild!, caretOffset + clipboardData.length);
    const sel = window.getSelection();
    sel!.removeAllRanges();
    sel!.addRange(range);
  }



  private pasteClipboardListData(clipboardListData: Array<string>): void {
    this.listPasted = true;
    const divElements: string[] = clipboardListData.map(pastedListItem => "<div class=pasted-list-item>" + pastedListItem + "</div>");
    const singleString = divElements.join("");
    this.htmlElement.nativeElement.innerHTML = singleString;

    // Set cursor at the end of the pasted text
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(this.htmlElement.nativeElement);
    range.collapse(false);
    selection!.removeAllRanges();
    selection!.addRange(range);
  }



  public override onListItemDown(e: MouseEvent) {
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
}