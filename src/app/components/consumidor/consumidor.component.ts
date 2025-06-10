import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for ngFor, ngIf, etc.
import { ProductService } from '../../services/product.service';

interface Product {
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
  precioFinal?: number; // Add an optional property for the calculated final price
}

// Interfaz para un ítem del carrito (producto con cantidad)
interface CartItem extends Product {
  quantity: number;
}

@Component({
  selector: 'app-consumidor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consumidor.component.html',
  styleUrl: './consumidor.component.scss',
  providers: [ProductService],
  
})
export class ConsumidorComponent implements OnInit {
  productos: Product[] = [
    {
      id: 1,
      nombre: "Ñame criollo",
      precio: 3500.00,
      unidad: "kg",
      foto: "https://cdn.sitio.com/imagenes/ñame1.jpg", // Asegúrate de que esta URL sea accesible
      practicas: "Agricultura orgánica sin pesticidas",
      disponibilidad: 50,
      descuento: 10.0,
      categoria: "Tubérculos",
      productor: 1001
    },
    {
      id: 2,
      nombre: "Aguacate Hass",
      precio: 6000.00,
      unidad: "unidad",
      foto: "https://via.placeholder.com/200x200/4CAF50/FFFFFF?text=Aguacate", // Ejemplo de URL
      practicas: "Cultivo sostenible",
      disponibilidad: 100,
      descuento: 5.0,
      categoria: "Frutas",
      productor: 1002
    },
    {
      id: 3,
      nombre: "Tomate Chonto",
      precio: 2800.00,
      unidad: "kg",
      foto: "https://via.placeholder.com/200x200/FF5722/FFFFFF?text=Tomate", // Ejemplo de URL
      practicas: "Libre de agroquímicos",
      disponibilidad: 75,
      descuento: 0.0,
      categoria: "Hortalizas",
      productor: 1003
    }
    // Puedes añadir más productos aquí para probar la cuadrícula 3x3
  ];

  // Propiedad para almacenar los ítems del carrito
  cartItems: CartItem[] = [];

  constructor(private pService: ProductService){}

  ngOnInit() {
    this.calcularPreciosFinales();
    localStorage.setItem('agroñame_cart', '[]');
    this.loadCartFromLocalStorage(); // Cargar el carrito al iniciar el componente
    this.pService.getAllProductos().subscribe({
      next: (res: Product[]) => { // Esperamos que 'res' sea un array de Product
        console.log('Productos recibidos de la API:', res);
        this.productos = res; // Asigna los productos recibidos de la API a tu array 'productos'
        this.calcularPreciosFinales(); // Calcula los precios finales DESPUÉS de que los productos se carguen
      },
      error: (err) => {
        console.error('Error al obtener productos:', err);
      }
    }); 
  }

  private calcularPreciosFinales(): void {
    this.productos = this.productos.map(p => ({
      ...p,
      precioFinal: p.precio - (p.precio * p.descuento / 100)
    }));
  }

  // --- Funciones para el Carrito ---

  // Guarda el carrito actual en localStorage
  private saveCartToLocalStorage(): void {
    try {
      localStorage.setItem('agroñame_cart', JSON.stringify(this.cartItems));
      console.log('Carrito guardado en localStorage.');
    } catch (e) {
      console.error('Error al guardar el carrito en localStorage:', e);
      // Aquí podrías mostrar una notificación al usuario si el localStorage falla
    }
  }

  // Carga el carrito desde localStorage
  private loadCartFromLocalStorage(): void {
    try {
      const storedCart = localStorage.getItem('agroñame_cart');
      if (storedCart) {
        this.cartItems = JSON.parse(storedCart);
        console.log('Carrito cargado desde localStorage:', this.cartItems);
      }
    } catch (e) {
      console.error('Error al cargar el carrito desde localStorage:', e);
      // En caso de error de parseo o lectura, inicializamos el carrito vacío
      this.cartItems = [];
    }
  }

  // Añade un producto al carrito
  addToCart(product: Product): void {

    console.log("Entre")

    const existingItem = this.cartItems.find(item => item.id === product.id);

    if (existingItem) {
      // Si el producto ya está en el carrito, incrementa la cantidad
      existingItem.quantity++;
      console.log(`Cantidad de "${product.nombre}" incrementada a ${existingItem.quantity}`);
    } else {
      // Si el producto no está en el carrito, agrégalo con cantidad 1
      const newItem: CartItem = { ...product, quantity: 1 };
      this.cartItems.push(newItem);
      console.log(`"${product.nombre}" añadido al carrito.`);
    }

    this.saveCartToLocalStorage(); // Guarda el carrito después de cada modificación
    // Opcional: Mostrar una notificación al usuario (ej. un Toast)
    alert(`"${product.nombre}" ha sido añadido al carrito.`);

  }

  // Opcional: Eliminar un ítem del carrito
  removeFromCart(productId: number): void {
    this.cartItems = this.cartItems.filter(item => item.id !== productId);
    this.saveCartToLocalStorage();
    console.log(`Producto con ID ${productId} eliminado del carrito.`);
    alert(`Producto eliminado del carrito.`);
  }

  // Opcional: Vaciar todo el carrito
  clearCart(): void {
    this.cartItems = [];
    this.saveCartToLocalStorage();
    console.log('Carrito vaciado.');
    alert('El carrito ha sido vaciado.');
  }

  // Opcional: Obtener la cantidad total de ítems en el carrito (para mostrar en un ícono de carrito)
  getTotalCartItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }
}