
// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM elements
const coffeeMenuContainer = document.getElementById('coffee-menu');
const foodMenuContainer = document.getElementById('food-menu');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartBtn = document.getElementById('cart-btn');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartTax = document.getElementById('cart-tax');
const cartTotal = document.getElementById('cart-total');
const emptyCartMessage = document.getElementById('empty-cart-message');
const checkoutBtn = document.getElementById('checkout-btn');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

const searchField = document.getElementById("search-input");
const searchButton = document.getElementById("search-btn");

// the sign in button
const signIn = document.getElementById("sign-in-btn");

//login-modal
const loginModal = document.getElementById("login-modal");

//signup modal
const signUpModal = document.getElementById("signup-modal");
const signUplink = document.getElementById("signup-link");
const modalClose = document.querySelectorAll("#modal-close");

async function fetchApi() {
    const res = await fetch('https://dummyjson.com/products');
    const result = await res.json();
    return result;
}

let menuItems = null;

async function run() {
    menuItems = await fetchApi();
    // console.log(menuItems);
    await displayMenuItems(menuItems);
}

run();

// Display menu items
function displayMenuItems(menuItems) {
    // Coffee items
    coffeeMenuContainer.innerHTML = '';
    menuItems.products.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300';
        itemElement.innerHTML = `
                    <img src="${item.images[0]}" alt="${item.title}" class="w-full h-48 object-cover">
                    <div class="p-4">
                        <h3 class="font-bold text-lg mb-2 text-coffee-800">${item.title}</h3>
                        <p class="text-coffee-600 text-sm mb-4">${item.description}</p>
                        <div class="flex justify-between items-center">
                            <span class="text-coffee-700 font-bold">$${item.price.toFixed(2)}</span>
                            <button class="bg-coffee-600 text-white px-4 py-2 rounded-lg hover:bg-coffee-700 transition duration-300 add-to-cart" data-id="${item.id}">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                `;
        coffeeMenuContainer.appendChild(itemElement);
    });


    // Add event listeners to "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = parseInt(e.target.getAttribute('data-id'));
            addToCart(itemId);
        });
    });
}

// Add item to cart
function addToCart(itemId) {
    // Find item in coffee or food menu
    let item = menuItems.products.find(item => item.id === itemId);
    // if (!item) {
    //     item = menuItems.food.find(item => item.id === itemId);
    // }

    if (!item) return;

    const existingItem = cart.find(cartItem => cartItem.id === itemId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: item.id,
            name: item.title,
            price: item.price,
            image: item.images[0],
            quantity: 1
        });
    }

    updateCart();
    showCart();
}

// Remove item from cart
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCart();
}

// Update quantity
function updateQuantity(itemId, newQuantity) {
    const item = cart.find(item => item.id === itemId);
    if (item) {
        item.quantity = newQuantity;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            updateCart();
        }
    }
}

// Update cart UI and localStorage
function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update cart items
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        emptyCartMessage.classList.remove('hidden');
        cartSubtotal.textContent = '$0.00';
        cartTax.textContent = '$0.00';
        cartTotal.textContent = '$0.00';
        return;
    }

    emptyCartMessage.classList.add('hidden');

    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'py-4 flex';
        cartItemElement.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded">
                    <div class="ml-4 flex-1">
                        <h4 class="font-medium text-coffee-800">${item.name}</h4>
                        <div class="flex justify-between mt-1">
                            <span class="text-coffee-600">$${item.price.toFixed(2)}</span>
                            <div class="flex items-center">
                                <button class="text-coffee-500 hover:text-coffee-700 quantity-decrease" data-id="${item.id}">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <span class="mx-2">${item.quantity}</span>
                                <button class="text-coffee-500 hover:text-coffee-700 quantity-increase" data-id="${item.id}">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <button class="text-red-500 hover:text-red-700 ml-4 remove-item" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
        cartItemsContainer.appendChild(cartItemElement);
    });

    // Update totals
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    cartTax.textContent = `$${tax.toFixed(2)}`;
    cartTotal.textContent = `$${total.toFixed(2)}`;

    // Add event listeners to quantity buttons
    document.querySelectorAll('.quantity-decrease').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = parseInt(e.target.closest('button').getAttribute('data-id'));
            const item = cart.find(item => item.id === itemId);
            if (item) {
                updateQuantity(itemId, item.quantity - 1);
            }
        });
    });

    document.querySelectorAll('.quantity-increase').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = parseInt(e.target.closest('button').getAttribute('data-id'));
            const item = cart.find(item => item.id === itemId);
            if (item) {
                updateQuantity(itemId, item.quantity + 1);
            }
        });
    });

    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = parseInt(e.target.closest('button').getAttribute('data-id'));
            removeFromCart(itemId);
        });
    });
}

// Show/hide cart
function showCart() {
    cartSidebar.classList.remove('translate-x-full');
    cartOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function hideCart() {
    cartSidebar.classList.add('translate-x-full');
    cartOverlay.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Toggle mobile menu
function toggleMobileMenu() {
    mobileMenu.classList.toggle('hidden');
}

// Event listeners
cartBtn.addEventListener('click', showCart);
closeCartBtn.addEventListener('click', hideCart);
cartOverlay.addEventListener('click', hideCart);
mobileMenuBtn.addEventListener('click', toggleMobileMenu);

// Checkout button
checkoutBtn.addEventListener('click', () => {
    if (cart.length > 0) {
        alert('Checkout functionality would be implemented here! Redirecting to payment page.');
        // In a real app, you would redirect to a checkout page
    }
});

// Close mobile menu when clicking a link
document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', toggleMobileMenu);
});

// Initialize the page
// displayMenuItems();
updateCart();

let search = document.getElementById("search");
let searchInput = document.getElementById("search-field");

search.addEventListener("click", openSearch);

function openSearch() {
    searchInput.classList.toggle("hidden");
}

// to search products
// searchfield and search button
searchButton.addEventListener("click", searchProducts)

async function searchProducts() {
    // console.log(searchField.value)
    let res = await fetch(`https://dummyjson.com/products/search?q=${searchField.value}`)
    let data = await res.json();

    menuItems = data;
    await displayMenuItems(data);

}

// Enter key to search for products
searchField.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchProducts();
});

signIn.addEventListener("click", () => {
    loginModal.classList.toggle("hidden");
});

signUplink.addEventListener("click", () => {
    signUpModal.classList.toggle("hidden");
    loginModal.classList.toggle("hidden")
});

modalClose.forEach((btn) => {
    btn.addEventListener("click", (e) => {
        const modal = e.target.closest('.modal');
        if (modal) modal.classList.toggle("hidden");
    });
});