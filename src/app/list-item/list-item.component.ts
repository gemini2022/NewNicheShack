import { List } from '../list';
import { ListItem } from '../list-item';
import { CommonModule } from '@angular/common';
import { ArrowKeyType, ExitEditType, SecondarySelectionType } from '../enums';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'ns-list-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss']
})
export class ListItemComponent {
  // Private
  private textCaretPosition!: Selection;

  // Public
  public isNew: boolean = false;
  public isPivot: boolean = false;
  public isDisabled: boolean = false;
  public inEditMode: boolean = false;
  public listPasted: boolean = false;
  public hasUnselection: boolean = false;
  public hasPrimarySelection: boolean = false;
  public hasSecondarySelection: boolean = false;
  public SecondarySelectionType = SecondarySelectionType;
  public secondarySelectionType: SecondarySelectionType | undefined | null;

  // Input
  @Input() public listItem: ListItem = new ListItem('', '');

  // Output
  @Output() public onInput: EventEmitter<string> = new EventEmitter();
  @Output() public onDoubleClick: EventEmitter<void> = new EventEmitter();
  @Output() public onMouseDown: EventEmitter<ListItem> = new EventEmitter();

  // View Child
  @ViewChild('htmlElement') htmlElement!: ElementRef<HTMLElement>;




  public identify(list: List) {
    this.isNew = this.inEditMode = this.hasSecondarySelection = true;
    window.setTimeout(() => this.htmlElement.nativeElement.focus());

    list.listItemComponents.forEach(x => {
      if (!x.inEditMode) x.isDisabled = true;
    });
  }




  public setToEditMode(list: List) {
    this.inEditMode = true;
    this.hasPrimarySelection = false;

    for (const listItem of list.listItemComponents) {
      if (!listItem.inEditMode) listItem.isDisabled = true;
    }
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







  public exitEditMode(list: List, exitEditType?: ExitEditType) {
    if (this.htmlElement!.nativeElement.innerText.trim().length > 0) {
      exitEditType === ExitEditType.Escape ? this.cancelListItemEdit(list) : this.completeListItemEdit(list);

    } else if (exitEditType !== ExitEditType.Enter) this.cancelListItemEdit(list);
  }





  private cancelListItemEdit(list: List): void {
    if (this.isNew) {
      list.list.shift();
      list.reinitializeList();
    } else {
      this.htmlElement!.nativeElement.innerText = this.listItem.text.trim();
      this.reselectItem(list);
    }
  }





  private completeListItemEdit(list: List): void {
    if (this.isNew) {
      this.listPasted ? list.pastedListItemsEvent.emit(this.htmlElement.nativeElement.innerText.split('\n')) : list.addedListItemEvent.emit(this.htmlElement.nativeElement.innerText);

    } else {
      list.editedListItemEvent.emit(new ListItem(this.listItem.id, this.htmlElement.nativeElement.innerText));
    }
  }



  public reselectItem(list: List): void {
    this.isNew = false;
    this.inEditMode = false;
    this.hasPrimarySelection = true;
    this.hasSecondarySelection = true;
    this.htmlElement!.nativeElement.focus();
    list.listItemComponents.forEach(x => x.isDisabled = false);
  }










  public setFirstListItemSecondarySelectionType(secondListItem: ListItemComponent) {
    if (this.hasSecondarySelection && !this.hasPrimarySelection) {
      this.secondarySelectionType = secondListItem.hasSecondarySelection || secondListItem.hasUnselection ? SecondarySelectionType.Top : SecondarySelectionType.All;
    }
  }



  public setMiddleListItemSecondarySelectionType(prevListItem: ListItemComponent, nextListItem: ListItemComponent) {
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



  public setLastListItemSecondarySelectionType(secondToLastListItem: ListItemComponent) {
    if (this.hasSecondarySelection && !this.hasPrimarySelection) {
      this.secondarySelectionType = secondToLastListItem.hasSecondarySelection || secondToLastListItem.hasUnselection ? SecondarySelectionType.Bottom : SecondarySelectionType.All;
    }
  }



  public onArrowKey(list: List, arrowKeyType: ArrowKeyType): void {
    if (this.inEditMode) return;
    const currentIndex = list.list.indexOf(this.listItem);
    const nextIndex = arrowKeyType === ArrowKeyType.Up ? currentIndex - 1 : currentIndex + 1;

    if (nextIndex >= 0 && nextIndex < list.list.length) {
      list.selectListItem(list.list[nextIndex]);
    }
  }



  public getTextCaretPosition(): void {
    if (this.inEditMode) window.setTimeout(() => {
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

    // Insert the clipboard data into the text
    this.htmlElement.nativeElement.firstChild!.textContent = textContent.slice(0, caretOffset) + clipboardData + textContent.slice(this.textCaretPosition.focusOffset);

    // Reposition the caret to reside after the clipboard data
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



  public onListItemDown(e: MouseEvent) {
    const rightMouseButton = 2;
    this.onMouseDown.emit();

    // As long as this list item is (NOT) currently in edited mode
    if (!this.inEditMode) {

      // If this list item is being selected from a right mouse down
      if (e.button == rightMouseButton) console.log('right click')

      // As long as we're (NOT) right clicking on a list item that's already selected
      if (!(e.button === rightMouseButton && this.hasSecondarySelection)) {
        this.onMouseDown.emit(this.listItem)
      }
    }
  }
}