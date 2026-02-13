// --- تهيئة البيانات ---

// قائمة المنتجات مع الصور والوصف
const products = [
    { 
        id: 1, 
        name: 'دجاجة بياضة', 
        img: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=300&q=80', 
        price: 10, 
        dailyProfit: 0.5, 
        period: 30,
        description: 'دجاجة بياضة من سلالة ممتازة، تنتج البيض يومياً. استثمار قصير المدى وعائد جيد.'
    },
    { 
        id: 2, 
        name: 'خروف عراقي', 
        img: 'https://images.unsplash.com/photo-1484557985045-6f550 ILd687?auto=format&fit=crop&w=300&q=80', 
        price: 50, 
        dailyProfit: 2.8, 
        period: 45,
        description: 'خروف نعيمي أصيل يعيش في مراعي طبيعية. نمو سريع وطلب عالي في السوق.'
    },
    { 
        id: 3, 
        name: 'بقرة هولندية', 
        img: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=300&q=80', 
        price: 150, 
        dailyProfit: 9.5, 
        period: 60,
        description: 'بقرة هولندية حلوب، إنتاجية عالية من الحليب يومياً. تعتبر العمود الفقري للمزرعة.'
    },
    { 
        id: 4, 
        name: 'حصان عربي', 
        img: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=300&q=80', 
        price: 500, 
        dailyProfit: 35.0, 
        period: 90,
        description: 'حصان عربي أصيل للسباقات والإنتاج. أعلى عائد استثماري ومكانة مرموقة.'
    }
];

// متغيرات للنافذة المنبثقة
let currentSelectedProduct = null;
let currentQuantity = 1;

// حالة المستخدم
let userState = JSON.parse(localStorage.getItem('smartFarmUser')) || {
    balance: 100.00,
    investments: []
};

// --- العناصر ---
const balanceEl = document.getElementById('total-balance');
const marketListEl = document.getElementById('market-list');
const investmentsListEl = document.getElementById('investments-list');
const activeCountEl = document.getElementById('active-count');
const emptyMsgEl = document.getElementById('empty-msg');

// عناصر المودال (التفاصيل)
const modalOverlay = document.getElementById('product-modal');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalPrice = document.getElementById('modal-price');
const modalDaily = document.getElementById('modal-daily');
const modalPeriod = document.getElementById('modal-period');
const modalTotalProfit = document.getElementById('modal-total-profit');
const modalFinalPrice = document.getElementById('modal-final-price');
const qtyDisplay = document.getElementById('qty-display');
const confirmBuyBtn = document.getElementById('confirm-buy-btn');

// --- الوظائف ---

function initApp() {
    renderMarket();
    updateDashboard();
    setInterval(updateLiveProfits, 100);
}

