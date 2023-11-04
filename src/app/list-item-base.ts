import { SecondarySelectionType } from "./enums";
import { Directive, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";

@Directive()
export class ListItemBase<T> {
    protected stopItemSelectionPropagation: boolean = false;

  // Public
  public hasPrimarySelection: boolean = false;
  public hasSecondarySelection: boolean = false;
  public hasPrimarySelectionBorderOnly: boolean = false;
  public SecondarySelectionType = SecondarySelectionType;
  public secondarySelectionType: SecondarySelectionType | undefined | null;

  // Input
  @Input() public listItem!: T;

  // Output
  @Output() public onMouseDown: EventEmitter<T> = new EventEmitter();

  // View Child
  @ViewChild('listItemElement') public listItemElement!: ElementRef<HTMLElement>;

 

  protected onListItemDown(e: MouseEvent) {
    if (this.stopItemSelectionPropagation) {
      this.stopItemSelectionPropagation = false;
      return
    }
    this.onMouseDown.emit(this.listItem);
  }



  public initialize(primarySelectedListItemIsBorderOnly?: boolean) {
    this.hasPrimarySelection = false;
    this.secondarySelectionType = null;
    if (!primarySelectedListItemIsBorderOnly) this.hasSecondarySelection = false;
  }
}