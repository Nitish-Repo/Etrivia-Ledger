import { Component, inject, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { ThemeService } from './core/theme.service';
import { LanguageService } from './core/language.service';
import { NativeService } from './core/native.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  private themeService = inject(ThemeService);
  private lang = inject(LanguageService);
  private native = inject(NativeService);
  private router = inject(Router);

  ngOnInit() {
    // Initialize translations
    this.lang.init();
    
    this.native.init();
    
    this.router.events.subscribe(console.log);
  }
}
