
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

// Asignar eventos a los botones
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("clearHistoryBtn").addEventListener("click", clearOrderHistory);
});

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
    const mainProductList = document.getElementById('productList'); // Contenedor principal

    let activeProductList = null; // Almacena la categoría desplegada actualmente

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

        // Modificación: Asegurar que solo una categoría esté abierta a la vez
        categoryButton.onclick = () => {
            if (activeProductList && activeProductList !== productList) {
                activeProductList.style.display = 'none'; // Cierra la anterior
            }

            // Alternar visibilidad de la categoría seleccionada
            productList.style.display = productList.style.display === 'none' ? 'block' : 'none';

            // Actualizar la referencia de la lista activa
            activeProductList = productList.style.display === 'block' ? productList : null;
        };

        // Agregar todo al contenedor principal
        mainProductList.appendChild(categoryContainer);
    }
}



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

// Función para actualizar el total mostrado en la interfaz.
function updateTotal() {
    totalDisplay.textContent = `Total: $${total}`;

    // Agregar la clase de animación
    totalDisplay.classList.add('shake');

    // Remover la clase después de la animación para que se pueda repetir
    setTimeout(() => {
        totalDisplay.classList.remove('shake');
    }, 500);
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
        pedidoId: `Pedido ${getNextPedidoId()}`,
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

// Funcion para eliminar el historial de pedidos
function clearOrderHistory() {
    if (confirm('¿Estás seguro de eliminar todo el historial de pedidos?')) {
        orderHistory = []; // Vaciar el historial
        saveOrdersToLocalStorage(); // Guardar el cambio en localStorage
        updateOrderHistory(); // Actualizar la vista
        alert('Historial de pedidos eliminado.');
    }
}

// Función para limpiar los campos de la mesa y la descripción.
function clearMainFields() {
    document.getElementById('mesa').value = '';
    document.getElementById('descripcion').value = '';
}

function cerrarPopup(event) {
    if (event.target.id === "popup") { // Solo cierra si se hace clic fuera
        document.getElementById("popup").style.display = "none";
    }
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
    // Si ya se está editando el mismo pedido, se cierra la edición
    if (editingOrderIndex === index) {
        editingOrderIndex = null; // Cierra la edición
    } else {
        editingOrderIndex = index; // Activa la edición en ese pedido
    }
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
            orderDiv.classList.add('order-container'); // Agregar la clase para el contenedor del pedido
            
            // Aplicar clase si el pedido está listo
            if (order.listo) {
                orderDiv.classList.add("pedido-listo");
            }

            // Si el pedido está listo, deshabilitar el botón
            let listoButtonHTML = order.listo
                ? `<button class="green-btn listo-btn" disabled>✓ Listo</button>` // Botón deshabilitado
                : `<button class="green-btn listo-btn" onclick="marcarPedidoListo(${index})">¡Listo!</button>`;

                // Botón "Editar" (deshabilitado si el pedido está listo)
            let editButtonHTML = order.listo
                ? `<button class="green-btn" disabled>Editar</button>`  
                : `<button class="green-btn" onclick="editOrder(${index})">Editar</button>`;

            // Crear el contenido del pedido
            orderDiv.innerHTML = 
                `<h4>${order.pedidoId}</h4>
                <p><strong>Hora:</strong> ${order.timestamp}</p> <!-- Modificado para mostrar la hora -->
                <p><strong>Mesa:</strong> ${order.mesa}</p> <!-- Modificado para mostrar "Mesa" en negrita -->
                <p><strong>Descripción:</strong> ${order.descripcion}</p> <!-- Modificado para mostrar "Descripción" en negrita -->
                <ul>
                    ${summarizeProducts(order.productos).map(p => `<li>${p.producto} (${p.categoria}) x${p.cantidad}: $${p.total}</li>`).join('')}
                </ul>
                <p><strong>Total:</strong> $${order.total}</p> <!-- Modificado para mostrar "Total" en negrita -->
                ${editButtonHTML} 
                ${listoButtonHTML}
                <button class="red-btn" onclick="deleteOrder(${index})">Eliminar</button>`;

            
            // Insertar el contenedor del pedido en el historial
            orderHistoryContainer.appendChild(orderDiv);

            // Si el pedido está siendo editado, mostrar la sección de edición.
            if (editingOrderIndex === index) {
                const editSection = createEditSection(order);
                orderDiv.appendChild(editSection);
            }
        });
    }

    // Guardar en localStorage
    localStorage.setItem("orders", JSON.stringify(orderHistory));
}

