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

// معرف المستخدم الافتراضي
const USER_ID = "8829301";

// متغيرات للنافذة المنبثقة
let currentSelectedProduct = null;
let currentQuantity = 1;
let hasInsurance = false;
const INSURANCE_PRICE = 2; // دولار لكل حيوان

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

// عناصر المودال
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
const insuranceToggle = document.getElementById('insurance-toggle');

// --- الوظائف ---

function initApp() {
    renderMarket();
    updateDashboard();
    setInterval(updateLiveProfits, 100);
    
    // إعداد أزرار المحفظة (إيداع / سحب)
    setupWalletButtons();
}

// 1. رسم السوق (الرئيسية)
function renderMarket() {
    marketListEl.innerHTML = '';
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.img}" class="product-img shadow-3d" alt="${product.name}">
            <h3>${product.name}</h3>
            <span class="price-tag">$${product.price}</span>
            <div style="font-size: 0.85rem; color: #7f8c8d; margin-bottom: 5px;">الربح المتوقع: $${product.dailyProfit} يومياً</div>
            <button onclick="openProductDetails(${product.id})" class="btn-details shadow-3d">التفاصيل</button>
        `;
        marketListEl.appendChild(card);
    });
}

// 2. فتح نافذة التفاصيل
window.openProductDetails = function(id) {
    const product = products.find(p => p.id === id);
    currentSelectedProduct = product;
    currentQuantity = 1;
    hasInsurance = false;
    insuranceToggle.checked = false;

    // تعبئة البيانات
    modalImg.src = product.img;
    modalTitle.textContent = product.name;
    modalDesc.textContent = product.description;
    modalPrice.textContent = product.price + ' $';
    modalPeriod.textContent = product.period + ' يوم';

    updateModalCalculations();
    
    modalOverlay.classList.remove('hidden');
    
    confirmBuyBtn.onclick = function() {
        executeBuy();
    };
};

// 3. التبديل والتأمين والكمية
window.updateQuantity = function(change) {
    if (currentQuantity + change >= 1) {
        currentQuantity += change;
        updateModalCalculations();
    }
};

window.toggleInsurance = function() {
    hasInsurance = insuranceToggle.checked;
    updateModalCalculations();
};

function updateModalCalculations() {
    qtyDisplay.textContent = currentQuantity;
    
    // الحسابات
    const basePrice = currentSelectedProduct.price * currentQuantity;
    const insuranceCost = hasInsurance ? (INSURANCE_PRICE * currentQuantity) : 0;
    const totalPrice = basePrice + insuranceCost;
    
    const totalDaily = currentSelectedProduct.dailyProfit * currentQuantity;
    const totalReturn = totalDaily * currentSelectedProduct.period;

    modalFinalPrice.textContent = totalPrice.toFixed(2) + ' $';
    modalTotalProfit.textContent = totalReturn.toFixed(2) + ' $';
    modalDaily.textContent = totalDaily.toFixed(2) + ' $'; 
}

// 4. تنفيذ الشراء
function executeBuy() {
    if (!currentSelectedProduct) return;

    const basePrice = currentSelectedProduct.price * currentQuantity;
    const insuranceCost = hasInsurance ? (INSURANCE_PRICE * currentQuantity) : 0;
    const totalPrice = basePrice + insuranceCost;

    if (userState.balance >= totalPrice) {
        userState.balance -= totalPrice;
        
        const now = Date.now();
        const expiryDate = now + (currentSelectedProduct.period * 24 * 60 * 60 * 1000);
        
        const totalDaily = currentSelectedProduct.dailyProfit * currentQuantity;
        const totalExpectedProfit = totalDaily * currentSelectedProduct.period;

        const newInvestment = {
            id: Date.now(),
            productId: currentSelectedProduct.id,
            name: currentSelectedProduct.name,
            img: currentSelectedProduct.img,
            dailyProfit: totalDaily,
            totalExpectedProfit: totalExpectedProfit,
            purchaseTime: now,
            expiryDate: expiryDate,
            quantity: currentQuantity,
            insured: hasInsurance
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

// 6. تحديث الواجهة والمحفظة (مع رسالة الأرباح المتوقعة)
function updateDashboard() {
    balanceEl.textContent = userState.balance.toFixed(2) + ' $';
    activeCountEl.textContent = userState.investments.length + ' حيوان';

    investmentsListEl.innerHTML = '';
    if (userState.investments.length === 0) {
        investmentsListEl.appendChild(emptyMsgEl);
    } else {
        userState.investments.forEach(inv => {
            const timeLeft = inv.expiryDate - Date.now();
            const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
            const isExpired = daysLeft <= 0;

            const div = document.createElement('div');
            div.className = 'investment-card';
            div.innerHTML = `
                <div class="investment-card-header">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <img src="${inv.img}" style="width:55px; height:55px; border-radius:50%; object-fit:cover; border: 2px solid var(--primary-color);">
                        <div class="inv-info">
                            <h4>${inv.name} (x${inv.quantity}) ${inv.insured ? '🛡️' : ''}</h4>
                            <small>متبقي: ${isExpired ? 'منتهي ومتاح للسحب' : daysLeft + ' يوم'}</small>
                        </div>
                    </div>
                    <div class="live-profit shadow-3d" id="profit-${inv.id}">0.0000 $</div>
                </div>
                <div class="locked-profit-msg">
                    ${isExpired ? '✅ تم انتهاء الدورة، الأرباح متاحة للسحب' : `⏳ يمكنك سحب الأرباح المتوقعة (${inv.totalExpectedProfit.toFixed(2)} $) بعد انتهاء الدورة`}
                </div>
            `;
            investmentsListEl.appendChild(div);
        });
    }
    
    // تحديث حالة زر السحب
    checkWithdrawStatus();
}

// 7. العداد اللحظي
function updateLiveProfits() {
    userState.investments.forEach(inv => {
        const now = Date.now();
        // العداد يعمل حتى انتهاء المدة فقط
        const timeToCalculate = now < inv.expiryDate ? now : inv.expiryDate;
        
        const timeElapsedInSeconds = (timeToCalculate - inv.purchaseTime) / 1000;
        const profitPerSecond = inv.dailyProfit / 86400;
        const currentProfit = timeElapsedInSeconds * profitPerSecond;
        
        const profitEl = document.getElementById(`profit-${inv.id}`);
        if (profitEl) {
            profitEl.textContent = currentProfit.toFixed(4) + ' $';
        }
    });
}

// 8. إعدادات الإيداع والسحب
function setupWalletButtons() {
    // الإيداع (العد التنازلي ونقل للتلغرام)
    document.getElementById('deposit-btn').onclick = function() {
        const depositModal = document.getElementById('deposit-modal');
        const countdownEl = document.getElementById('countdown-timer');
        let counter = 3;
        
        depositModal.classList.remove('hidden');
        countdownEl.textContent = counter;
        
        const interval = setInterval(() => {
            counter--;
            if (counter > 0) {
                countdownEl.textContent = counter;
            } else {
                clearInterval(interval);
                depositModal.classList.add('hidden');
                
                // الانتقال للتلغرام
                const message = encodeURIComponent(`مرحبا اود الايداع\nالايدي الخاص بي: ${USER_ID}`);
                window.location.href = `https://t.me/ar_2oa?text=${message}`;
            }
        }, 1000);
    };

    // السحب (مقفل حتى انتهاء أي استثمار)
    document.getElementById('withdraw-btn').onclick = function() {
        const hasExpired = userState.investments.some(inv => Date.now() >= inv.expiryDate);
        if (hasExpired) {
            alert('تم تقديم طلب السحب بنجاح. سيتم تحويل الأرباح المتوفرة قريباً.');
            // هنا يتم برمجة السحب الفعلي لاحقاً
        } else {
            alert('عذراً، زر السحب مقفل. الأرباح تنزل في محفظتك ولكن يجب انتظار انتهاء دورة استثمارية واحدة على الأقل لتتمكن من سحبها.');
        }
    };
}

