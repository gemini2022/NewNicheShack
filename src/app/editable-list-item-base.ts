import { ListItem } from "./list-item";
import { ListItemBase } from "./list-item-base";
import { AlertType, CaseType, ExitEditType, MouseButton, SecondarySelectionType } from "./enums";
import { Output, EventEmitter, ViewChild, ElementRef, Directive } from "@angular/core";
import { EditableListItemComponent } from "./editable-list-item/editable-list-item.component";

@Directive()
export class EditableListItemBase<T extends ListItem> extends ListItemBase<T> {
  // Private
  private caseType!: CaseType;
  private itemAdded: boolean = false;
  private multiItemPasteable!: boolean;
  private duplicateItemVerify!: boolean;
  private textCaretPosition!: Selection;

  // Protected
  protected multipleItemsPasted: boolean = false;
  protected stopItemSelectionPropagation: boolean = false;
  protected stopItemDoubleClickPropagation: boolean = false;

  // Public
  public isNew: boolean = false;
  public isPivot: boolean = false;
  public isEnabled: boolean = true;
  public inEditMode: boolean = false;
  public inAlertMode: boolean = false;
  public hasUnselection: boolean = false;

  // Output
  @Output() public onInput: EventEmitter<string> = new EventEmitter();
  @Output() public showSpinner: EventEmitter<void> = new EventEmitter();
  @Output() public editedItemEvent: EventEmitter<T> = new EventEmitter();
  @Output() public onDoubleClick: EventEmitter<void> = new EventEmitter();
  @Output() public removeNewItem: EventEmitter<void> = new EventEmitter();
  @Output() public addedItemEvent: EventEmitter<string> = new EventEmitter();
  @Output() public reinitializeItems: EventEmitter<void> = new EventEmitter();
  @Output() public stopMouseDownPropagation: EventEmitter<void> = new EventEmitter();
  @Output() public addedItemsEvent: EventEmitter<Array<string>> = new EventEmitter();
  @Output() public setAllItemsEnableState: EventEmitter<boolean> = new EventEmitter();
  @Output() public multiItemPasteAlertEvent: EventEmitter<AlertType> = new EventEmitter();

  // View Child
  @ViewChild('itemTextElement') protected itemTextElement!: ElementRef<HTMLElement>;



  public identify(caseType: CaseType, multiItemPasteable: boolean, duplicateItemVerify: boolean) {
    this.isNew = true;
    this.enterEditMode(caseType, multiItemPasteable, duplicateItemVerify);
  }



  public enterEditMode(caseType: CaseType, multiItemPasteable: boolean, duplicateItemVerify: boolean) {
    this.inEditMode = true;
    this.caseType = caseType;
    this.getTextCaretPosition();
    this.hasPrimarySelection = false;
    if (!this.isNew) this.selectRange();
    this.setAllItemsEnableState.emit(false);
    this.multiItemPasteable = multiItemPasteable;
    this.duplicateItemVerify = duplicateItemVerify;
    setTimeout(() => this.itemTextElement.nativeElement.focus());
  }



  public exitEditMode(exitEditType?: ExitEditType) {
    if (this.itemTextElement.nativeElement.innerText.trim().length > 0) {
      exitEditType === ExitEditType.Escape ? this.cancelItemEdit() : this.completeItemEdit();
    } else if (exitEditType !== ExitEditType.Enter) this.cancelItemEdit();
    if (!this.inAlertMode) this.setAllItemsEnableState.emit(true);
  }



  private cancelItemEdit(): void {
    this.onInput.emit('');
    this.inAlertMode = false;
    this.multiItemPasteAlertEvent.emit(AlertType.None);

    if (this.isNew) {
      this.removeNewItem.emit();
      this.reinitializeItems.emit();

    } else {
      const itemTextElement = this.itemTextElement;

      if (itemTextElement && itemTextElement.nativeElement) {
        itemTextElement.nativeElement.innerText = '';

        setTimeout(() => {
          itemTextElement.nativeElement.innerText = this.item.text;
          this.select();
        });
      }
    }
  }



  private completeItemEdit(): void {
    if (!this.inAlertMode) {
      if (this.isNew) {
        this.showSpinner.emit();
        if (!this.itemAdded) {
          this.itemAdded = true;
          this.multipleItemsPasted ? this.addedItemsEvent.emit(this.itemTextElement.nativeElement.innerText.split('\n')) : this.addedItemEvent.emit(this.setCase(this.itemTextElement.nativeElement.innerText.trim()));
        }

      } else {
        const text = this.setCase(this.itemTextElement.nativeElement.innerText.trim());
        this.itemTextElement.nativeElement.innerText = '';

        setTimeout(() => {
          this.itemTextElement.nativeElement.innerText = text;
          if (this.item.text != text) {
            this.showSpinner.emit();
            this.item.text = text;
            this.editedItemEvent.emit(this.item);
          } else {
            this.select();
          }
        })
      }
    }
  }