function marcarPedidoListo(index, boton) {
    const confirmar = confirm("¿Estás seguro de que este pedido está listo?");
    if (confirmar) {
        orderHistory[index].listo = true; // Marcar como listo
        localStorage.setItem("orders", JSON.stringify(orderHistory)); // Guardar en localStorage
        updateOrderHistory(); // Actualizar la vista
    }
}

function loadOrderHistory() {
    const savedOrders = localStorage.getItem("orders");
    if (savedOrders) {
        orderHistory = JSON.parse(savedOrders);
    }
    updateOrderHistory(); // Refrescar la vista
}

// Cargar los pedidos cuando la página se abre
document.addEventListener("DOMContentLoaded", loadOrderHistory);


// Función para agregar un producto al pedido editado.
function addProductToOrder(order, producto, precio, categoria) {
    const confirmAdd = confirm(`¿Deseas añadir "${producto}" al pedido?`);
    if (!confirmAdd) {
        return; // Salir si el usuario cancela
    }

    order.productos.push({ producto, precio, categoria });
    recalculateTotal(order);
    updateOrderHistory();
}

// Función para eliminar un producto de un pedido editado.
function removeProductFromOrder(index) {
    const confirmRemove = confirm('¿Estás seguro de eliminar este producto del pedido?');
    if (!confirmRemove) {
        return; // Salir si el usuario cancela
    }
    
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
        <h4>Editando Pedido #${order.pedidoId}</h4>

        <fieldset>
            <legend>Detalles del Pedido</legend>
            <label for="editMesa">Mesa:</label>
            <input type="text" id="editMesa" value="${order.mesa || ''}" placeholder="Número de mesa">
            
            <label for="editDescripcion">Descripción:</label>
            <input type="text" id="editDescripcion" value="${order.descripcion}" placeholder="Ej: Sin cebolla, extra queso">
        </fieldset>

        <fieldset>
            <legend>Productos en el Pedido</legend>
            <div id="editProductList"></div>
        </fieldset>

        <fieldset>
            <legend>Agregar Producto</legend>
            <select id="productSelect">
                <option value="" disabled selected>Selecciona un producto</option>
                ${Object.entries(catalogo).map(([categoria, productos]) =>
                    Object.entries(productos).map(([producto, precio]) => 
                        `<option value="${producto}" data-precio="${precio}" data-categoria="${categoria}">
                            ${producto} (${categoria}) - $${precio}
                        </option>`
                    ).join('')
                ).join('')}
            </select>
            <button class="blue-btn" id="addProductBtn">Añadir Producto</button>
        </fieldset>

        <div class="edit-buttons">
            <button class="green-btn" onclick="saveEditedOrder()">✅ Guardar cambios</button>
            <button class="red-btn" onclick="cancelEdit()">❌ Cancelar</button>
        </div>
    `;

    const productList = editSection.querySelector('#editProductList');

    // Lista los productos ya añadidos al pedido.
    order.productos.forEach((producto, index) => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product-item');
        productDiv.innerHTML = `
            <span>${producto.producto} (${producto.categoria}) - $${producto.precio}</span>
            <button class="red-btn" onclick="removeProductFromOrder(${index})">🗑 Eliminar</button>
        `;
        productList.appendChild(productDiv);
    });

    // Añadir el evento para el botón "Añadir Producto"
    const addProductBtn = editSection.querySelector('#addProductBtn');
    addProductBtn.onclick = function() {
        // Obtener el producto seleccionado del select
        const select = document.getElementById('productSelect');
        const selectedOption = select.options[select.selectedIndex];

        if (selectedOption.value) {
            const producto = selectedOption.value;
            const precio = parseFloat(selectedOption.getAttribute('data-precio'));
            const categoria = selectedOption.getAttribute('data-categoria');

            // Llamar a la función para añadir el producto al pedido
            addProductToOrder(order, producto, precio, categoria);

            // Limpiar la selección
            select.selectedIndex = 0;
        } else {
            alert("Por favor, selecciona un producto.");
        }
    };

    return editSection;
}

// Inicializa la renderización de productos en la página y el historial de pedidos.
renderProducts();
updateOrderHistory();
