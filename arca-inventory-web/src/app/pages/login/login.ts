import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  correo = '';
  contrasena = '';

  constructor(private router: Router) {}

  ingresar(): void {
    this.router.navigate(['/home']);
  }
}
