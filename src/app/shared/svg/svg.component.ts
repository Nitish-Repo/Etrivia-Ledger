import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, NgStyle } from '@angular/common';

@Component({
  selector: 'app-svg',
  templateUrl: './svg.component.html',
  styleUrls: ['./svg.component.scss'],
  standalone: true,
  imports: [CommonModule, NgStyle]
})

export class SvgComponent implements OnInit {

  @Input() classes?: string;
  @Input() width: number = 20;
  @Input() height: number = 20;
  @Input() svgPath: string = '/assets/image/all.svg';
  @Input() svgName?: string;
  @Input() useLink = true;
  @Input() customCss?: { [key: string]: string };

  constructor() { }

  ngOnInit(): void {
  }

  get svgLinkHref() {
    if (this.useLink) {
      return `${this.svgPath}#${this.svgName}`;
    } else {
      return this.svgPath;
    }
  }

}



