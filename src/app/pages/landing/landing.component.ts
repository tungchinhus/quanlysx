import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';
import { LandingService } from './landing.service';
import { Data } from './models/payment.model';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { Location } from '@angular/common';
import { RelationshipInfoService } from './relationship-info/relationship-info.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, OnDestroy {
  canRenderCarousel: boolean = false;
  currentStep: string = 'policy-info';
  events!: Subscription;
  data!: Data;
  policyInfo!: any
  payerInfo!: any
  relationshipByPolicy!: any;
  searchNum!: any;
  relToOwner!: any

  constructor(
    private landingService: LandingService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private loadingService: LoadingService,
    private service: RelationshipInfoService
  ) {
    let dataParam = location.getState() as any;
    this.policyInfo = dataParam.policyInfo;
    this.payerInfo = dataParam.payerInfo;
    this.relationshipByPolicy = dataParam.relationshipByPolicy;
    this.searchNum = dataParam.searchNum;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.canRenderCarousel = true;
    });
    this.events = this.landingService.getEvent().subscribe((event) => {
      console.log('Landing page event:', event);
      this.currentStep = event.step;
      this.data = {
        ...this.data,
        ...event.data
      };
    });


    let relToOwner = this.service.getMappingList(this.policyInfo, this.relationshipByPolicy);
    if(this.policyInfo && this.payerInfo) {
      const data = {
        step: 'payer-info-integrate',
        data: {
          policyInfo: this.policyInfo,
          payerInfo: this.payerInfo,
          relationshipByPolicy: relToOwner,
          policySearchNum: this.searchNum
        }
      };
      this.landingService.pushEvent(data);
    }

    this.commonService.getResetFormEvent().subscribe(() => {
      this.currentStep = '';
      this.loadingService.setLoadingState(true);
      setTimeout(()=> {
        const data: any = {};
        this.data = {
          ...data
        };
        this.currentStep = 'policy-info';
      });
      setTimeout(() => {
        this.loadingService.setLoadingState(false);
      }, 200);
    });    
  }

  ngOnDestroy(): void {
    this.events.unsubscribe();
  }

  confirm() {
    const dialogRef = this.commonService.showDialog({
      panelClass: 'small',
      data: {
        title: 'payment-info.confirm-dialog-title',
        content: 'payment-info.confirm-dialog-content',
        buttons: [
          {
            title: 'button.goback',
            color: 'secondary',
            class: 'small button-mr',
            focusInitial: false,
            data: false
          },
          {
            title: 'button.next',
            color: 'primary',
            class: 'small',
            focusInitial: true,
            data: true
          }
        ]
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {});
  }

  handleRedirectURL() {}
}
