if (sessionStorage.getItem("user") === null) {
    window.location.href = "../index.html";
    
}
function mostrarPopUp(notes) {
    alert(notes);
  }
document.addEventListener("DOMContentLoaded", async function () {
 
    const ordersContainer = document.getElementById("orders-container");
    ordersContainer.innerHTML = `<p class="loading-message">🔄 Cargando pedidos...</p>`;


    try {
        const response = await fetch('https://menta-backend.vercel.app/order/confirmation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: JSON.parse(sessionStorage.getItem('user')).id }),
        });

        const apiResponse = await response.json();
        console.log(apiResponse);

        if (!apiResponse.valid) {
            alert("Error al obtener pedidos.");
            return;
        }

        let orders = apiResponse.data;

        ordersContainer.innerHTML = ""; // Limpiar loading antes de agregar los pedidos

        if (!apiResponse.valid || apiResponse.data.length === 0) {
            ordersContainer.innerHTML = `<p class="no-orders">❌ No hay pedidos disponibles.</p>`;
            return;
        }


        // 🔹 Ordenar por horario de entrega (del más próximo al más lejano)
        orders.sort((a, b) => new Date(a.deliveryTime) - new Date(b.deliveryTime));

        orders.forEach(order => {
            const card = document.createElement("div");
            card.classList.add("order-card");

            // Colores según estado del pedido
            let statusColor = order.status === "PENDING" ? "orange" : "green";

            // Formateo de fechas a "DD/MM/YYYY HH:mm"
            let createdAt = new Date(order.createdAt).toLocaleString("es-ES", { 
                day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" 
            });

            let deliveryTime = new Date(order.hour).toLocaleString("es-ES", { 
                day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" 
            });
            let phoneNumber = order.user.phone.replace(/\D/g, ""); // Solo deja números
            let whatsappLink = `https://wa.me/${phoneNumber}`;
            card.innerHTML = `
            <div>
                <div class="order-header">
                    <h2>Orden #${order.number}</h2>
                    <span class="order-status" style="background-color: ${statusColor};">${order.status}</span>
                </div>
                <p><strong>Cliente:</strong> ${order.user.name} ${order.user.surname}</p>
                <p><strong>Horario de Pedido:</strong> ${createdAt}</p>
                <p><strong>Horario de Entrega:</strong> ${deliveryTime}</p>
                </div>
                <div class="order-items">
                    ${order.food_pedido.map(item => `
                        <div class="order-item">
                            <img src="${item.food.image}" alt="${item.food.name}">
                            <div class="order-details">
                                <p><strong>${item.food.name}</strong></p>
                               
                                <p><strong>Cantidad:</strong> ${item.quantity}</p>
                                <p><strong>Precio:</strong> $${item.price}</p>
                            </div>
                        </div>
                    `).join("")}
                </div>
                <hr>
                <p class="order-total"><strong>Total:</strong> $${order.total}</p>
                <div class="order-actions">
                <a href="${whatsappLink}" target="_blank" class="whatsapp-icon">
                                    <button>Contactar por Whatsapp</button>

                </a>
                 <button class="order-button" id="order-button" onClick="mostrarPopUp('${order.notes}')">Notas</button>
                 <button class="order-button" id="order-button" onClick="mostrarPopUp('${order.address}')">Modificar</button>
                 </div>
                <div class="order-actions">
                    <button class="confirm-button" data-id="${order.id}">✅ Confirmar</button>
                    <button class="cancel-button" data-id="${order.id}">❌ Cancelar</button>
                </div>
            `;

            ordersContainer.appendChild(card);
            
        });
        

        // Event listener para los botones
        document.querySelectorAll(".confirm-button").forEach(button => {
            button.addEventListener("click", function () {
                handleAction(this, "confirmado");
            });
        });

        document.querySelectorAll(".cancel-button").forEach(button => {
            button.addEventListener("click", function () {
                handleAction(this, "cancelado");
            });
        });

    } catch (error) {
        console.error("Error al obtener pedidos:", error);
    }
});

// Función para manejar acciones de confirmación/cancelación
async function handleAction(button, action) {
    
    try {
       let data = await fetch('https://menta-backend.vercel.app/order', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderId: button.dataset.id, status: action === "confirmado" ? "CONFIRMED" : "CANCELLED", userId: JSON.parse(sessionStorage.getItem('user')).id }),
        });
        
        if (data.status === 200) {
            const orderCard = button.closest(".order-card");
            orderCard.remove();
            alert(`Pedido marcado como ${action}.`);
            
        }
    } catch (error) {
        console.error(`Error al marcar pedido como ${action}:`, error);
        
    }
        // Mostrar pop-up de éxito
    // Mostrar pop-up de éxito
    
}

// Función para volver a admin.html
function goBack() {
    window.location.href = "../home/admin.html";
}
