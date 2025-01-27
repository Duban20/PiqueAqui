// Objeto que contiene el catálogo de productos, organizado por categorías y precios.
const catalogo = {
    "Picaditas": {
        "Picadita Clásica": 8000,
        "Picadita Dúo Chori-Clásica": 14000,
        "Picadita Burichorizo": 9000,
        "Picadita Dúo Butichorizo": 16000,
        "Morcilla": 6000,
        "Picadita Pique Aquí": 15000,
        "Picadita Sexy": 13000,
        "Picadita Exótica": 14000,
        "Picadita Mampana": 23000
    },
    "Maduritos": {
        "Madurito Relleno Fundido": 8000,
        "Madurito Elegante": 11000,
        "Madurito Coqueto": 11000,
        "Madurito Ranchero": 13000
    },
    "Adicionales": {
        "Lluvia de Queso Costeño": 3000,
        "Porción de Papa Criolla": 4000
    },
    "Bebidas": {
        "Corozo": 3000,
        "Maracuyá": 3000,
        "Jugo Hit": 4000,
        "Agua": 3000,
        "Agua Saborizada": 2000,
        "Postobón": 4000,
        "CocaCola": 4000,
        "Quatro": 4000
    }
};

// Variable global para el contador de pedidos.
let orderCounter = JSON.parse(localStorage.getItem('orderCounter')) || 1;

// Función para resetear el contador de pedidos
function resetOrderCounter() {
    if (confirm('¿Estás seguro de resetear el contador de pedidos? Esto no afectará el historial.')) {
        orderCounter = 1; // Reinicia el contador a 1
        localStorage.setItem('orderCounter', JSON.stringify(orderCounter)); // Guarda el nuevo valor en localStorage
        alert('El contador de pedidos ha sido reseteado.');
    }
}

// Función para guardar el contador de pedidos en el almacenamiento local.
function saveOrderCounter() {
    localStorage.setItem('orderCounter', JSON.stringify(orderCounter));
}

// Inicializa el total del pedido y un array para los productos seleccionados.
let total = 0;
let selectedProducts = [];
let editingOrderIndex = null;

// Función para calcular el siguiente pedidoId disponible.
function getNextPedidoId() {
    if (orderHistory.length === 0) return 1; // Si no hay pedidos, el ID será 1.
    const ids = orderHistory.map(order => parseInt(order.pedidoId.split(' ')[1])); // Extrae los números de los IDs.
    return Math.max(...ids) + 1; // Encuentra el máximo y suma 1.
}

// Selecciona los elementos del DOM para mostrar los productos y el total.
const productList = document.getElementById('productList');
const totalDisplay = document.getElementById('total');
const popup = document.getElementById('popup');
const orderHistoryContainer = document.getElementById('orderHistory');

// Función para cargar los pedidos guardados desde el almacenamiento local.
function initializeOrders() {
    const savedOrders = JSON.parse(localStorage.getItem('orders')) || [];
    return savedOrders;
}

// Se inicializa el historial de pedidos con los datos del almacenamiento local.
let orderHistory = initializeOrders();

// Función para guardar los pedidos en el almacenamiento local.
function saveOrdersToLocalStorage() {
    localStorage.setItem('orders', JSON.stringify(orderHistory));
}

function renderProducts() {
    for (const [categoria, productos] of Object.entries(catalogo)) {
        // Crear un contenedor para cada categoría
        const categoryContainer = document.createElement('div');
        categoryContainer.classList.add('category-container');

        // Crear el botón de la categoría
        const categoryButton = document.createElement('button');
        categoryButton.classList.add('category-btn');
        categoryButton.textContent = categoria;
        categoryContainer.appendChild(categoryButton);

        // Crear el contenedor para la lista de productos (inicialmente oculto)
        const productList = document.createElement('div');
        productList.classList.add('product-list');
        productList.style.display = 'none'; // Ocultar inicialmente
        categoryContainer.appendChild(productList);

        // Agregar los productos de la categoría al contenedor oculto
        for (const [producto, precio] of Object.entries(productos)) {
            const productButton = document.createElement('button');
            productButton.classList.add('blue-btn');
            productButton.textContent = `${producto}: $${precio}`;
            productButton.onclick = () => addToInvoice(producto, precio, categoria); // Agregar producto al pedido
            productList.appendChild(productButton);
        }

        // Agregar funcionalidad para mostrar/ocultar la lista de productos
        categoryButton.onclick = () => {
            productList.style.display = productList.style.display === 'none' ? 'block' : 'none';
        };

        // Agregar todo al contenedor principal
        const mainProductList = document.getElementById('productList'); // El contenedor principal en el DOM
        mainProductList.appendChild(categoryContainer);
    }
}