  private selectRange() {
    const itemTextElement = this.itemTextElement;

    if (itemTextElement && itemTextElement.nativeElement) {
      const firstChild = itemTextElement.nativeElement.firstChild;

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
    this.itemElement.nativeElement.focus();
  }



  public setFirstItemSecondarySelectionType(secondItem: EditableListItemComponent) {
    if (this.hasSecondarySelection && !this.hasPrimarySelection) {
      this.secondarySelectionType = secondItem.hasSecondarySelection || secondItem.hasUnselection ? SecondarySelectionType.Top : SecondarySelectionType.All;
    }
  }



  public setMiddleItemSecondarySelectionType(prevItem: EditableListItemComponent, nextItem: EditableListItemComponent) {
    if (this.hasSecondarySelection && !this.hasPrimarySelection) {
      if (!prevItem.hasSecondarySelection && nextItem.hasSecondarySelection) {
        this.secondarySelectionType = prevItem.hasUnselection ? SecondarySelectionType.Middle : SecondarySelectionType.Top;
      } else if (prevItem.hasSecondarySelection && !nextItem.hasSecondarySelection) {
        this.secondarySelectionType = nextItem.hasUnselection ? SecondarySelectionType.Middle : SecondarySelectionType.Bottom;
      } else if (!prevItem.hasSecondarySelection && !nextItem.hasSecondarySelection) {
        this.secondarySelectionType = prevItem.hasUnselection ? SecondarySelectionType.Bottom : nextItem.hasUnselection ? SecondarySelectionType.Top : SecondarySelectionType.All;
      } else if (prevItem.hasSecondarySelection && nextItem.hasSecondarySelection) {
        this.secondarySelectionType = SecondarySelectionType.Middle;
      }
    }
  }



  public setLastItemSecondarySelectionType(secondToLastItem: EditableListItemComponent) {
    if (this.hasSecondarySelection && !this.hasPrimarySelection) {
      this.secondarySelectionType = secondToLastItem.hasSecondarySelection || secondToLastItem.hasUnselection ? SecondarySelectionType.Bottom : SecondarySelectionType.All;
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
    if (!clipboardData) return;

    const clipboardListData = clipboardData.split('\n');

    if (clipboardListData.length > 1) {
      if (this.multiItemPasteable) {
        if (this.isNew) this.pasteClipboardListData(clipboardListData);
      } else {
        this.inAlertMode = true;
        this.multiItemPasteAlertEvent.emit(AlertType.MultiItemPaste);
      }

    } else {
      this.pasteClipboardData(clipboardData);
    }
  }



  private pasteClipboardData(clipboardData: string): void {
    const itemTextElement = this.itemTextElement;

    if (itemTextElement && itemTextElement.nativeElement) {
      const firstChild = itemTextElement.nativeElement.firstChild;

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
    this.multipleItemsPasted = true;
    const divElements: string[] = clipboardListData.map(pastedItem => "<div class=pasted-item>" + pastedItem + "</div>");
    const singleString = divElements.join("");
    const itemTextElement = this.itemTextElement;

    if (itemTextElement && itemTextElement.nativeElement) {
      itemTextElement.nativeElement.innerHTML = singleString;

      // Set cursor at the end of the pasted text
      const range = document.createRange();
      range.selectNodeContents(itemTextElement.nativeElement);
      range.collapse(false);
      const selection = window.getSelection();

      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }



  protected override onItemDown(e: MouseEvent) {
    this.stopMouseDownPropagation.emit();

    if (!this.inEditMode) {
      if (e.button == MouseButton.Right) console.log('right click')

      if (!(e.button === MouseButton.Right && this.hasSecondarySelection)) {
        if (this.stopItemSelectionPropagation) {
          this.stopItemSelectionPropagation = false;
          return
        }
        super.onItemDown(e);
      }
    }
  }



  protected onItemDoubleClick() {
    if (this.stopItemDoubleClickPropagation) {
      this.stopItemDoubleClickPropagation = false;
      return
    }
    this.onDoubleClick.emit();
  }



  public setEnableState(isEnabled: boolean) {
    if (!this.inEditMode) this.isEnabled = isEnabled;
  }



  public override initialize(primarySelectedItemIsBorderOnly?: boolean): void {
    super.initialize(primarySelectedItemIsBorderOnly);
    this.isPivot = false;
    this.isEnabled = true;
    this.inEditMode = false;
    this.hasUnselection = false;
  }



  private setCase(text: string): string {
    switch (this.caseType) {

      // Capitalized Case
      case CaseType.CapitalizedCase:
        text = text.toLowerCase().replace(/\b\w/g, x => x.toUpperCase());
        break;

      // Title Case
      case CaseType.TitleCase:
        text = text.toLowerCase().replace(/^\b\w|\n\w|\b(?!a\s|a\b|an\s|an\b|the\s|the\b|and\s|and\b|as\s|as\b|at\s|at\b|but\s|but\b|by\s|by\b|even\s|even\b|for\s|for\b|from\s|from\b|if\s|if\b|in\s|in\b|into\s|into\b|like\s|like\b|near\s|near\b|nor\s|nor\b|of\s|of\b|off\s|off\b|on\s|on\b|once\s|once\b|onto\s|onto\b|or\s|or\b|out\s|out\b|over\s|over\b|past\s|past\b|so\s|so\b|than\s|than\b|that\s|that\b|till\s|till\b|to\s|to\b|up\s|up\b|upon\s|upon\b|with\s|with\b|when\s|when\b|yet\s|yet\b)\w/g, x => x.toUpperCase());
        break;

      // Lower Case
      case CaseType.LowerCase:
        text = text.toLowerCase();
        break;
    }
    return text;
  }
}