// Collez votre URL Apps Script exacte entre les guillemets
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyV0AQPl9Hv20mNRzQm5jUhMR3c_kP93AzZdjAEtvQwE0tJyS8uWl74DwrbASFKV84P/exec";

let products = [];
let cart = [];

document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
});

async function fetchProducts() {
    try {
        const response = await fetch(APPS_SCRIPT_URL);
        products = await response.json();
        document.getElementById("loading").style.display = "none";
        renderProducts();
    } catch (error) {
        document.getElementById("loading").innerText = "Erreur de chargement des produits.";
    }
}

function renderProducts() {
    const grid = document.getElementById("product-grid");
    grid.innerHTML = "";
    products.forEach(p => {
        grid.innerHTML += `
            <div class="card">
                <img src="${p.image_url}" alt="${p.nom}">
                <div class="card-info">
                    <div class="card-title">${p.nom}</div>
                    <div class="card-price">${p.prix} DA</div>
                    <button class="btn-add" onclick="addToCart('${p.id}')">Ajouter au panier</button>
                </div>
            </div>
        `;
    });
}

function addToCart(id) {
    const prod = products.find(p => p.id === id);
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty++;
    } else {
        cart.push({ ...prod, qty: 1 });
    }
    updateCart();
}

function updateCart() {
    document.getElementById("cart-count").innerText = cart.reduce((sum, i) => sum + i.qty, 0);
    const container = document.getElementById("cart-items");
    container.innerHTML = "";
    
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.prix * item.qty;
        container.innerHTML += `
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span>${item.nom} (x${item.qty})</span>
                <strong>${item.prix * item.qty} DA</strong>
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
        total: cart.reduce((sum, i) => sum + (i.prix * i.qty), 0)
    };

    try {
        await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify(payload)
        });
        alert("Commande enregistrée avec succès ! Nous vous contacterons par téléphone.");
        cart = [];
        updateCart();
        toggleCart();
        document.getElementById("checkout-form").reset();
    } catch (err) {
        alert("Erreur lors de la commande.");
    } finally {
        btn.innerText = "Valider la Commande (Paiement à la livraison)";
        btn.disabled = false;
    }
}