// Selecciona los elementos del DOM
const showCartButton = document.getElementById('showCartButton');
const cartModal = document.getElementById('cartModal');
const closeCartModal = document.getElementById('closeCartModal');
const cartItemsList = document.getElementById('cartItemsList');
const cartTotalDisplay = document.getElementById('cartTotal');

// Función para cargar el contenido del carrito en el modal
function loadCartModal() {
  cartItemsList.innerHTML = ''; // Limpia el contenido previo
  let totalCartAmount = 0;

  for (const producto in cart) {
    const listItem = document.createElement('li');
    listItem.textContent = `${producto} x${cart[producto]}: $${cart[producto] * catalogo[findCategory(producto)][producto]}`;
    cartItemsList.appendChild(listItem);

    // Calcula el total del carrito
    totalCartAmount += cart[producto] * catalogo[findCategory(producto)][producto];
  }

  cartTotalDisplay.textContent = `Total: $${totalCartAmount}`;
}

// Función para encontrar la categoría de un producto en el catálogo
function findCategory(producto) {
  for (const categoria in catalogo) {
    if (catalogo[categoria][producto] !== undefined) {
      return categoria;
    }
  }
  return null; // Devuelve null si no encuentra el producto
}

// Event listener para abrir el modal
showCartButton.addEventListener('click', () => {
  loadCartModal();
  cartModal.style.display = 'block';
});

// Event listener para cerrar el modal
closeCartModal.addEventListener('click', () => {
  cartModal.style.display = 'none';
});

// Cierra el modal si el usuario hace clic fuera de él
window.addEventListener('click', (event) => {
  if (event.target === cartModal) {
    cartModal.style.display = 'none';
  }
});


// Objeto que almacenará las cantidades de cada producto
let cart = {};

// Función para agregar un producto a la lista de productos seleccionados.
function addToInvoice(producto, precio, categoria) {
    // Mostrar mensaje de confirmación con el nombre del producto seleccionado
    const confirmSelection = confirm(`Has seleccionado: ${producto}. ¿Deseas añadirlo al pedido?`);
    if (!confirmSelection) {
        return; // Salir de la función si el usuario no confirma
    }
    selectedProducts.push({ producto, precio, categoria });
    // Si el producto ya está en el carrito, incrementamos la cantidad
    if (cart[producto]) {
        cart[producto]++;
    } else {
        // Si el producto no está en el carrito, lo agregamos con cantidad 1
        cart[producto] = 1;
    }
    
    // Actualizamos la visualización de la cantidad al lado del producto
    updateProductQuantity(producto);
    
    total += precio;
    updateTotal();
}

// Función para actualizar la cantidad de un producto en la interfaz
function updateProductQuantity(producto) {
    const productButtons = document.querySelectorAll('.product-btn');
    
    // Recorremos los botones de los productos para encontrar el que coincide con el nombre del producto
    productButtons.forEach(button => {
        if (button.textContent.startsWith(producto)) {
            // Buscamos el nombre del producto en el texto del botón
            const quantity = cart[producto];
            button.textContent = `${producto}: $${catalogo[categoria][producto]} x${quantity}`; // Actualizamos el texto con la cantidad
        }
    });
}

// Función para actualizar el carrito visualmente
function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = ''; // Limpiamos el carrito actual
    
    // Recorremos el carrito y mostramos los productos con las cantidades
    for (const producto in cart) {
        const listItem = document.createElement('li');
        listItem.textContent = `${producto}: x${cart[producto]}`;
        cartItems.appendChild(listItem);
    }
}


