const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyV0AQPl9Hv20mNRzQm5jUhMR3c_kP93AzZdjAEtvQwE0tJyS8uWl74DwrbASFKV84P/exec";

let products = [];
let cart = [];

document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
});

async function fetchProducts() {
    try {
        const response = await fetch(APPS_SCRIPT_URL);
        const textData = await response.text();
        products = JSON.parse(textData);

        document.getElementById("loading").style.display = "none";
        renderProducts();
    } catch (error) {
        console.error("Erreur de chargement:", error);
        document.getElementById("loading").innerText = "Erreur de chargement des produits.";
    }
}

function renderProducts() {
    const grid = document.getElementById("product-grid");
    grid.innerHTML = "";
    
    if (!products || products.length === 0) {
        grid.innerHTML = "<p>Aucun produit trouvé dans la feuille Google Sheets.</p>";
        return;
    }

    products.forEach(p => {
        grid.innerHTML += `
            <div class="card">
                <img src="${p.image_url || 'https://via.placeholder.com/300'}" alt="${p.nom}">
                <div class="card-info">
                    <div class="card-title">${p.nom}</div>
                    <div class="card-price">${p.prix} DA</div>
                    <button class="btn-add" onclick="addToCart('${p.id}')">Ajouter au panier</button>
                </div>
            </div>
        `;
    });
}

// Augmenter la quantité d'un produit
function addToCart(id) {
    const prod = products.find(p => String(p.id) === String(id));
    if (!prod) return;

    const item = cart.find(i => String(i.id) === String(id));
    if (item) {
        item.qty++;
    } else {
        cart.push({ ...prod, qty: 1 });
    }
    updateCart();
}

// Diminuer la quantité d'un produit
function decreaseQty(id) {
    const item = cart.find(i => String(i.id) === String(id));
    if (!item) return;

    item.qty--;
    if (item.qty <= 0) {
        removeFromCart(id);
    } else {
        updateCart();
    }
}

// Supprimer un produit du panier
function removeFromCart(id) {
    cart = cart.filter(i => String(i.id) !== String(id));
    updateCart();
}

// Mettre à jour l'affichage du panier
function updateCart() {
    document.getElementById("cart-count").innerText = cart.reduce((sum, i) => sum + i.qty, 0);
    const container = document.getElementById("cart-items");
    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = "<p style='text-align:center; color:#777;'>Votre panier est vide.</p>";
        document.getElementById("cart-subtotal").innerText = "0 DA";
        return;
    }

    let subtotal = 0;
    cart.forEach(item => {
        const itemTotal = Number(item.prix) * item.qty;
        subtotal += itemTotal;
        
        container.innerHTML += `
            <div class="cart-item">
                <div>
                    <strong style="display:block;">${item.nom}</strong>
                    <small style="color:#666;">${item.prix} DA × ${item.qty} = ${itemTotal} DA</small>
                </div>
                <div class="cart-controls">
                    <button class="btn-qty" onclick="decreaseQty('${item.id}')">-</button>
                    <span><strong>${item.qty}</strong></span>
                    <button class="btn-qty" onclick="addToCart('${item.id}')">+</button>
                    <button class="btn-delete" onclick="removeFromCart('${item.id}')">🗑️</button>
                </div>
            </div>
        `;
    });
    
    document.getElementById("cart-subtotal").innerText = subtotal + " DA";
}

function toggleCart() {
    const modal = document.getElementById("cart-modal");
    modal.style.display = modal.style.display === "flex" ? "none" : "flex";
}

async function submitOrder(e) {
    e.preventDefault();
    if (cart.length === 0) {
        alert("Votre panier est vide !");
        return;
    }

    const btn = document.getElementById("submit-btn");
    btn.innerText = "Envoi en cours...";
    btn.disabled = true;

    const payload = {
        nom: document.getElementById("cust-name").value,
        telephone: document.getElementById("cust-phone").value,
        adresse: document.getElementById("cust-wilaya").value + " - " + document.getElementById("cust-address").value,
        panier_details: cart.map(i => `${i.nom} (x${i.qty})`).join(", "),
        total: cart.reduce((sum, i) => sum + (Number(i.prix) * i.qty), 0)
    };

    try {
        await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        alert("Commande enregistrée avec succès ! Nous vous contacterons par téléphone.");
        cart = [];
        updateCart();
        toggleCart();
        document.getElementById("checkout-form").reset();
    } catch (err) {
        alert("Erreur lors de la validation de la commande.");
    } finally {
        btn.innerText = "Valider la Commande (Paiement à la livraison)";
        btn.disabled = false;
    }
}
