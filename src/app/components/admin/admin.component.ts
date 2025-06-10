import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Persona } from '../../interfaces/persona';
import { Usuario } from '../../interfaces/usuario';
import { Perfil } from '../../interfaces/perfil';
import { AdminService } from '../../services/admin.service';
import { PersonaDto } from '../../interfaces/personaDto';
import { UsuarioDto } from '../../interfaces/usuarioDto';
import { PerfilDto } from '../../interfaces/perfilDto';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  providers: [AdminService, AuthService]
})
export class AdminComponent implements OnInit {

  // Control de modales
  modalPersonaVisible = false;
  modalUsuarioVisible = false;
  modalPerfilVisible = false;

  // Formularios reactivos
  formPersona: FormGroup;
  formUsuario: FormGroup;
  formPerfil: FormGroup;

  // Listados para tablas (simulados)
  personas: Persona[] = [];
  usuarios: Usuario[] = [];
  perfiles: Perfil[] = [];

  constructor(private fb: FormBuilder, private service: AdminService, private authService: AuthService) {
    this.formPersona = this.fb.group({

      personaId: [
        '',
        [Validators.required, Validators.pattern(/^\d+$/)]
      ],
      primerNombre: [
        '',
        [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]
      ],
      segundoNombre: [
        '',
        [Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/)]
      ],
      primerApellido: [
        '',
        [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]
      ],
      segundoApellido: [
        '',
        [Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/)]
      ],
      direccion: [''],
      telefono: [''],
      celular: [''],
      correo: [
        '',
        [Validators.required, Validators.email]
      ],
      fechaNacimiento: [''],
      estado: ['Activo', Validators.required]
      
    });


    this.formUsuario = this.fb.group({
      usuarioId: [null],
      nombreUsuario: ['', Validators.required],
      contrasena: ['', Validators.required],
      perfil: ['Usuario', Validators.required],
      estado: ['Activo', Validators.required]
    });

    this.formPerfil = this.fb.group({
      id: [null],
      descripcion: ['', Validators.required],
      estado: ['Activo', Validators.required]
    });
  }

  ngOnInit(): void {
    // Aquí puedes cargar datos reales desde un servicio
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales() {

    this.service.getAllPersonas().subscribe((data: Persona[]) => {
      this.personas = data;
    });

    this.service.getAllPerfiles().subscribe((data: Perfil[]) => {
      this.perfiles = data;
    });

    this.service.getAllUsuarios().subscribe((data: Usuario[]) => {
      this.usuarios = data;
    });

  }

  // --- Métodos Persona ---
  abrirModalPersonaNuevo() {
    this.formPersona.reset({
      personaId: null,
      estado: 'Activo'
    });
    this.modalPersonaVisible = true;
  }

  cerrarModalPersona() {
    this.modalPersonaVisible = false;
  }

  guardarPersona(personaInput: Persona|null) {

    let persona: Persona;

    if(personaInput == null){      
      if (this.formPersona.invalid) {
        this.formPersona.markAllAsTouched();
        return;
      }
      persona = this.formPersona.value;
      this.personas.push(persona);
    }else{
      console.log("Editado")
      persona = personaInput;
    }


    let personaDto: PersonaDto = {
      "id": persona.personaId,
      "nombres": persona.primerNombre + " " + persona.segundoNombre,
      "apellidos": persona.primerApellido + " " + persona.segundoApellido,
      "direccion": persona.direccion,
      "telefono": persona.telefono,
      "movil": persona.celular,
      "correo": persona.correo,
      "fechaNacimiento": persona.fechaNacimiento,
      "estado": persona.estado=="Activo"?true:false
    } 

    this.service.savePersona(personaDto).subscribe({
      next: (res) => {
        console.log('Persona guardada con éxito:', res);
      },
      error: (err) => {
        console.error('Error al guardar persona:', err);
      }
    });

    this.cerrarModalPersona();
  
  }

  // --- Métodos Usuario ---
  abrirModalUsuarioNuevo() {

    this.service.getAllPerfiles().subscribe((data: Perfil[]) => {
      this.perfiles = data;
    });

    this.formUsuario.reset({
      usuarioId: null,
      perfil: 'Usuario',
      estado: 'Activo'
    });
    this.modalUsuarioVisible = true;
  }

  cerrarModalUsuario() {
    this.modalUsuarioVisible = false;
  }

  guardarUsuario(usuarioInput: Usuario|null) {
    
    let usuario: Usuario;

    if(usuarioInput == null){
    
      if (this.formUsuario.invalid) {
        this.formUsuario.markAllAsTouched();
        return;
      }
    
      usuario = this.formUsuario.value;
    
      this.usuarios.push(usuario);
    
    }else{
      usuario = usuarioInput;
    }

    let usuarioDto: UsuarioDto = {
      "id": usuario.usuarioId,
      "nombreUsuario": usuario.nombreUsuario,
      "contrasena": usuario.contrasena,
      "estado": usuario.estado=="Activo"?true:false,
      "idPersona": usuario.usuarioId,
      "idPerfil": usuario.perfil
    }

    this.service.saveUsuarios(usuarioDto).subscribe({
      next: (res) => {
        console.log('Usuario guardado con éxito:', res);
      },
      error: (err) => {
        console.error('Error al guardar usuario:', err);
      }
    }); 
    
    this.cerrarModalUsuario();

  }

  // --- Métodos Perfil ---
  abrirModalPerfilNuevo() {
    this.formPerfil.reset({
      perfilId: null,
      estado: 'Activo'
    });
    this.modalPerfilVisible = true;
  }

  cerrarModalPerfil() { 
    this.modalPerfilVisible = false;
  }

  guardarPerfil(perfilInput: Perfil|null) {
  
    let perfil: Perfil;

    if(perfilInput == null){
      if (this.formPerfil.invalid) {
        this.formPerfil.markAllAsTouched();
        return;
      }
      perfil = this.formPerfil.value;
      this.perfiles.push(perfil);
    }else{
      perfil = perfilInput;
    }

    let perfilRequ: PerfilDto|null = {
      "id": perfil.id,
      "descripcion": perfil.descripcion,
      "estado": perfil.estado==="Activo"?true:false
    };

    this.service.savePerfiles(perfilRequ).subscribe({
      next: (res) => {
        console.log('Perfil guardado con éxito:', res);
      },
      error: (err) => {
        console.error('Error al guardar Perfil:', err);
      }
    });
    
    this.cerrarModalPerfil();

  }

  // --- Eliminar ---

  eliminar(id: number|null, ruta: string){
    this.service.softDelete(id, ruta).subscribe({
      next: (res) => {
        console.log('Eliminacion exitosa', res);
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
      }
    });
  }

  // -- Cerrar Sesion --

  logout(){
    this.authService.logout();
  }

}
