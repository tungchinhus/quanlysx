import { Component, OnInit } from '@angular/core';
import {Location} from '@angular/common';
import { Subscription } from 'rxjs';
import { LandingService } from '../landing.service';
import { Data } from '../models/payment.model';
import { CommonService } from 'src/app/shared/services/common.service';


@Component({
  selector: 'app-maintenance',
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.scss']
})
export class MaintenanceComponent implements OnInit {
    maintenanceMode!: string;
    endTime!: string;
    events!: Subscription;
    currentStep: string = 'maintenance';
    data!: Data;
    dataParam!: any
    
  constructor(
    private location: Location,
    private landingService: LandingService,
    private commonService: CommonService,
  ) {
    this.dataParam = location.getState() as any;
    this.maintenanceMode = this.dataParam.mode;
    this.endTime = this.dataParam.endTime;
   }

  ngOnInit(): void {
    this.events = this.commonService.getEvent().subscribe((event) => {
      this.endTime = event.endTime;
    });
  }

}
