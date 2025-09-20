import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // <-- adicionado

@Component({
  selector: 'app-root',
  standalone: true, // <-- importante para usar 'imports'
  imports: [
    RouterOutlet,
    FormsModule,
    HttpClientModule,
    CommonModule // <-- necessário para *ngIf, *ngFor
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'EstoqueManagerFrontEnd';
}
