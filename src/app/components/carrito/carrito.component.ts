import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para *ngIf, *ngFor
import { Router, RouterModule } from '@angular/router'; // Necesario para navegación y routerLink
import { FormsModule } from '@angular/forms'; // Necesario para ngModel y manejo de formularios
import { AuthService } from '../../services/auth.service'; // Asumiendo que este servicio existe

// --- Interfaces ---
// BUENA PRÁCTICA: Mueve estas interfaces a un archivo compartido como 'src/app/shared/interfaces.ts'
// y luego impórtalas aquí y donde más las necesites.
// Por ahora, se mantienen aquí para que el componente sea auto-contenido y funcione de inmediato.

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
  precioFinal?: number; // Propiedad calculada para mostrar el precio final
}

export interface Ubicacion {
  departamento: string;
  municipio: string;
}

export interface Productor {
  id: number;
  nombre: string;
}

// Interfaz para un ítem del carrito (un Producto con una cantidad adicional)
interface CartItem extends Product {
  quantity: number;
}

// --- Componente Carrito ---
@Component({
  selector: 'app-carrito',
  standalone: true, // Marca esto como un componente autónomo
  imports: [
    CommonModule,  // Proporciona directivas como *ngIf, *ngFor
    RouterModule,  // Para routerLink y inyección de Router
    FormsModule    // Necesario para [(ngModel)] o el manejo de formularios (aunque aquí solo para radio buttons)
  ],
  templateUrl: './carrito.component.html', // Asume que este HTML contiene el modal
  styleUrl: './carrito.component.scss'     // Asume que este SCSS contiene los estilos del modal
})
export class CarritoComponent implements OnInit {

  cartItems: CartItem[] = []; // Array que contendrá los ítems del carrito
  totalPrice: number = 0;    // Precio total de todos los ítems en el carrito

  // --- PROPIEDADES DEL MODAL (Todas residen aquí, ya que el modal no es un componente separado) ---
  isPaymentModalOpen: boolean = false; // Controla si el modal de pago está visible
  selectedPaymentMethod: string = '';  // Almacena el método de pago seleccionado en el modal

  // Opciones de métodos de pago para el modal
  paymentMethods = [
    { value: 'efectivo', label: 'Efectivo', icon: '💰' },
    { value: 'transferencia', label: 'Transferencia Bancaria', icon: '🏦' },
    { value: 'tarjeta', label: 'Tarjeta Débito/Crédito', icon: '💳' }
  ];

  constructor(private router: Router, private authService: AuthService) { } // Inyecta los servicios necesarios

  ngOnInit(): void {
    this.loadCartFromLocalStorage(); // Carga los ítems del carrito desde el almacenamiento local
    this.calculateCartTotals();      // Calcula el total del carrito

    // Establece el primer método de pago como seleccionado por defecto al iniciar la página
    this.selectedPaymentMethod = this.paymentMethods[0].value;
  }

  /**
   * Carga los datos del carrito de compras desde localStorage.
   * Si hay datos, los parsea y recalcula 'precioFinal' si es necesario.
   */
  private loadCartFromLocalStorage(): void {
    try {
      const storedCart = localStorage.getItem('agroñame_cart');
      if (storedCart) {
        this.cartItems = JSON.parse(storedCart);
        this.cartItems = this.cartItems.map(item => ({
          ...item,
          precioFinal: item.precioFinal || (item.precio_base * (1 - item.porc_descuento / 100))
        }));
        console.log('Carrito cargado desde localStorage:', this.cartItems);
      }
    } catch (e) {
      console.error('Error al cargar el carrito desde localStorage:', e);
      this.cartItems = []; // En caso de error, inicializa el carrito como vacío
    }
  }

  /**
   * Guarda el estado actual del carrito en localStorage.
   */
  private saveCartToLocalStorage(): void {
    try {
      localStorage.setItem('agroñame_cart', JSON.stringify(this.cartItems));
      console.log('Carrito guardado en localStorage.');
    } catch (e) {
      console.error('Error al guardar el carrito en localStorage:', e);
    }
  }

