export interface UsuarioDto {
  estado: boolean;
  id: number | null;
  nombreUsuario: string;
  contrasena: string;
  idPerfil: number|null;
  idPersona: number|null;
}