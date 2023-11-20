import { Observable, take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { EditableListBase } from '../editable-list-base';
import { HierarchyListItem } from '../hierarchy-list-item';
import { Component, EventEmitter, Output, QueryList, ViewChildren } from '@angular/core';
import { EditableHierarchyListItemComponent } from '../editable-hierarchy-list-item/editable-hierarchy-list-item.component';

@Component({
  standalone: true,
  selector: 'ns-editable-hierarchy-list',
  templateUrl: './editable-hierarchy-list.component.html',
  styleUrls: ['./editable-hierarchy-list.component.scss'],
  imports: [CommonModule, EditableHierarchyListItemComponent]
})
export class EditableHierarchyListComponent extends EditableListBase<HierarchyListItem> {
  // Private
  private parentIndex!: number;
  private newItemAdded!: boolean;

  // Public
  public getChildItems!: (id: any, tier: number) => Observable<Array<HierarchyListItem>>;
  public postHierarchyItem!: (parentId: any, text: string, tier: number) => Observable<HierarchyListItem>;

  // Outputs
  @Output() public hierarchyCollapseStateUpdatedEvent: EventEmitter<boolean> = new EventEmitter();

  // View Children
  @ViewChildren('listItemComponent') protected editableHierarchyListItemComponents: QueryList<EditableHierarchyListItemComponent> = new QueryList<EditableHierarchyListItemComponent>();



  protected onArrowChange(parentHierarchyItem: EditableHierarchyListItemComponent) {
    this.parentIndex = this.list.indexOf(parentHierarchyItem.listItem);
    this.showHide(this.parentIndex);
    this.getHierarchyCollapseState();
    this.requestChildren(parentHierarchyItem);
    this.selectParentOnCollapse(parentHierarchyItem);
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

      this.getChildItems(parentHierarchyItem.listItem.id, parentHierarchyItem.listItem.tier)
        .pipe(take(1))
        .subscribe((childItems: Array<HierarchyListItem>) => {
          const startIndex = this.parentIndex + (this.newItemAdded ? 2 : 1);

          this.list.splice(startIndex, 0, ...childItems);

          if (this.newItemAdded) {
            setTimeout(() => {
              for (let i = startIndex; i < startIndex + childItems.length; i++) {
                this.editableHierarchyListItemComponents.get(i)!.isEnabled = false;
              }
            });
          }
          this.newItemAdded = false;
        });
    }
  }



  private selectParentOnCollapse(parentHierarchyItem: EditableHierarchyListItemComponent) {
    if (parentHierarchyItem.isArrowDown) return;

    const currentSelectedItem = this.editableHierarchyListItemComponents.find(x => x.hasPrimarySelection);
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
    const indexOfCurrentSelectedItem = this.editableHierarchyListItemComponents.toArray().findIndex(x => x.hasPrimarySelection);
    if(indexOfCurrentSelectedItem === -1) return;
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



  public override add(tier: number = 0, isParent: boolean = false): void {
    const selectedItemIndex = this.editableHierarchyListItemComponents.toArray().findIndex(x => x.hasPrimarySelection);
    this.addEventListeners();
    this.initializeListItemsInList();
    this.stopMouseDownPropagation = false;

    if (tier === 0) {
      this.insertItem(0, tier, isParent);
    } else {
      if (selectedItemIndex === -1) return;
      const currentTier = this.list[selectedItemIndex].tier;
      const insertIndex = tier > currentTier ? selectedItemIndex + 1 : this.getParentIndex(this.list[selectedItemIndex]) + 1;
      this.insertItem(insertIndex, tier, isParent);

      if (!this.editableHierarchyListItemComponents.get(selectedItemIndex)!.isArrowDown && tier > currentTier) {
        this.newItemAdded = true;
        this.editableHierarchyListItemComponents.get(selectedItemIndex)!.isArrowDown = true;
        this.onArrowChange(this.editableHierarchyListItemComponents.get(selectedItemIndex)!);
      }
    }
  }



  private insertItem(index: number, tier: number, isParent: boolean): void {
    this.list.splice(index, 0, { id: '', text: '', tier, isParent } as HierarchyListItem);
    setTimeout(() => this.editableHierarchyListItemComponents.get(index)!.identify());
  }



  protected override onItemAdded(text: string) {
    const newItemIndex = this.editableHierarchyListItemComponents.toArray().findIndex(x => x.inEditMode);
    if (newItemIndex === -1) return;
    const parentIndex = this.getParentIndex(this.list[newItemIndex]);
    const parentId = parentIndex !== -1 ? this.list[parentIndex].id : null;

    this.postHierarchyItem(parentId, text, this.list[newItemIndex].tier)
      .pipe(take(1))
      .subscribe((newHierarchyItem: HierarchyListItem) => {
        this.loading = false;
        this.list.splice(newItemIndex, 1, newHierarchyItem);
        this.sort(this.list[newItemIndex]);

        setTimeout(() => {
            const newItemComponent = this.editableHierarchyListItemComponents.find(itemComponent => itemComponent.listItem === newHierarchyItem);
            if (newItemComponent) newItemComponent.select();
        });
      })
  }



  private sort(hierarchyItem: HierarchyListItem) {
    let parentHierarchyIndex: number = -1;
    let tempArray: Array<HierarchyListItem> = [];

    if (hierarchyItem.tier === 0) {
      tempArray = this.list.filter(item => item.tier === 0);
    } else {
      parentHierarchyIndex = this.getParentIndex(hierarchyItem);
      for (let i = parentHierarchyIndex + 1; i < this.list.length; i++) {
        if (this.list[i].tier == this.list[parentHierarchyIndex].tier) break;
        if (this.list[i].tier == this.list[parentHierarchyIndex].tier + 1) {
          tempArray.push(this.list[i] as HierarchyListItem)
        }
      }
    }
    tempArray.sort((a, b) => a.text.localeCompare(b.text));

    let newHierarchyGroup: Array<HierarchyListItem> = [];
    tempArray.forEach(x => {
      let index = this.list.findIndex(y => y.id === x.id);

      for (let i = index; i < this.list.length; i++) {
        if (i != index && this.list[i].tier! <= this.list[index].tier!) break;
        newHierarchyGroup.push(this.list[i] as HierarchyListItem);
      }
    })
    this.list.splice(parentHierarchyIndex + 1, newHierarchyGroup.length, ...newHierarchyGroup);
  }



  getParentIndex(item: HierarchyListItem): number {
    let parentIndex!: number;
    const itemIndex = this.list.indexOf(item);

    for (let i = itemIndex; i >= 0; i--) {
      if (this.list[i].tier < this.list[itemIndex].tier) {
        parentIndex = i;
        break;
      }
    }
    return parentIndex;
  }
}