  /**
   * Calcula el precio total sumando los subtotales de todos los ítems en el carrito.
   */
  calculateCartTotals(): void {
    this.totalPrice = this.cartItems.reduce((sum, item) => {
      const itemPrice = item.precioFinal || (item.precio_base * (1 - item.porc_descuento / 100));
      return sum + (itemPrice * item.quantity);
    }, 0);
  }

  /**
   * Actualiza la cantidad de un producto específico en el carrito.
   * Elimina el producto si la cantidad llega a cero o menos.
   * @param item El ítem del carrito cuya cantidad se va a actualizar.
   * @param change El valor de cambio (ej., +1 para aumentar, -1 para disminuir).
   */
  updateQuantity(item: CartItem, change: number): void {
    item.quantity += change;
    if (item.quantity <= 0) {
      this.removeItem(item.codprod);
    } else {
      this.saveCartToLocalStorage();
      this.calculateCartTotals();
    }
  }

  /**
   * Elimina un producto del carrito basado en su código de producto.
   * @param codprod El código del producto a eliminar.
   */
  removeItem(codprod: number): void {
    this.cartItems = this.cartItems.filter(item => item.codprod !== codprod);
    this.saveCartToLocalStorage();
    this.calculateCartTotals();
    alert('Producto eliminado del carrito.');
  }

  /**
   * Vacía completamente el carrito después de una confirmación.
   */
  clearCart(): void {
    if (confirm('¿Estás seguro de que quieres vaciar todo el carrito?')) {
      this.cartItems = [];
      this.saveCartToLocalStorage();
      this.calculateCartTotals();
      alert('El carrito ha sido vaciado.');
    }
  }

  /**
   * Navega de vuelta a la página principal de productos.
   */
  continueShopping(): void {
    this.router.navigate(['/dashboard/consumidor']);
  }

  /**
   * Abre el modal de pago si el carrito contiene ítems.
   */
  proceedToCheckout(): void {
    if (this.cartItems.length === 0) {
      alert('Tu carrito está vacío. Añade productos antes de proceder al pago.');
      return;
    }
    this.isPaymentModalOpen = true; // Hace visible el modal
  }

  // --- MÉTODOS RELACIONADOS CON EL MODAL (AHORA DENTRO DE CarritoComponent) ---

  /**
   * Selecciona el método de pago dentro del modal.
   * Se llama al hacer clic en las tarjetas de método de pago.
   * @param method El valor del método de pago seleccionado.
   */
  selectMethod(method: string): void {
    this.selectedPaymentMethod = method;
  }

  /**
   * Confirma la selección del método de pago en el modal.
   * Aquí iría la lógica para procesar el pago o mostrar más detalles.
   */
  confirmPayment(): void {
    if (!this.selectedPaymentMethod) {
      alert('Por favor, selecciona un método de pago.');
      return;
    }

    console.log('Pago confirmado con el método:', this.selectedPaymentMethod);
    this.closeModal(); // Cierra el modal después de la confirmación

    // --- LÓGICA DE PROCESAMIENTO DE PAGO ---
    // Este es el punto donde integrarías con una pasarela de pago real o mostrarías información adicional.
    alert(`Pago de $${this.totalPrice.toFixed(2)} confirmado con el método: ${this.selectedPaymentMethod.toUpperCase()}`);

    // Después de un "pago" simulado, podrías vaciar el carrito
    this.clearCart();

    // Opcional: Navegar a una página de confirmación de pedido
    // this.router.navigate(['/order-confirmation']);
  }

  /**
   * Cierra el modal de pago.
   * Se llama al hacer clic en el botón 'Cancelar', la 'X' o fuera del contenido del modal.
   */
  closeModal(): void {
    this.isPaymentModalOpen = false; // Oculta el modal
    // Opcional: Puedes reiniciar el método seleccionado si quieres que el modal empiece "limpio" la próxima vez
    // this.selectedPaymentMethod = this.paymentMethods[0].value;
  }

  /**
   * Cierra la sesión del usuario.
   */
  logout(): void {
    this.authService.logout();
  }
}