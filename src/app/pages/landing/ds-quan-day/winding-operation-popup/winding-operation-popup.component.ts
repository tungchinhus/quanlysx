import { Component, Inject, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, Type } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WindingData, BangVeData } from '../../models/winding.model';
import { BoiDayHaComponent } from '../../boi-day-ha/boi-day-ha.component';
import { BoiDayCaoComponent } from '../../boi-day-cao/boi-day-cao.component';

export interface WindingOperationData {
  winding: WindingData;
  bangVe: BangVeData;
  mode: 'view' | 'edit';
  userRole: string;
  userKhauSx: string;
}

@Component({
  selector: 'app-winding-operation-popup',
  templateUrl: './winding-operation-popup.component.html',
  styleUrls: ['./winding-operation-popup.component.scss']
})
export class WindingOperationPopupComponent implements OnInit {
  @ViewChild('componentContainer', { read: ViewContainerRef, static: true }) componentContainer!: ViewContainerRef;

  currentComponent: 'boi-day-ha' | 'boi-day-cao' | null = null;
  windingData: WindingData;
  bangVeData: BangVeData;
  mode: 'view' | 'edit';
  userRole: string;
  userKhauSx: string;
  currentComponentInstance: any;

  constructor(
    public dialogRef: MatDialogRef<WindingOperationPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WindingOperationData,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {
    this.windingData = data.winding;
    this.bangVeData = data.bangVe;
    this.mode = data.mode;
    this.userRole = data.userRole;
    this.userKhauSx = data.userKhauSx;
  }

  ngOnInit(): void {
    this.determineComponentType();
  }

  determineComponentType(): void {
    if (this.userKhauSx.includes('boidayha')) {
      this.currentComponent = 'boi-day-ha';
      this.loadComponent(BoiDayHaComponent);
    } else if (this.userKhauSx.includes('boidaycao')) {
      this.currentComponent = 'boi-day-cao';
      this.loadComponent(BoiDayCaoComponent);
    } else {
      // Default fallback
      this.currentComponent = 'boi-day-ha';
      this.loadComponent(BoiDayHaComponent);
    }
  }

  loadComponent(componentType: Type<any>): void {
    // Clear previous component
    this.componentContainer.clear();
    
    // Create component factory
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentType);
    
    // Create component instance
    const componentRef = this.componentContainer.createComponent(componentFactory);
    
    // Set input properties
    componentRef.instance.isActive = true;
    componentRef.instance.windingData = this.windingData;
    componentRef.instance.bangVeData = this.bangVeData;
    componentRef.instance.mode = this.mode;
    
    // Store reference to current component instance
    this.currentComponentInstance = componentRef.instance;
  }

  getComponentTitle(): string {
    if (this.currentComponent === 'boi-day-ha') {
      return 'Bối dây hạ';
    } else if (this.currentComponent === 'boi-day-cao') {
      return 'Bối dây cao';
    }
    return 'Quấn dây';
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    // Handle save logic based on current component
    if (this.currentComponentInstance && this.currentComponentInstance.onSubmit) {
      this.currentComponentInstance.onSubmit();
    }
  }

  isEditMode(): boolean {
    return this.mode === 'edit';
  }
}
