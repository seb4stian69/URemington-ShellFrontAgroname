import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Required for *ngIf, *ngFor
import { Router, RouterModule } from '@angular/router'; // Required for navigation and routerLink
import { FormsModule } from '@angular/forms'; // Required for ngModel, even if not directly used for quantity input here, good practice.
import { AuthService } from '../../services/auth.service';

// --- Interfaces ---
// It's best practice to define these in a shared file (e.g., src/app/shared/interfaces.ts)
// and import them. For a self-contained component code, they are repeated here.

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
  precioFinal?: number; // Calculated property for display
}

export interface Ubicacion {
  departamento: string;
  municipio: string;
}

export interface Productor {
  id: number;
  nombre: string;
}

// Interface for a cart item (a Product with an added quantity)
interface CartItem extends Product {
  quantity: number;
}

// --- Carrito Component ---
@Component({
  selector: 'app-carrito',
  standalone: true, // Marks this as a standalone component
  imports: [CommonModule, RouterModule, FormsModule], // Import necessary Angular modules
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.scss'
})
export class CarritoComponent implements OnInit {

  cartItems: CartItem[] = []; // Array to hold the items in the cart
  totalPrice: number = 0;    // Total price of all items in the cart

  constructor(private router: Router, private authService: AuthService) { } // Inject Angular's Router service

  ngOnInit(): void {
    this.loadCartFromLocalStorage(); // Load cart data when the component initializes
    this.calculateCartTotals();      // Calculate totals based on loaded data
  }

  /**
   * Loads the shopping cart data from localStorage.
   * Parses the JSON string and ensures 'precioFinal' is calculated for display.
   */
  private loadCartFromLocalStorage(): void {
    try {
      const storedCart = localStorage.getItem('agroñame_cart');
      if (storedCart) {
        this.cartItems = JSON.parse(storedCart);
        // Ensure precioFinal is present for calculation, especially if loaded from storage
        this.cartItems = this.cartItems.map(item => ({
          ...item,
          precioFinal: item.precioFinal || (item.precio_base * (1 - item.porc_descuento / 100))
        }));
        console.log('Carrito cargado desde localStorage:', this.cartItems);
      }
    } catch (e) {
      console.error('Error al cargar el carrito desde localStorage:', e);
      this.cartItems = []; // If there's an error (e.g., malformed JSON), initialize an empty cart
    }
  }

  /**
   * Saves the current shopping cart data to localStorage.
   */
  private saveCartToLocalStorage(): void {
    try {
      localStorage.setItem('agroñame_cart', JSON.stringify(this.cartItems));
      console.log('Carrito guardado en localStorage.');
    } catch (e) {
      console.error('Error al guardar el carrito en localStorage:', e);
      // Optionally, inform the user if localStorage fails (e.g., quota exceeded)
    }
  }

  /**
   * Calculates the total price of all items in the cart.
   * Also recalculates individual item subtotals (though implicitly handled by template).
   */
  calculateCartTotals(): void {
    this.totalPrice = this.cartItems.reduce((sum, item) => {
      // Use precioFinal if available, otherwise calculate from base price and discount
      const itemPrice = item.precioFinal || (item.precio_base * (1 - item.porc_descuento / 100));
      return sum + (itemPrice * item.quantity);
    }, 0);
  }

  /**
   * Updates the quantity of a specific product in the cart.
   * If quantity drops to 0 or less, the item is removed.
   * @param item The CartItem to update.
   * @param change The amount to change the quantity by (e.g., 1 for increment, -1 for decrement).
   */
  updateQuantity(item: CartItem, change: number): void {
    item.quantity += change;
    if (item.quantity <= 0) {
      this.removeItem(item.codprod); // Remove item if quantity becomes non-positive
    } else {
      this.saveCartToLocalStorage(); // Save changes to localStorage
      this.calculateCartTotals();    // Recalculate totals
    }
  }

  /**
   * Removes a specific product from the cart.
   * @param codprod The product code of the item to remove.
   */
  removeItem(codprod: number): void {
    this.cartItems = this.cartItems.filter(item => item.codprod !== codprod);
    this.saveCartToLocalStorage();
    this.calculateCartTotals();
    alert('Producto eliminado del carrito.'); // User feedback
  }

  /**
   * Clears all items from the shopping cart after user confirmation.
   */
  clearCart(): void {
    if (confirm('¿Estás seguro de que quieres vaciar todo el carrito?')) {
      this.cartItems = [];
      this.saveCartToLocalStorage();
      this.calculateCartTotals();
      alert('El carrito ha sido vaciado.'); // User feedback
    }
  }

  /**
   * Navigates the user back to the product catalog page.
   */
  continueShopping(): void {
    this.router.navigate(['/dashboard/consumidor']); // Navigate to the product list
  }

  /**
   * Placeholder for the checkout process.
   * Alerts the user if the cart is empty before proceeding.
   */
  proceedToCheckout(): void {
    if (this.cartItems.length === 0) {
      alert('Tu carrito está vacío. Añade productos antes de proceder al pago.');
      return;
    }
    alert('Procediendo al pago...');
    // In a real application, you would navigate to a checkout page:
    // this.router.navigate(['/checkout']);
  }

    logout(){
      this.authService.logout();
    }

}