// فحص قفل زر السحب
function checkWithdrawStatus() {
    const withdrawBtn = document.getElementById('withdraw-btn');
    const hasExpired = userState.investments.some(inv => Date.now() >= inv.expiryDate);
    
    if (hasExpired) {
        withdrawBtn.style.background = 'white';
        withdrawBtn.style.color = 'var(--dark-green)';
        withdrawBtn.innerHTML = '<i class="fas fa-arrow-down"></i> سحب متاح';
    } else {
        withdrawBtn.style.background = '#ecf0f1';
        withdrawBtn.style.color = '#7f8c8d';
        withdrawBtn.innerHTML = '<i class="fas fa-lock"></i> سحب مقفل';
    }
}

// 9. فتح البروفايل
window.openProfileModal = function() {
    document.getElementById('user-id-display').textContent = 'ID: ' + USER_ID;
    document.getElementById('profile-modal').classList.remove('hidden');
};

// 10. التنقل بين الأقسام بأسلوب عصري
window.showSection = function(sectionId, element) {
    // إخفاء كل الأقسام
    document.getElementById('market-section').style.display = 'none';
    document.getElementById('my-farm-section').style.display = 'none';
    
    // إظهار القسم المطلوب
    const targetSection = document.getElementById(sectionId);
    targetSection.style.display = 'block';
    
    // إزالة تفعيل كل الأزرار
    document.querySelectorAll('.bottom-nav .nav-item').forEach(el => {
        el.classList.remove('active');
        // إزالة تأثير النبض من المركز إذا تم الضغط على غيره
        if(el.classList.contains('center-nav')) {
            el.classList.remove('animate__pulse', 'animate__infinite');
        }
    });
    
    // تفعيل الزر المضغوط
    if(element) {
        element.classList.add('active');
        if(element.classList.contains('center-nav')) {
            element.classList.add('animate__pulse', 'animate__infinite');
        }
    }
};

function saveData() {
    localStorage.setItem('smartFarmUser', JSON.stringify(userState));
}

// تشغيل التطبيق (الافتراضي عرض السوق/الرئيسية في المنتصف)
initApp();
