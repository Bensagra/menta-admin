if (sessionStorage.getItem("userId") === null) {
    window.location.href = "../index.html";
}

let categories = [];

document.addEventListener("DOMContentLoaded", async function() {
    categories = await fetch("https://menta-backend.vercel.app/food")
        .then(response => response.json())
        .then(data => data.data);
    console.log(categories);
    const categorySelect = document.getElementById("category");
    const modifyCategorySelect = document.getElementById("modify-category");

    categories.forEach(category => {
        let option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);

        let modifyOption = option.cloneNode(true);
        modifyCategorySelect.appendChild(modifyOption);
    });
});

function goBack() {
    window.location.href = "../home/admin.html";
}

document.getElementById("food-form").addEventListener("submit", async function(event) {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append("name", document.getElementById("name").value);
    formData.append("description", document.getElementById("description").value);
    formData.append("price", document.getElementById("price").value);
    formData.append("categoryId", document.getElementById("category").value);
    
    const imageFile = document.getElementById("image").files[0];
    if (imageFile) {
        formData.append("image", imageFile);
    }
    
    try {
        const response = await fetch("https://menta-backend.vercel.app/food", {
            method: "POST",
            body: formData
        });
        
        if (response.ok) {
            alert("Comida agregada exitosamente");
            document.getElementById("food-form").reset();
            document.getElementById("preview").style.display = "none";
        } else {
            alert("Error al agregar comida");
        }
    } catch (error) {
        alert("Hubo un problema al enviar los datos");
        console.error(error);
    }
});

document.getElementById("modify-button").addEventListener("click", function() {
    document.getElementById("add-section").style.display = "none";
    document.getElementById("modify-section").style.display = "block";
    cargarCatgorias();
});

document.getElementById("back-to-add").addEventListener("click", function() {
    document.getElementById("add-food").style.display = "block";
    document.getElementById("add-section").style.display = "block";
    document.getElementById("modify-section").style.display = "none";
    document.getElementById("modify-food").style.display = "none";
    document.getElementById("delete-food").style.display = "none";
    document.getElementById("food-form").reset();
    document.getElementById("preview").style.display = "none";
});

document.getElementById("modify-category").addEventListener("change", function() {
    cargarCatgorias();
});

const cargarCatgorias = async () => {
    console.log("Cargando categorias");
    const categoryId = document.getElementById("modify-category").value;
    const foodListDiv = document.getElementById("food-list");
    foodListDiv.innerHTML = "";

    const selectedCategory = categories.find(cat => cat.id == categoryId);
    if (selectedCategory && selectedCategory.food) {
        selectedCategory.food.forEach(foodItem => {
            let div = document.createElement("div");
            div.classList.add("food-item");
            div.addEventListener("click", () => fillFormWithFood(foodItem, categoryId));
            div.innerHTML = `<img src="${foodItem.image}" alt="${foodItem.name}">
                             <div style="width: 65%;">
                                <strong>${foodItem.name}</strong>
                                <p>${foodItem.description}</p>
                                <p>Precio: $${foodItem.price}</p>
                             </div>`;
            foodListDiv.appendChild(div);
        });
    }
};

document.getElementById("delete-food").addEventListener("click", async function() {
    const foodName = document.getElementById("name").value;
    if (confirm(`¿Estás seguro de eliminar la comida ${foodName}?`)) {
        try {
            const response = await fetch(`https://menta-backend.vercel.app/food?id=${sessionStorage.getItem("foodId")}`, {
                method: "DELETE"
            });
            
            if (response.ok) {
                alert("Comida eliminada exitosamente");
                document.getElementById("food-form").reset();
                document.getElementById("preview").style.display = "none";
            } else {
                alert("Error al eliminar comida");
            }
        } catch (error) {
            alert("Hubo un problema al enviar los datos");
            console.error(error);
        }
    }
});

document.getElementById("modify-food").addEventListener("click", async function() {
    const foodId = sessionStorage.getItem("foodId");
    if (!foodId) {
        alert("No hay una comida seleccionada para modificar");
        return;
    }

    const originalData = JSON.parse(sessionStorage.getItem("originalFoodData") || "{}");

    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const price = document.getElementById("price").value;
    const categoryId = document.getElementById("category").value;
    const imageFile = document.getElementById("image").files[0];

    const formData = new FormData();
    formData.append("id", foodId);
    if (name !== originalData.name) formData.append("name", name);
    if (description !== originalData.description) formData.append("description", description);
    if (price !== originalData.price) formData.append("price", price);
    if (categoryId !== originalData.categoryId) formData.append("categoryId", categoryId);
    if (imageFile) formData.append("image", imageFile);

    if ([...formData.keys()].length === 0) {
        alert("No hay cambios para actualizar");
        return;
    }

    console.log("Datos en FormData:");
    for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
    }
    try {
        const response = await fetch("https://menta-backend.vercel.app/food", {
            method: "PUT",
            body: formData
        });

        if (response.ok) {
            alert("Comida modificada exitosamente");
            document.getElementById("food-form").reset();
            document.getElementById("preview").style.display = "none";
        } else {
            alert("Error al modificar comida");
        }
    } catch (error) {
        alert("Hubo un problema al enviar los datos");
        console.error(error);
    }
});

// Función para cargar los datos originales al seleccionar una comida
function loadFoodData(foodItem) {
        document.getElementById("name").value = foodItem.name;
        document.getElementById("description").value = foodItem.description;
        document.getElementById("price").value = foodItem.price;
        document.getElementById("category").value = foodItem.categoryId;
        document.getElementById("preview").src = foodItem.image;
        document.getElementById("preview").style.display = "block";
        document.getElementById("stock-switch").checked = foodItem.stock === true;
    
        sessionStorage.setItem("foodId", foodItem.id);
        sessionStorage.setItem("originalFoodData", JSON.stringify({
            name: foodItem.name,
            description: foodItem.description,
            price: foodItem.price,
            categoryId: foodItem.categoryId,
            stock: foodItem.stock
        }));
    }


function fillFormWithFood(foodItem, categoryId) {
    sessionStorage.setItem("foodId", foodItem.id);
    loadFoodData(foodItem);
    document.getElementById("name").value = foodItem.name;
    document.getElementById("description").value = foodItem.description;
    document.getElementById("price").value = foodItem.price;
    document.getElementById("category").value = categoryId;
    document.getElementById("preview").src = foodItem.image;
    document.getElementById("preview").style.display = "block";
    document.getElementById("add-food").style.display = "none";
    document.getElementById("modify-food").style.display = "block";
    document.getElementById("delete-food").style.display = "block";
    
    document.getElementById("add-section").style.display = "block";
    document.getElementById("modify-section").style.display = "none";
}

document.getElementById("stock-switch").addEventListener("change", async function() {
    const foodId = sessionStorage.getItem("foodId");
    if (!foodId) {
        alert("No hay una comida seleccionada");
        return;
    }

    try {
        const response = await fetch("https://menta-backend.vercel.app/food/stock", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: parseInt(foodId),
            })
        });
        console.log(await response.json());
        console.log(foodId);

        if (await response.ok) {
            alert("Estado de stock actualizado correctamente");
        } else {
            alert("Error al actualizar el estado de stock");
        }
    } catch (error) {
        alert("Hubo un problema al actualizar el stock");
        console.error(error);
    }
});