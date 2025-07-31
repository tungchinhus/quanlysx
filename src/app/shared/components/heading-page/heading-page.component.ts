import { Component, Input, OnInit } from '@angular/core'

@Component({
  selector: 'app-heading-page',
  templateUrl: './heading-page.component.html',
  styleUrls: ['./heading-page.component.scss']
})
export class HeadingPageComponent implements OnInit {
  @Input() titleStyle!: Record<string, string | undefined | null> | string
  @Input() subtitleStyle!: Record<string, string | undefined | null> | string
  @Input() containerStyle!: Record<string, string | undefined | null> | string
  @Input() title? = ''
  @Input() subtitle = ''
  constructor() {}

  ngOnInit(): void {}
}
