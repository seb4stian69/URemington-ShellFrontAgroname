  // login.component.ts
  import { Component, inject } from '@angular/core';
  import { Router } from '@angular/router';
  import { AuthService } from '../../services/auth.service';
  import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
  import { CommonModule } from '@angular/common';

  @Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    providers: [AuthService],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
  })
  export class LoginComponent {

    loginForm: FormGroup;
    resetForm: FormGroup;
    showReset = false;
    errorMessage: string = '';

    constructor(
      private fb: FormBuilder,
      private router: Router,
      private authService: AuthService
    ) {
      this.loginForm = this.fb.group({
        username: ['', Validators.required],
        password: ['', Validators.required],
        resetEmail: ['']
      });
      this.resetForm = this.fb.group({
        username: ['', Validators.required]
      })
    }

    toggleReset(): void {
      this.showReset = !this.showReset;
    }

    onLogin(): void {
      if (this.loginForm.valid) {
        const { username, password } = this.loginForm.value;
        this.authService.login(username, password).subscribe({
          next: (user) => {
            switch (user.body?.perfil) {
              case '1':
                this.router.navigate(['/dashboard/admin']);
                break;
              case '2':
                this.router.navigate(['/dashboard/productor']);
                break;
              case '3':
                this.router.navigate(['/dashboard/consumidor']);
                break;
              default:
                this.errorMessage = 'Perfil no reconocido';
            }
          },
          error: (err) => {
            this.errorMessage = err.error?.message || 'Credenciales incorrectas';
          }
        });
      }
    }

    onResetPassword(): void {
      const perfil = this.resetForm.get('username')?.value;
      if (perfil) {
        this.authService.resetPassword(perfil).subscribe({
          next: () => {
            alert('Se ha enviado un correo para restablecer la contraseña.');
            this.showReset = false;
          },
          error: () => {
            alert('No se pudo enviar el correo. Verifique el email.');
          }
        });
      }
    }
  }
