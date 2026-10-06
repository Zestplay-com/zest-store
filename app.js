let cart=[],activeCategory="All",searchQuery="",currentSort="featured";
const WHATSAPP_PHONE_NUMBER="1234567890";

window.addEventListener("DOMContentLoaded",()=>{loadCartFromStorage();renderProducts();updateCartUI()});
function loadCartFromStorage(){try{const saved=localStorage.getItem("zest_cart_data");if(saved)cart=JSON.parse(saved)}catch(e){console.error(e);cart=[]}}
function saveCartToStorage(){localStorage.setItem("zest_cart_data",JSON.stringify(cart));updateCartUI()}

function filterCategory(category){
 activeCategory=category;
 document.querySelectorAll(".category-btn").forEach(btn=>{
  const active=btn.getAttribute("data-category")===category;
  btn.className=active
   ?"category-btn active border px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap bg-zest-600 text-white border-zest-600 shadow-sm"
   :"category-btn border px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100";
 });
 renderProducts();
}
function handleSearch(query){
 searchQuery=query.toLowerCase().trim();
 const desktop=document.getElementById("desktopSearchInput"),mobile=document.getElementById("mobileSearchInput");
 if(desktop&&desktop.value!==query)desktop.value=query;
 if(mobile&&mobile.value!==query)mobile.value=query;
 renderProducts();
}
function handleSort(sortOption){currentSort=sortOption;renderProducts()}

function renderProducts(){
 const grid=document.getElementById("productGrid"),count=document.getElementById("productCount");
 if(!grid)return;
 let filtered=PRODUCTS.filter(p=>(activeCategory==="All"||p.category===activeCategory)&&(p.title.toLowerCase().includes(searchQuery)||p.description.toLowerCase().includes(searchQuery)));
 if(currentSort==="price-low")filtered.sort((a,b)=>a.price-b.price);
 else if(currentSort==="price-high")filtered.sort((a,b)=>b.price-a.price);
 else if(currentSort==="rating")filtered.sort((a,b)=>b.rating-a.rating);
 count.textContent=`Showing ${filtered.length} products`;
 if(!filtered.length){
  grid.innerHTML=`<div class="col-span-full py-16 text-center"><i class="fa-solid fa-magnifying-glass text-4xl text-slate-300 mb-3 block"></i><h3 class="text-base font-bold text-slate-700">No products found</h3><p class="text-xs text-slate-400 mt-1">Try searching for something else or change category filters.</p><button onclick="filterCategory('All');handleSearch('')" class="mt-4 text-xs font-semibold text-zest-600 underline">Clear filters</button></div>`;
  return;
 }
 grid.innerHTML=filtered.map(product=>`
 <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
  <div class="relative bg-slate-100 aspect-square overflow-hidden cursor-pointer" onclick="openQuickView(${product.id})">
   <img src="${product.image}" alt="${product.title}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.src='https://placehold.co/600x600/e2e8f0/475569?text=Product+Image'">
   <span class="absolute top-3 left-3 ${product.badgeBg} text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md shadow-md">${product.badge}</span>
   <button class="absolute bottom-3 right-3 bg-white/90 text-slate-800 p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><i class="fa-regular fa-eye"></i></button>
  </div>
  <div class="p-4 flex-1 flex flex-col justify-between">
   <div>
    <div class="flex items-center justify-between text-xs text-slate-400 mb-1"><span>${product.category}</span><span class="text-amber-500 font-bold flex items-center gap-1"><i class="fa-solid fa-star text-[10px]"></i> ${product.rating}</span></div>
    <h3 onclick="openQuickView(${product.id})" class="font-bold text-slate-900 text-sm line-clamp-1 hover:text-zest-600 cursor-pointer mb-2">${product.title}</h3>
    <p class="text-xs text-slate-500 line-clamp-2 mb-4">${product.description}</p>
   </div>
   <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
    <div><span class="text-lg font-extrabold text-slate-900">$${product.price.toFixed(2)}</span><span class="text-xs text-slate-400 line-through ml-1">$${product.originalPrice.toFixed(2)}</span></div>
    <button onclick="addToCart(${product.id})" class="bg-zest-600 hover:bg-zest-700 text-white p-2.5 rounded-xl shadow-md text-xs font-semibold flex items-center gap-1.5"><i class="fa-solid fa-cart-plus text-sm"></i><span class="hidden sm:inline">Add</span></button>
   </div>
  </div>
 </div>`).join("");
}

function addToCart(productId){
 const product=PRODUCTS.find(p=>p.id===productId);if(!product)return;
 const existing=cart.find(item=>item.id===productId);
 if(existing)existing.quantity+=1;else cart.push({id:product.id,title:product.title,price:product.price,image:product.image,quantity:1});
 saveCartToStorage();showToast(`Added "${product.title}" to cart`);
}
function updateQuantity(productId,change){
 const item=cart.find(i=>i.id===productId);if(!item)return;
 item.quantity+=change;if(item.quantity<=0)removeFromCart(productId);else saveCartToStorage();
}
function removeFromCart(productId){cart=cart.filter(item=>item.id!==productId);saveCartToStorage();showToast("Item removed from cart")}
function clearCart(){if(!cart.length)return;cart=[];saveCartToStorage();showToast("Cart cleared")}