// Función para actualizar el total mostrado en la interfaz.
function updateTotal() {
    totalDisplay.textContent = `Total: $${total}`;
}

// Función para obtener la fecha y hora formateadas en formato 12 horas con AM/PM.
function getFormattedTimestamp() {
    const now = new Date();
    const options = {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    };
    const time = now.toLocaleTimeString('es-ES', options);
    return `${time}`;
}

// Función para finalizar el pedido.
function finalizeOrder() {
    const mesa = document.getElementById('mesa').value;
    const descripcion = document.getElementById('descripcion').value;
    const hora = getFormattedTimestamp(); // Llama a la función para obtener la hora actual.

    if (selectedProducts.length === 0) {
        alert('No hay productos seleccionados.');
        return;
    }

    const order = {
        mesa,
        descripcion,
        productos: [...selectedProducts],
        total,
        pedidoId: `Pedido ${orderCounter}`,
        timestamp: hora // Obtiene la fecha y hora formateadas
    };

    orderHistory.push(order);
    saveOrdersToLocalStorage();

    orderCounter++; // Incrementa el contador.
    saveOrderCounter(); // Guarda el nuevo valor en el storage.

    selectedProducts = [];
    total = 0;
    updateTotal();
    clearMainFields();
    alert('Pedido finalizado.');
    updateOrderHistory();
}

// Función para limpiar los campos de la mesa y la descripción.
function clearMainFields() {
    document.getElementById('mesa').value = '';
    document.getElementById('descripcion').value = '';
}

// Función para alternar la visibilidad del historial de pedidos.
function toggleOrderHistory() {
    if (popup.style.display === 'none' || popup.style.display === '') {
        updateOrderHistory();
        popup.style.display = 'block';
    } else {
        popup.style.display = 'none';
    }
}

// Función para eliminar un pedido del historial.
function deleteOrder(index) {
    if (confirm('¿Estás seguro de eliminar este pedido?')) {
        orderHistory.splice(index, 1); // Elimina el pedido del historial
        saveOrdersToLocalStorage();
        updateOrderHistory();
    }
}

// Función para habilitar la edición de un pedido.
function editOrder(index) {
    editingOrderIndex = index;
    updateOrderHistory();
}

// Función para actualizar la vista del historial de pedidos.
function updateOrderHistory() {
    orderHistoryContainer.innerHTML = '';

    // Verifica si el historial está vacío
    if (orderHistory.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'Historial vacío';
        orderHistoryContainer.appendChild(emptyMessage);
    } else {
        orderHistory.forEach((order, index) => {
            const orderDiv = document.createElement('div');
            orderDiv.innerHTML = 
                `<h4>${order.pedidoId}</h4>
                <p><strong>Hora:</strong> ${order.timestamp}</p> <!-- Modificado para mostrar la hora -->
                <p><strong>Mesa:</strong> ${order.mesa}</p> <!-- Modificado para mostrar "Mesa" en negrita -->
                <p><strong>Descripción:</strong> ${order.descripcion}</p> <!-- Modificado para mostrar "Descripción" en negrita -->
                <ul>
                    ${summarizeProducts(order.productos).map(p => `<li>${p.producto} (${p.categoria}) x${p.cantidad}: $${p.total}</li>`).join('')}
                </ul>
                <p><strong>Total:</strong> $${order.total}</p> <!-- Modificado para mostrar "Total" en negrita -->
                <button class="green-btn" onclick="editOrder(${index})">Editar</button>
                <button class="red-btn" onclick="deleteOrder(${index})">Eliminar</button>`;

            orderHistoryContainer.appendChild(orderDiv);

            // Si el pedido está siendo editado, mostrar la sección de edición.
            if (editingOrderIndex === index) {
                const editSection = createEditSection(order);
                orderDiv.appendChild(editSection);
            }
        });
    }
}

