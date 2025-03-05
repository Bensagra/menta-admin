if (sessionStorage.getItem("userId") === null) {
    window.location.href = "../index.html";
    
}

document.addEventListener("DOMContentLoaded", async function () {
    const ordersContainer = document.getElementById("orders-container");
    
    // 🔹 Agrega un mensaje de "Cargando..."
    ordersContainer.innerHTML = `<p class="loading-message">🔄 Cargando pedidos...</p>`;

    try {
        const response = await fetch('https://menta-backend.vercel.app/order/get', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: JSON.parse(sessionStorage.getItem('userId')) }),
        });

        const apiResponse = await response.json();
        console.log(apiResponse);

        ordersContainer.innerHTML = ""; // Limpiar loading antes de agregar los pedidos

        if (!apiResponse.valid || apiResponse.data.length === 0) {
            ordersContainer.innerHTML = `<p class="no-orders">❌ No hay pedidos disponibles.</p>`;
            return;
        }

        let orders = apiResponse.data;

        // 🔹 Ordenar por horario de entrega (del más próximo al más lejano)
        orders.sort((a, b) => new Date(a.deliveryTime) - new Date(b.deliveryTime));

        orders.forEach(order => {
            const card = document.createElement("div");
            card.classList.add("order-card");

            let statusColor = order.status === "PENDING" ? "orange" : "green";

            let createdAt = new Date(order.createdAt).toLocaleString("es-ES", { 
                day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" 
            });

            let deliveryTime = new Date(order.hour).toLocaleString("es-ES", { 
                day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" 
            });

            let phoneNumber = order.user.phone.replace(/\D/g, "");
            let whatsappLink = `https://wa.me/${phoneNumber}`;
            let place = order.local === true ? "Come en el local" : "Para llevar";

            card.innerHTML = `
                <div class="order-header">
                    <h2>Orden #${order.number}</h2>
                    <span class="order-status" style="background-color: ${statusColor};">${order.status}</span>
                                        <h3>${place}</h3>

                </div>
                <p><strong>Cliente:</strong> ${order.user.name} ${order.user.surname}</p>
                <p><strong>Horario de Pedido:</strong> ${createdAt}</p>
                <p><strong>Horario de Entrega:</strong> ${deliveryTime}</p>
                <div class="order-items">
                    ${order.food_pedido.map(item => `
                        <div class="order-item">
                            <img src="${item.food.image}" alt="${item.food.name}">
                            <div class="order-details">
                                <p><strong>${item.food.name}</strong></p>
                                <p>${item.food.description}</p>
                                <p><strong>Cantidad:</strong> ${item.quantity}</p>
                                <p><strong>Precio:</strong> $${item.price}</p>
                            </div>
                        </div>
                    `).join("")}
                </div>
                <hr>
                <p class="order-total"><strong>Total:</strong> $${order.total}</p>
               
                <div class="order-actions">
                    <button class="confirm-button" data-id="${order.id}">✅ Entregado</button>
                    <a href="${whatsappLink}" target="_blank" class="whatsapp-icon">
                        <button>💬 Contactar por WhatsApp</button>
                    </a>
                </div>
            `;

            ordersContainer.appendChild(card);
        });

        document.querySelectorAll(".confirm-button").forEach(button => {
            button.addEventListener("click", function () {
                handleAction(this, "DELIVERED");
            });
        });

    } catch (error) {
        console.error("Error al obtener pedidos:", error);
        ordersContainer.innerHTML = `<p class="error-message">⚠ Error al cargar pedidos.</p>`;
    }
});

async function handleAction(button, action) {
    try {
        let data = await fetch('https://menta-backend.vercel.app/order', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderId: button.dataset.id, status: action, userId: JSON.parse(sessionStorage.getItem('userId')) }),
        });

        if (data.status === 200) {
            const orderCard = button.closest(".order-card");
            orderCard.remove();
            alert(`✅ Pedido marcado como ${action}.`);
        }
    } catch (error) {
        console.error(`Error al marcar pedido como ${action}:`, error);
    }
}

function goBack() {
    window.location.href = "../home/admin.html";
}
