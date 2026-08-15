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

// Diminuer la quantité ou retirer si égal à 0
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

// Supprimer complètement un produit du panier
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
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid #eee; padding-bottom:8px;">
                <div>
                    <strong style="display:block;">${item.nom}</strong>
                    <small style="color:#666;">${item.prix} DA × ${item.qty} = ${itemTotal} DA</small>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                    <button onclick="decreaseQty('${item.id}')" style="background:#e2e8f0; border:none; padding:4px 10px; border-radius:4px; cursor:pointer; font-weight:bold;">-</button>
                    <span>${item.qty}</span>
                    <button onclick="addToCart('${item.id}')" style="background:#e2e8f0; border:none; padding:4px 10px; border-radius:4px; cursor:pointer; font-weight:bold;">+</button>
                    <button onclick="removeFromCart('${item.id}')" style="background:#ef4444; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; margin-left:6px;">🗑️</button>
                </div>
            </div>
        `;
    });
    
    document.getElementById("cart-subtotal").innerText = subtotal + " DA";
}
