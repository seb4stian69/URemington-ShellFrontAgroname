export interface Persona {
  personaId: number | null;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  direccion?: string;
  telefono?: string;
  celular?: string;
  correo: string;
  fechaNacimiento?: string;
  estado: string;
}