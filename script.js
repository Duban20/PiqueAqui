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
        "Madurito Ranchero": 11000
    },
    "Adicionales": {
        "Lluvia de Queso Costeño": 3000,
        "Porción de Papa Criolla": 4000
    },
    "Bebidas": {
        "Jugo de Corozo": 3000,
        "Jugo Hit": 4000,
        "Agua": 3000,
        "Gaseosa Postobón": 4000,
        "CocaCola": 4000
    }
};

// Objeto que contiene el catálogo de productos, organizado por categorías y precios.
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

// Función para renderizar los productos en el catálogo en la interfaz.
function renderProducts() {
    for (const [categoria, productos] of Object.entries(catalogo)) {
        const categoryTitle = document.createElement('h3');
        categoryTitle.textContent = categoria;
        productList.appendChild(categoryTitle);

        // Se agregan botones para cada producto con su precio.
        for (const [producto, precio] of Object.entries(productos)) {
            const button = document.createElement('button');
            button.classList.add('blue-btn');
            button.textContent = `${producto}: $${precio}`;
            button.onclick = () => addToInvoice(producto, precio, categoria); // Al hacer clic se agrega el producto a la factura
            productList.appendChild(button);
        }
    }
}

// Función para agregar un producto a la lista de productos seleccionados.
function addToInvoice(producto, precio, categoria) {
    selectedProducts.push({ producto, precio, categoria });
    total += precio;
    updateTotal();
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
        second: 'numeric',
        hour12: true,
    };
    const time = now.toLocaleTimeString('es-ES', options);
    const date = now.toLocaleDateString('es-ES');
    return `${date} a las ${time}`;
}

// Función para finalizar el pedido.
function finalizeOrder() {
    const mesa = document.getElementById('mesa').value;
    const descripcion = document.getElementById('descripcion').value;

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
        timestamp: getFormattedTimestamp() // Obtiene la fecha y hora formateadas
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
            orderDiv.innerHTML = `
                <h4>${order.pedidoId}</h4>
                <p><b>Fecha y Hora:</b> ${order.timestamp}</p> <!-- Muestra fecha y hora en formato 12h con AM/PM -->
                <p><b>Mesa:</b> ${order.mesa}</p>
                <p><b>Descripción:</b> ${order.descripcion}</p>
                <ul>
                    ${summarizeProducts(order.productos).map(p => `<li>${p.producto} (${p.categoria}) x${p.cantidad}: $${p.total}</li>`).join('')}
                </ul>
                <p><b>Total:</b> $${order.total}</p>
                <button class="red-btn" onclick="deleteOrder(${index})">Eliminar</button>
            `;

            orderHistoryContainer.appendChild(orderDiv);
        });
    }
}

// Función para resumir los productos de un pedido, calculando la cantidad y el total por producto.
function summarizeProducts(products) {
    const summary = {};

    products.forEach(({ producto, precio, categoria }) => {
        if (!summary[producto]) {
            summary[producto] = { producto, precio, categoria, cantidad: 0 };
        }
        summary[producto].cantidad += 1;
    });

    return Object.values(summary).map(p => ({
        ...p,
        total: p.precio * p.cantidad
    }));
}

// Inicializa la renderización de productos en la página y el historial de pedidos.
renderProducts();
updateOrderHistory();