function updateCartUI(){
 const badge=document.getElementById("cartBadge"),container=document.getElementById("cartItemsContainer"),subtotalEl=document.getElementById("cartSubtotal"),totalEl=document.getElementById("cartTotal");
 const totalItems=cart.reduce((s,i)=>s+i.quantity,0),subtotal=cart.reduce((s,i)=>s+i.price*i.quantity,0);
 if(badge)badge.textContent=totalItems;if(subtotalEl)subtotalEl.textContent=`$${subtotal.toFixed(2)}`;if(totalEl)totalEl.textContent=`$${subtotal.toFixed(2)}`;
 if(!container)return;
 if(!cart.length){container.innerHTML=`<div class="h-full flex flex-col items-center justify-center text-center py-12"><div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 text-2xl mb-3"><i class="fa-solid fa-basket-shopping"></i></div><h4 class="font-bold text-slate-700">Your cart is empty</h4><p class="text-xs text-slate-400 max-w-xs mt-1">Looks like you haven't added any products to your shopping cart yet.</p><button onclick="toggleCart(false)" class="mt-4 text-xs font-bold text-zest-600 underline">Continue Shopping</button></div>`;return}
 container.innerHTML=cart.map(item=>`<div class="py-4 flex items-center gap-4"><img src="${item.image}" alt="${item.title}" class="w-16 h-16 rounded-xl object-cover bg-slate-100 flex-shrink-0" onerror="this.src='https://placehold.co/100x100/e2e8f0/475569?text=Item'"><div class="flex-1 min-w-0"><h4 class="text-xs font-bold text-slate-900 truncate">${item.title}</h4><p class="text-xs text-slate-500 font-semibold mt-0.5">$${item.price.toFixed(2)}</p><div class="flex items-center gap-2 mt-2"><div class="flex items-center border border-slate-200 rounded-lg bg-slate-50"><button onclick="updateQuantity(${item.id},-1)" class="w-6 h-6 flex items-center justify-center">−</button><span class="w-7 text-center text-xs font-bold">${item.quantity}</span><button onclick="updateQuantity(${item.id},1)" class="w-6 h-6 flex items-center justify-center">+</button></div><span class="text-xs font-extrabold ml-auto">$${(item.price*item.quantity).toFixed(2)}</span></div></div><button onclick="removeFromCart(${item.id})" class="text-slate-300 hover:text-red-500 p-1"><i class="fa-regular fa-trash-can"></i></button></div>`).join("");
}

function toggleCart(show){
 const drawer=document.getElementById("cartDrawer"),backdrop=document.getElementById("cartBackdrop"),panel=document.getElementById("cartPanel");
 if(show){drawer.classList.remove("hidden");setTimeout(()=>{backdrop.classList.remove("opacity-0");panel.classList.remove("translate-x-full")},10)}
 else{backdrop.classList.add("opacity-0");panel.classList.add("translate-x-full");setTimeout(()=>drawer.classList.add("hidden"),300)}
}
function checkoutViaWhatsApp(){
 if(!cart.length){showToast("Your cart is empty!");return}
 let message="🛒 *NEW ORDER - ZEST MINI STORE*\n-----------------------------------\n";
 cart.forEach((item,index)=>message+=`${index+1}. *${item.title}*\n   Qty: ${item.quantity} | Price: $${(item.price*item.quantity).toFixed(2)}\n`);
 const total=cart.reduce((s,i)=>s+i.price*i.quantity,0);
 message+=`-----------------------------------\n*Total Amount:* $${total.toFixed(2)}\n\nPlease confirm availability and delivery procedure. Thanks!`;
 window.open(`https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(message)}`,"_blank");
}

function openQuickView(productId){
 const product=PRODUCTS.find(p=>p.id===productId);if(!product)return;
 document.getElementById("quickViewContent").innerHTML=`<div class="aspect-square bg-slate-100 rounded-2xl overflow-hidden"><img src="${product.image}" alt="${product.title}" class="w-full h-full object-cover"></div><div><span class="${product.badgeBg} text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md">${product.badge}</span><h3 class="text-xl font-bold text-slate-900 mt-2">${product.title}</h3><div class="flex items-center gap-2 text-xs text-amber-500 font-bold my-2"><i class="fa-solid fa-star"></i> ${product.rating} (${product.reviews} reviews)</div><p class="text-xs text-slate-500 leading-relaxed my-3">${product.description}</p><div class="text-2xl font-black text-slate-900 mb-4">$${product.price.toFixed(2)}</div><button onclick="addToCart(${product.id});closeQuickView()" class="w-full bg-zest-600 hover:bg-zest-700 text-white font-bold py-3 rounded-xl text-sm">Add to Cart</button></div>`;
 document.getElementById("quickViewModal").classList.remove("hidden");
}
function closeQuickView(){document.getElementById("quickViewModal").classList.add("hidden")}
function openCheckoutModal(){
 if(!cart.length){showToast("Add items to your cart first!");return}
 toggleCart(false);const subtotal=cart.reduce((s,i)=>s+i.price*i.quantity,0);
 document.getElementById("checkoutModalTotal").textContent=`$${subtotal.toFixed(2)}`;
 document.getElementById("checkoutModal").classList.remove("hidden");
}
function closeCheckoutModal(){document.getElementById("checkoutModal").classList.add("hidden")}
function handleFormSubmit(e){e.preventDefault();closeCheckoutModal();clearCart();showToast("🎉 Order placed successfully! Thank you.")}
function showToast(msg){const toast=document.getElementById("toast"),el=document.getElementById("toastMessage");if(!toast||!el)return;el.textContent=msg;toast.classList.remove("translate-y-20","opacity-0");setTimeout(()=>toast.classList.add("translate-y-20","opacity-0"),3000)}
