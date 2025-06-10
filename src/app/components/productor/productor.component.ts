import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para *ngFor, *ngIf, y pipes
import { FormsModule } from '@angular/forms'; // Para [(ngModel)]

// --- INTERFAZ ORIGINAL DEL PRODUCTOR ---
// Esta interfaz se usa para el formulario y la lógica interna de este componente.
export interface Product {
  id: number;
  nombre: string;
  precio: number; // Precio base en el formulario del productor
  unidad: string; // Unidad de medida en el formulario del productor
  foto: string;
  practicas: string; // Prácticas de cultivo en el formulario del productor
  disponibilidad: number;
  descuento: number; // Porcentaje de descuento en el formulario del productor
  categoria: string;
  productor: number; // ID del productor en el formulario
  precioFinal?: number; // Propiedad calculada
}

// --- INTERFACES DEL MODELO DE CONSUMIDOR (para localStorage) ---
// Es RECOMENDABLE MOVER ESTAS INTERFACES A UN ARCHIVO COMPARTIDO
// (ej. src/app/shared/models/consumer-product.model.ts o src/app/interfaces/consumer-product.interface.ts)
// y luego importarlas en ambos componentes (Productor y Consumidor).
export interface ConsumerProduct {
  codprod: number;
  nombre: string;
  precio_base: number;
  unidad_medida: string;
  foto: string;
  disponibilidad: number;
  porc_descuento: number;
  categoria: string;
  practicas_cultivo: string;
  ubicacion: Ubicacion;
  productor: ProductorInfo; // Cambiado de 'Productor' a 'ProductorInfo' para evitar conflicto
  precioFinal?: number;
}

export interface Ubicacion {
  departamento: string;
  municipio: string;
}

export interface ProductorInfo { // Cambiado de 'Productor' a 'ProductorInfo'
  id: number;
  nombre: string;
}
// --- FIN DE INTERFACES DE CONSUMIDOR ---

@Component({
  selector: 'app-productor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productor.component.html',
  styleUrl: './productor.component.scss'
})
export class ProductorComponent implements OnInit {

  // La lista 'productos' ahora es de tipo 'Product' (la del productor)
  productos: Product[] = [];

  showProductModal: boolean = false;
  editandoId: number | null = null; // Se usa para 'id' del Product del productor
  currentProduct: Product = this.resetProductForm();
  previewImageUrl: string | ArrayBuffer | null = null;

  constructor() {}

  ngOnInit(): void {
    this.loadProductsFromLocalStorage(); // Carga ConsumerProducts y los mapea a Products
    this.calcularPreciosFinales();
    this.productos = [
      {
        "id": 11,
        "nombre": "Yuca fresca",
        "precio": 2800.00,
        "unidad": "kg",
        "foto": "https://images.rappi.com/products/6c87a5e4-efe5-4050-a6d5-32b413ed126c.jpg",
        "practicas": "Cultivo tradicional",
        "disponibilidad": 120,
        "descuento": 5.0,
        "categoria": "Tubérculos",
        "productor": 1004,
        "precioFinal": 2800.00 * 0.05
      }
    ];       // Recalcula precios finales
  }

  // --- Lógica de Manejo de Productos y Formulario ---