// 1. رسم السوق (زر التفاصيل بدلاً من الشراء المباشر)
function renderMarket() {
    marketListEl.innerHTML = '';
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.img}" class="product-img" alt="${product.name}">
            <h3>${product.name}</h3>
            <span class="price-tag">$${product.price}</span>
            <button onclick="openProductDetails(${product.id})" class="btn-details">التفاصيل</button>
        `;
        marketListEl.appendChild(card);
    });
}

// 2. فتح نافذة التفاصيل
window.openProductDetails = function(id) {
    const product = products.find(p => p.id === id);
    currentSelectedProduct = product;
    currentQuantity = 1; // إعادة تعيين الكمية

    // تعبئة البيانات
    modalImg.src = product.img;
    modalTitle.textContent = product.name;
    modalDesc.textContent = product.description;
    modalPrice.textContent = product.price + ' $';
    modalDaily.textContent = product.dailyProfit + ' $';
    modalPeriod.textContent = product.period + ' يوم';

    updateModalCalculations();
    
    // إظهار المودال
    modalOverlay.classList.remove('hidden');
    
    // ربط زر الشراء
    confirmBuyBtn.onclick = function() {
        executeBuy();
    };
};

// 3. تحديث حسابات المودال عند تغيير الكمية
window.updateQuantity = function(change) {
    if (currentQuantity + change >= 1) {
        currentQuantity += change;
        updateModalCalculations();
    }
};

function updateModalCalculations() {
    qtyDisplay.textContent = currentQuantity;
    
    // الحسابات بناءً على الكمية
    const totalPrice = currentSelectedProduct.price * currentQuantity;
    const totalDaily = currentSelectedProduct.dailyProfit * currentQuantity;
    const totalReturn = totalDaily * currentSelectedProduct.period;

    modalFinalPrice.textContent = totalPrice.toFixed(2) + ' $';
    modalTotalProfit.textContent = totalReturn.toFixed(2) + ' $';
    modalDaily.textContent = totalDaily.toFixed(2) + ' $'; // تحديث العرض اليومي أيضاً
}

// 4. تنفيذ الشراء
function executeBuy() {
    if (!currentSelectedProduct) return;

    const totalPrice = currentSelectedProduct.price * currentQuantity;

    if (userState.balance >= totalPrice) {
        userState.balance -= totalPrice;
        
        // حساب تاريخ الانتهاء
        const now = Date.now();
        const expiryDate = now + (currentSelectedProduct.period * 24 * 60 * 60 * 1000);

        // إنشاء الاستثمار (مضاعف حسب الكمية)
        const newInvestment = {
            id: Date.now(),
            productId: currentSelectedProduct.id,
            name: currentSelectedProduct.name,
            img: currentSelectedProduct.img,
            dailyProfit: currentSelectedProduct.dailyProfit * currentQuantity, // الربح مضاعف
            purchaseTime: now,
            expiryDate: expiryDate,
            quantity: currentQuantity
        };
        
        userState.investments.push(newInvestment);
        saveData();
        updateDashboard();
        closeModal('product-modal');
        alert('تم الشراء بنجاح! تم إضافة الحيوان إلى محفظتك.');
    } else {
        alert('عذراً، رصيدك غير كافي!');
    }
}

// 5. إغلاق النوافذ
window.closeModal = function(modalId) {
    document.getElementById(modalId).classList.add('hidden');
};

// 6. تحديث الواجهة والمحفظة
function updateDashboard() {
    balanceEl.textContent = userState.balance.toFixed(2) + ' $';
    activeCountEl.textContent = userState.investments.length + ' حيوان';

    investmentsListEl.innerHTML = '';
    if (userState.investments.length === 0) {
        investmentsListEl.appendChild(emptyMsgEl);
    } else {
        userState.investments.forEach(inv => {
            // حساب الأيام المتبقية
            const timeLeft = inv.expiryDate - Date.now();
            const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

            const div = document.createElement('div');
            div.className = 'investment-card';
            div.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${inv.img}" style="width:50px; height:50px; border-radius:50%; object-fit:cover;">
                    <div class="inv-info">
                        <h4>${inv.name} (x${inv.quantity})</h4>
                        <small>متبقي: ${daysLeft > 0 ? daysLeft + ' يوم' : 'منتهي'}</small>
                    </div>
                </div>
                <div class="live-profit" id="profit-${inv.id}">0.0000 $</div>
            `;
            investmentsListEl.appendChild(div);
        });
    }
}

// 7. العداد اللحظي
function updateLiveProfits() {
    userState.investments.forEach(inv => {
        const now = Date.now();
        if (now < inv.expiryDate) {
            const timeElapsedInSeconds = (now - inv.purchaseTime) / 1000;
            const profitPerSecond = inv.dailyProfit / 86400;
            const currentProfit = timeElapsedInSeconds * profitPerSecond;
            
            const profitEl = document.getElementById(`profit-${inv.id}`);
            if (profitEl) {
                profitEl.textContent = currentProfit.toFixed(4) + ' $';
            }
        }
    });
}

// 8. فتح البروفايل
window.openProfileModal = function() {
    document.getElementById('profile-modal').classList.remove('hidden');
};

// 9. التنقل بين الأقسام
window.showSection = function(sectionId) {
    // إخفاء كل الأقسام
    document.getElementById('market-section').style.display = 'none';
    document.getElementById('my-farm-section').style.display = 'none';
    
    // إظهار القسم المطلوب
    document.getElementById(sectionId).style.display = 'block';
};

function saveData() {
    localStorage.setItem('smartFarmUser', JSON.stringify(userState));
}

// تشغيل التطبيق (الافتراضي عرض السوق)
initApp();
showSection('market-section');
