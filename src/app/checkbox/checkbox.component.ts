import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'ns-checkbox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss']
})
export class CheckboxComponent {
  // Inputs
  @Input() public label!: string;
  @Input() public isChecked!: boolean;
  @Input() public spaceBetween!: boolean;
  @Input() public isEnabled: boolean = true;
  @Input() public labelRight: boolean = true;
  @Input() public disabledOpacity: number = 0.25;

  // Outputs
  @Output() public checkboxChangedEvent: EventEmitter<boolean> = new EventEmitter();

  // View Child
  @ViewChild('tabElement') public tabElement!: ElementRef<HTMLElement>;


  protected onCheckboxChange (): void {
    if (this.isEnabled) {
      this.isChecked = !this.isChecked;
      this.checkboxChangedEvent.emit(this.isChecked);
    }
  }
}