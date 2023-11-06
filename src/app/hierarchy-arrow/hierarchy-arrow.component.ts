import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ns-hierarchy-arrow',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hierarchy-arrow.component.html',
  styleUrls: ['./hierarchy-arrow.component.scss']
})
export class HierarchyArrowComponent {
  // Inputs
  @Input() public isEnabled: boolean = true;
  @Input() public isArrowDown: boolean = false;
  @Input() public disabledOpacity: number = 0.25;

  // Outputs
  @Output() public arrowChangedEvent: EventEmitter<boolean> = new EventEmitter();


  protected onArrowChange (): void {
    if (this.isEnabled) {
      this.isArrowDown = !this.isArrowDown;
      this.arrowChangedEvent.emit(this.isArrowDown);
    }
  }
}