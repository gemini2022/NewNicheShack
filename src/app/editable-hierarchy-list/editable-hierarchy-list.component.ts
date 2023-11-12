import { CommonModule } from '@angular/common';
import { EditableListBase } from '../editable-list-base';
import { HierarchyListItem } from '../hierarchy-list-item';
import { Component, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { EditableHierarchyListItemComponent } from '../editable-hierarchy-list-item/editable-hierarchy-list-item.component';

@Component({
  standalone: true,
  selector: 'ns-editable-hierarchy-list',
  templateUrl: './editable-hierarchy-list.component.html',
  styleUrls: ['./editable-hierarchy-list.component.scss'],
  imports: [CommonModule, EditableHierarchyListItemComponent]
})
export class EditableHierarchyListComponent extends EditableListBase<HierarchyListItem> {
  private parentIndex!: number;
  @Input() public children: Array<HierarchyListItem> = new Array<HierarchyListItem>();
  @Output() public hierarchyCollapseStateUpdatedEvent: EventEmitter<boolean> = new EventEmitter();
  @Output() public hierarchyChildrenRequestedEvent: EventEmitter<HierarchyListItem> = new EventEmitter();
  @ViewChildren('listItemComponent') protected editableHierarchyListItemComponents: QueryList<EditableHierarchyListItemComponent> = new QueryList<EditableHierarchyListItemComponent>();


  protected override ngOnChanges(changes: any): void {
    super.ngOnChanges(changes);
    this.addChildrenToHierarchy();
  }



  protected onArrowChange(parentHierarchyItem: EditableHierarchyListItemComponent) {
    this.parentIndex = this.list.indexOf(parentHierarchyItem.listItem);
    this.showHide(this.parentIndex);
    this.getHierarchyCollapseState();
    this.requestChildren(parentHierarchyItem);
    this.selectParentOnCollapse(parentHierarchyItem);
  }



  private addChildrenToHierarchy() {
    if (this.children.length > 0) {
      for (let i = this.children.length - 1; i >= 0; i--) {
        this.list.splice(this.parentIndex + 1, 0, this.children[i]);
      }
      this.children = [];
    }
  }



  private showHide(parentIndex: number) {
    if (parentIndex === -1) return;

    for (let i = parentIndex + 1; i < this.list.length; i++) {
      if (this.list[i].tier === this.list[parentIndex].tier + 1) {

        this.editableHierarchyListItemComponents.get(i)!.isHidden = !(this.editableHierarchyListItemComponents.get(parentIndex)!.isArrowDown && !this.editableHierarchyListItemComponents.get(parentIndex)!.isHidden);
        if (i + 1 < this.list.length && this.list[i + 1].tier > this.list[i].tier) this.showHide(i);

      } else if (this.list[i].tier <= this.list[parentIndex].tier) {
        break;
      }
    }
  }



  private requestChildren(parentHierarchyItem: EditableHierarchyListItemComponent) {
    if (parentHierarchyItem.isArrowDown && parentHierarchyItem.isArrowFirstChange) {
      parentHierarchyItem.isArrowFirstChange = false;
      this.hierarchyChildrenRequestedEvent.emit(parentHierarchyItem.listItem);
    }
  }



  private selectParentOnCollapse(parentHierarchyItem: EditableHierarchyListItemComponent) {
    if (parentHierarchyItem.isArrowDown) return;
  
    const currentSelectedItem = this.editableHierarchyListItemComponents.find(x => x.hasPrimarySelection || x.hasUnselection);
    if (!currentSelectedItem || currentSelectedItem === parentHierarchyItem) return;
  
    const indexOfParentHierarchyItem = this.list.indexOf(parentHierarchyItem.listItem);
    if (indexOfParentHierarchyItem === -1) return;
  
    const indexOfLastChild = this.list.findIndex((item, i) => i > indexOfParentHierarchyItem && (item.tier <= parentHierarchyItem.listItem.tier || i === this.list.length - 1));
    if (indexOfLastChild !== -1 && this.list.slice(indexOfParentHierarchyItem + 1, indexOfLastChild + 1).some(item => item === currentSelectedItem.listItem)) {
      super.selectListItem(parentHierarchyItem.listItem);
    }
  }



  private getHierarchyCollapseState() {
    this.hierarchyCollapseStateUpdatedEvent.emit(!this.editableHierarchyListItemComponents.some(x => x.isArrowDown));
  }



  protected setHierarchyListItemsArrowEnableState(isEnabled: boolean) {
    this.editableHierarchyListItemComponents.forEach(x => x.isArrowEnabled = isEnabled);
  }



  public override selectListItem(listItem: HierarchyListItem): void {
    const index = this.list.indexOf(listItem);

    if (!this.editableHierarchyListItemComponents.get(index)!.isHidden) {
      super.selectListItem(listItem);
      return;
    }
    this.selectNextVisibleItem(index);
  }



  private selectNextVisibleItem(indexOfNextSelectedItem: number) {
    const currentSelectedItem = this.editableHierarchyListItemComponents.find(x => x.hasPrimarySelection || x.hasUnselection);
    if (!currentSelectedItem) return;

    const indexOfCurrentSelectedItem = this.list.indexOf(currentSelectedItem.listItem);
    const direction = indexOfNextSelectedItem - indexOfCurrentSelectedItem;

    for (let i = indexOfNextSelectedItem + direction; i >= 0 && i < this.list.length; i += direction) {
      const component = this.editableHierarchyListItemComponents.get(i);
      if (component && !component.isHidden) {
        super.selectListItem(component.listItem);
        break;
      }
    }
  }



  public collapseHierarchy() {
    this.editableHierarchyListItemComponents.forEach(x => {
      x.isArrowDown = false;
      x.arrowChangedEvent.emit(x);
    })
  }
}