  /**
   * Inicializa un objeto Product (del ProductorComponent) con valores por defecto.
   */
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
      productor: 1004 // ID del productor (hardcodeado en el formulario)
    };
  }

  /**
   * Abre el modal para agregar un nuevo producto.
   */
  abrirModalNuevo(): void {
    this.editandoId = null;
    this.currentProduct = this.resetProductForm();
    this.previewImageUrl = null;
    this.showProductModal = true;
  }

  /**
   * Cierra el modal de agregar/editar producto.
   */
  cerrarModal(): void {
    this.showProductModal = false;
  }

  /**
   * Muestra una vista previa de la imagen seleccionada desde el dispositivo.
   */
  mostrarPreview(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewImageUrl = e.target?.result || null;
        this.currentProduct.foto = e.target?.result as string;
      };
      reader.readAsDataURL(input.files[0]);
      (document.getElementById('fotoURL') as HTMLInputElement).value = '';
    } else {
      this.previewImageUrl = null;
      if (!(document.getElementById('fotoURL') as HTMLInputElement).value) {
        this.currentProduct.foto = '';
      }
    }
  }

  /**
   * Muestra una vista previa de la imagen desde una URL.
   */
  mostrarPreviewURL(url: string): void {
    if (url.trim() !== '') {
      this.previewImageUrl = url;
      this.currentProduct.foto = url;
      (document.getElementById('fotoArchivo') as HTMLInputElement).value = '';
    } else {
      this.previewImageUrl = null;
      if (!(document.getElementById('fotoArchivo') as HTMLInputElement).value) {
        this.currentProduct.foto = '';
      }
    }
  }

  /**
   * Guarda un nuevo producto o actualiza uno existente.
   * Realiza el mapeo a ConsumerProduct antes de guardar en localStorage.
   */
  guardarProducto(): void {
    // Validaciones de formulario (usando los campos del Product del productor)
    if (!this.currentProduct.nombre || this.currentProduct.precio <= 0 || !this.currentProduct.unidad || !this.currentProduct.practicas) {
      alert('Por favor, complete todos los campos obligatorios: Nombre, Precio, Unidad de Medida, Prácticas de Cultivo, y asegúrese que el Precio sea mayor a 0.');
      return;
    }
    if (this.currentProduct.disponibilidad < 0) {
      alert('La disponibilidad no puede ser negativa.');
      return;
    }
    if (this.currentProduct.descuento < 0 || this.currentProduct.descuento > 100) {
      alert('El porcentaje de descuento debe estar entre 0 y 100.');
      return;
    }

    if (this.editandoId === null) {
      // Nuevo producto: asigna un nuevo ID para el modelo de Productor
      this.currentProduct.id = this.generateNewId();
      this.productos.push({ ...this.currentProduct });
      alert('Producto agregado correctamente.');
    } else {
      // Editar producto existente
      const index = this.productos.findIndex(p => p.id === this.editandoId);
      if (index !== -1) {
        this.productos[index] = { ...this.currentProduct };
        alert('Producto actualizado correctamente.');
      }
    }
    this.calcularPreciosFinales(); // Recalcular precios
    this.saveProductsToLocalStorage(); // Guarda en localStorage (convierte a ConsumerProduct)
    this.cerrarModal();
  }

  /**
   * Genera un nuevo ID único para un producto (usando 'id' del modelo del productor).
   */
  private generateNewId(): number {
    if (this.productos.length === 0) {
      return 1;
    }
    const maxId = this.productos.reduce((max, p) => (p.id && p.id > max ? p.id : max), 0);
    return maxId + 1;
  }

  /**
   * Carga los datos de los productos desde localStorage.
   * Los carga como ConsumerProduct y los mapea a Product (del productor).
   */
  private loadProductsFromLocalStorage(): void {
    try {
      const storedProducts = localStorage.getItem('agroñame_products');
      if (storedProducts) {
        const consumerProducts: ConsumerProduct[] = JSON.parse(storedProducts);
        // Mapea los ConsumerProduct a Product (del productor) para la lista local
        this.productos = consumerProducts.map(cp => this.mapConsumerProductToProduct(cp));
        console.log('Productos cargados desde localStorage y mapeados:', this.productos);
      } else {
        this.productos = []; // Si no hay nada, inicializa vacío
        console.log('No se encontraron productos en localStorage. Inicializando lista vacía.');
      }
    } catch (e) {
      console.error('Error al cargar productos desde localStorage:', e);
      this.productos = []; // En caso de error, inicializa como vacío
    }
  }

  /**
   * Guarda la lista actual de productos en localStorage.
   * Mapea los Product (del productor) a ConsumerProduct antes de guardar.
   */
  private saveProductsToLocalStorage(): void {
    try {
      // Mapea los Product (del productor) a ConsumerProduct para guardar
      const consumerProductsToSave: ConsumerProduct[] = this.productos.map(p => this.mapProductToConsumerProduct(p));
      localStorage.setItem('agroñame_products', JSON.stringify(consumerProductsToSave));
      console.log('Productos mapeados y guardados en localStorage.');
    } catch (e) {
      console.error('Error al guardar productos en localStorage:', e);
    }
  }

  /**
   * Edita un producto existente abriendo el modal y precargando sus datos.
   * Usa 'id' del Product del productor.
   * @param id El ID del producto a editar.
   */
  editarProducto(id: number): void {
    const productToEdit = this.productos.find(p => p.id === id);
    if (productToEdit) {
      this.editandoId = id;
      // Crea una copia profunda para evitar mutar el producto original directamente
      this.currentProduct = JSON.parse(JSON.stringify(productToEdit));
      this.previewImageUrl = productToEdit.foto;
      this.showProductModal = true;
    }
  }

  /**
   * Elimina un producto de la lista y de localStorage.
   * Usa 'id' del Product del productor.
   * @param id El ID del producto a eliminar.
   */
  eliminarProducto(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      this.productos = this.productos.filter(p => p.id !== id);
      this.saveProductsToLocalStorage(); // Guarda los cambios en localStorage
      this.calcularPreciosFinales(); // Recalcula precios después de eliminar
      alert('Producto eliminado correctamente.');
    }
  }

  /**
   * Calcula el precio final de cada producto (usando 'precio' y 'descuento' del modelo del productor).
   */
  calcularPreciosFinales(): void {
    if (this.productos && this.productos.length > 0) {
      this.productos = this.productos.map(p => ({
        ...p,
        precioFinal: p.precio - (p.precio * (p.descuento / 100))
      }));
    }
  }

  // --- FUNCIONES DE MAPEO ENTRE MODELOS ---

  /**
   * Mapea un Product (modelo del productor) a un ConsumerProduct (modelo para localStorage).
   * Aquí es donde se asignan los valores hardcodeados para los campos adicionales.
   * @param product El producto del productor a mapear.
   * @returns El producto mapeado al modelo del consumidor.
   */
  private mapProductToConsumerProduct(product: Product): ConsumerProduct {
    return {
      codprod: product.id, // Mapea 'id' del productor a 'codprod' del consumidor
      nombre: product.nombre,
      precio_base: product.precio, // Mapea 'precio' del productor a 'precio_base' del consumidor
      unidad_medida: product.unidad, // Mapea 'unidad' del productor a 'unidad_medida' del consumidor
      foto: product.foto,
      disponibilidad: product.disponibilidad,
      porc_descuento: product.descuento, // Mapea 'descuento' del productor a 'porc_descuento' del consumidor
      categoria: product.categoria,
      practicas_cultivo: product.practicas, // Mapea 'practicas' del productor a 'practicas_cultivo' del consumidor
      // COMENTARIO: Campos hardcodeados para el modelo del consumidor. ¡Edítalos según sea necesario!
      ubicacion: {
        departamento: 'Sucre',
        municipio: 'Sincelejo'
      },
      productor: {
        id: product.productor, // Puedes usar el ID del productor del formulario aquí
        nombre: 'Sebastian Santis' // COMENTARIO: Nombre hardcodeado del productor. ¡Edítalo!
      },
      precioFinal: product.precioFinal // Mantén el precio final si ya está calculado
    };
  }

  /**
   * Mapea un ConsumerProduct (modelo de localStorage) a un Product (modelo del productor).
   * @param consumerProduct El producto del consumidor a mapear.
   * @returns El producto mapeado al modelo del productor.
   */
  private mapConsumerProductToProduct(consumerProduct: ConsumerProduct): Product {
    return {
      id: consumerProduct.codprod, // Mapea 'codprod' del consumidor a 'id' del productor
      nombre: consumerProduct.nombre,
      precio: consumerProduct.precio_base, // Mapea 'precio_base' a 'precio'
      unidad: consumerProduct.unidad_medida, // Mapea 'unidad_medida' a 'unidad'
      foto: consumerProduct.foto,
      practicas: consumerProduct.practicas_cultivo, // Mapea 'practicas_cultivo' a 'practicas'
      disponibilidad: consumerProduct.disponibilidad,
      descuento: consumerProduct.porc_descuento, // Mapea 'porc_descuento' a 'descuento'
      categoria: consumerProduct.categoria,
      productor: consumerProduct.productor ? consumerProduct.productor.id : 0, // Mapea el ID del objeto ProductorInfo
      precioFinal: consumerProduct.precioFinal
    };
  }
}