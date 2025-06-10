export interface PersonaDto {
  id: number | null;
  nombres?: string;
  apellidos?: string;
  direccion?: string;
  telefono?: string;
  movil?: string;
  correo: string;
  fechaNacimiento?: string;
  estado: boolean;
}