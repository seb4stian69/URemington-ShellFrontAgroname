// src/app/components/productor/productor.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para *ngFor, *ngIf, y pipes
import { FormsModule } from '@angular/forms'; // Para [(ngModel)]

export interface Product {
  id: number;
  nombre: string;
  precio: number;
  unidad: string;
  foto: string;
  practicas: string;
  disponibilidad: number;
  descuento: number;
  categoria: string;
  productor: number;
  precioFinal?: number; // Añade esta propiedad opcional
}

@Component({
  selector: 'app-productor',
  standalone: true,
  imports: [CommonModule, FormsModule], // Importa los módulos necesarios
  templateUrl: './productor.component.html',
  styleUrl: './productor.component.scss'
})
export class ProductorComponent implements OnInit {

  productos: Product[] = [
    {
      id: 1,
      nombre: "Ñame criollo",
      precio: 3500.00,
      unidad: "kg",
      foto: "https://via.placeholder.com/200x200/6A0000/FFFFFF?text=Name+Criollo",
      practicas: "Agricultura orgánica sin pesticidas",
      disponibilidad: 50,
      descuento: 10.0,
      categoria: "Tubérculos",
      productor: 1001
    },
    {
      id: 2,
      nombre: "Plátano Verde",
      precio: 2500.00,
      unidad: "kg",
      foto: "https://via.placeholder.com/200x200/007BFF/FFFFFF?text=Platano+Verde",
      practicas: "Cultivo tradicional",
      disponibilidad: 80,
      descuento: 5.0,
      categoria: "Frutas",
      productor: 1001
    }
  ];

  showProductModal: boolean = false;
  editandoId: number | null = null;
  currentProduct: Product = this.resetProductForm();
  previewImageUrl: string | ArrayBuffer | null = null;

  constructor() {}

  ngOnInit(): void {
    // Calcula los precios finales al iniciar el componente con los productos estáticos
    this.calcularPreciosFinales();
    // Aquí es donde normalmente cargarías productos desde un servicio
    // Por ejemplo:
    // this.productoService.getAllProductos().subscribe(data => {
    //   this.productos = data;
    //   this.calcularPreciosFinales();
    // });
  }

  // --- Lógica de Negocio y Funciones del Componente ---

  private resetProductForm(): Product {
    return {
      id: 0,
      nombre: '',
      precio: 0,
      unidad: '',
      foto: '',
      practicas: '',
      disponibilidad: 0,
      descuento: 0,
      categoria: 'Tubérculos',
      productor: 0
    };
  }

  abrirModalNuevo(): void {
    this.editandoId = null;
    this.currentProduct = this.resetProductForm();
    this.previewImageUrl = null;
    this.showProductModal = true;
  }

  cerrarModal(): void {
    this.showProductModal = false;
  }

  mostrarPreview(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewImageUrl = e.target?.result || null;
        this.currentProduct.foto = e.target?.result as string;
      };
      reader.readAsDataURL(input.files[0]);
      // Limpia el campo de URL si se sube un archivo
      (document.getElementById('fotoURL') as HTMLInputElement).value = '';
    } else {
      this.previewImageUrl = null;
      if (!(document.getElementById('fotoURL') as HTMLInputElement).value) {
        this.currentProduct.foto = '';
      }
    }
  }

  mostrarPreviewURL(url: string): void {
    if (url.trim() !== '') {
      this.previewImageUrl = url;
      this.currentProduct.foto = url;
      // Limpia el campo de archivo si se ingresa una URL
      (document.getElementById('fotoArchivo') as HTMLInputElement).value = '';
    } else {
      this.previewImageUrl = null;
      if (!(document.getElementById('fotoArchivo') as HTMLInputElement).value) {
        this.currentProduct.foto = '';
      }
    }
  }

  guardarProducto(): void {
    // Validar datos antes de guardar (ej. que los campos requeridos no estén vacíos)
    if (!this.currentProduct.nombre || !this.currentProduct.precio || !this.currentProduct.unidad || !this.currentProduct.practicas) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }

    if (this.editandoId === null) {
      // Nuevo producto
      this.currentProduct.id = this.generateNewId();
      this.productos.push({ ...this.currentProduct });
      // En una aplicación real, aquí llamarías a un servicio para POST el nuevo producto
      // this.productoService.addProducto(this.currentProduct).subscribe(response => { ... });
    } else {
      // Editar producto existente
      const index = this.productos.findIndex(p => p.id === this.editandoId);
      if (index !== -1) {
        this.productos[index] = { ...this.currentProduct };
        // En una aplicación real, aquí llamarías a un servicio para PUT el producto actualizado
        // this.productoService.updateProducto(this.currentProduct).subscribe(response => { ... });
      }
    }
    this.calcularPreciosFinales(); // Recalcular precios después de guardar
    this.cerrarModal();
  }

  private generateNewId(): number {
    if (this.productos.length === 0) {
      return 1;
    }
    const maxId = this.productos.reduce((max, p) => (p.id && p.id > max ? p.id : max), 0);
    return maxId + 1;
  }

  editarProducto(id: number): void {
    const productToEdit = this.productos.find(p => p.id === id);
    if (productToEdit) {
      this.editandoId = id;
      // Crea una copia profunda para evitar mutar el producto original directamente
      this.currentProduct = JSON.parse(JSON.stringify(productToEdit)); // Copia profunda
      this.previewImageUrl = productToEdit.foto;
      this.showProductModal = true;
    }
  }

  eliminarProducto(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      this.productos = this.productos.filter(p => p.id !== id);
      // En una aplicación real, aquí llamarías a un servicio para DELETE el producto
      // this.productoService.deleteProducto(id).subscribe(response => { ... });
      this.calcularPreciosFinales(); // Recalcular precios después de eliminar
    }
  }

  calcularPreciosFinales(): void {
    if (this.productos && this.productos.length > 0) {
      this.productos = this.productos.map(p => ({
        ...p,
        precioFinal: p.precio - (p.precio * (p.descuento / 100))
      }));
    }
  }
}