// Función para agregar un producto al pedido editado.
function addProductToOrder(order, producto, precio, categoria) {
    order.productos.push({ producto, precio, categoria });
    recalculateTotal(order);
    updateOrderHistory();
}

// Función para eliminar un producto de un pedido editado.
function removeProductFromOrder(index) {
    const order = orderHistory[editingOrderIndex];
    order.productos.splice(index, 1);
    recalculateTotal(order);
    updateOrderHistory();
}

// Función para recalcular el total de un pedido editado.
function recalculateTotal(order) {
    order.total = order.productos.reduce((sum, p) => sum + p.precio, 0);
    saveOrdersToLocalStorage();
}

// Función para guardar un pedido después de ser editado.
function saveEditedOrder() {
    const order = orderHistory[editingOrderIndex];

    // Actualiza los campos de mesa y descripción con los valores nuevos
    order.mesa = document.getElementById('editMesa').value;
    order.descripcion = document.getElementById('editDescripcion').value;

    // Guarda los cambios en el almacenamiento local
    saveOrdersToLocalStorage();

    editingOrderIndex = null; // Termina el proceso de edición
    alert('Pedido actualizado.');

    // Actualiza la vista del historial de pedidos
    updateOrderHistory();
}

// Función para cancelar la edición de un pedido.
function cancelEdit() {
    editingOrderIndex = null;
    updateOrderHistory();
}

// Función para resumir los productos de un pedido, calculando la cantidad y el total por producto.
function summarizeProducts(products) {
    const summary = {};

    // Recorre los productos y los agrupa por nombre, calculando la cantidad de cada uno.
    products.forEach(({ producto, precio, categoria }) => {
        if (!summary[producto]) {
            summary[producto] = { producto, precio, categoria, cantidad: 0 };
        }
        summary[producto].cantidad += 1;
    });

    // Devuelve un arreglo con los productos, agregando el total (precio * cantidad).
    return Object.values(summary).map(p => ({
        ...p,
        total: p.precio * p.cantidad
    }));
}

// Función para crear la sección de edición de un pedido.
function createEditSection(order) {
    const editSection = document.createElement('div');
    editSection.classList.add('edit-section');
    editSection.innerHTML = `
        <h4>Editando ${order.pedidoId}</h4>
        <label for="editMesa">Mesa:</label>
        <input type="text" id="editMesa" value="${order.mesa || ''}" placeholder="Número de mesa">
        <label for="editDescripcion">Descripción:</label>
        <input type="text" id="editDescripcion" value="${order.descripcion}" placeholder="Descripción del pedido">
        <h5>Agregar Producto</h5>
        <div id="editProductList"></div>
        <button class="green-btn" onclick="saveEditedOrder()">Guardar cambios</button>
        <button class="red-btn" onclick="cancelEdit()">Cancelar</button>
    `;

    const productList = editSection.querySelector('#editProductList');

    // Lista los productos que ya están en el pedido.
    order.productos.forEach((producto, index) => {
        const productDiv = document.createElement('div');
        productDiv.innerHTML = `
            <span>${producto.producto} (${producto.categoria}) - $${producto.precio}</span>
            <button class="red-btn" onclick="removeProductFromOrder(${index})">Eliminar</button>
        `;
        productList.appendChild(productDiv);
    });

    // Agrega los botones para añadir más productos del catálogo.
    for (const [categoria, productos] of Object.entries(catalogo)) {
        const categoryDiv = document.createElement('div');
        const categoryTitle = document.createElement('h5');
        categoryTitle.textContent = categoria;
        categoryDiv.appendChild(categoryTitle);

        for (const [producto, precio] of Object.entries(productos)) {
            const button = document.createElement('button');
            button.classList.add('blue-btn');
            button.textContent = `${producto}: $${precio}`;
            button.onclick = () => addProductToOrder(order, producto, precio, categoria);
            categoryDiv.appendChild(button);
        }
        productList.appendChild(categoryDiv);
    }

    return editSection;
}

// Inicializa la renderización de productos en la página y el historial de pedidos.
renderProducts();
updateOrderHistory();
