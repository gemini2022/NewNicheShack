import { SecondarySelectionType } from "./enums";
import { Directive, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";

@Directive()
export class ListItemBase<T> {
  // Public
  public hasPrimarySelection: boolean = false;
  public hasSecondarySelection: boolean = false;
  public hasPrimarySelectionBorderOnly: boolean = false;
  public SecondarySelectionType = SecondarySelectionType;
  public secondarySelectionType: SecondarySelectionType | undefined | null;

  // Input
  @Input() public item!: T;

  // Output
  @Output() public onMouseDown: EventEmitter<T> = new EventEmitter();

  // View Child
  @ViewChild('itemElement') public itemElement!: ElementRef<HTMLElement>;



  protected onItemDown(e: MouseEvent) {
    this.onMouseDown.emit(this.item);
  }



  public initialize(primarySelectedItemIsBorderOnly?: boolean) {
    this.hasPrimarySelection = false;
    this.secondarySelectionType = null;
    if (!primarySelectedItemIsBorderOnly) this.hasSecondarySelection = false;
  }
}