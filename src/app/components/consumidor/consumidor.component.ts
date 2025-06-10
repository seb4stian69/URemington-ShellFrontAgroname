import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for ngFor, ngIf, etc.
import { ProductService } from '../../services/product.service';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { RouterModule } from '@angular/router'; // Add this import


export interface Product {
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
  productor: Productor;
  precioFinal?: number; // Added for calculated final price
}

export interface Ubicacion {
  departamento: string;
  municipio: string;
}

export interface Productor {
  id: number;
  nombre: string;
}

// Interfaz para un ítem del carrito (producto con cantidad)
interface CartItem extends Product {
  quantity: number;
}

@Component({
  selector: 'app-consumidor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // Add FormsModule here
  templateUrl: './consumidor.component.html',
  styleUrl: './consumidor.component.scss',
  providers: [ProductService],
})
export class ConsumidorComponent implements OnInit {

  productos: Product[] = []; // Holds the original, unfiltered list of products
  filteredProductos: Product[] = []; // Holds the products displayed after filtering
  locationFilter: string = ''; // Property to bind to the search input

  // Propiedad para almacenar los ítems del carrito
  cartItems: CartItem[] = [];

  constructor(private pService: ProductService) {}

  ngOnInit() {
    // Initialize localStorage for the cart if it doesn't exist or is invalid
    this.loadCartFromLocalStorage();

    this.pService.getAllProductos().subscribe({
      next: (res: Product[]) => {
        console.log('Productos recibidos de la API:', res);
        this.productos = res; // Assign fetched products to the original list
        this.calcularPreciosFinales(); // Calculate final prices for all products
        this.applyFilter(); // Apply initial filter (which will show all products if filter is empty)
      },
      error: (err) => {
        console.error('Error al obtener productos:', err);
        // You might want to display a user-friendly error message here
      }
    });
  }

  private calcularPreciosFinales(): void {
    this.productos = this.productos.map(p => ({
      ...p,
      precioFinal: p.precio_base - (p.precio_base * p.porc_descuento / 100)
    }));
  }

  // --- Filtering Logic ---
  applyFilter(): void {
    const filterValue = this.locationFilter.toLowerCase().trim();

    if (!filterValue) {
      // If the filter is empty, show all products
      this.filteredProductos = [...this.productos];
      return;
    }

    // Filter products based on municipio or departamento
    this.filteredProductos = this.productos.filter(p =>
      p.ubicacion.municipio.toLowerCase().includes(filterValue) ||
      p.ubicacion.departamento.toLowerCase().includes(filterValue)
    );
  }

  // --- Cart Functions ---

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
    console.log("Adding to cart:", product.nombre);

    const existingItem = this.cartItems.find(item => item.codprod === product.codprod);

    if (existingItem) {
      // If the product is already in the cart, increment the quantity
      existingItem.quantity++;
      console.log(`Cantidad de "${product.nombre}" incrementada a ${existingItem.quantity}`);
    } else {
      // If the product is not in the cart, add it with quantity 1
      const newItem: CartItem = { ...product, quantity: 1 };
      this.cartItems.push(newItem);
      console.log(`"${product.nombre}" añadido al carrito.`);
    }

    this.saveCartToLocalStorage(); // Save the cart after every modification
    // Optional: Show a user notification (e.g., a Toast)
    alert(`"${product.nombre}" ha sido añadido al carrito.`);
  }

  // Opcional: Eliminar un ítem del carrito
  removeFromCart(productId: number): void {
    this.cartItems = this.cartItems.filter(item => item.codprod !== productId);
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