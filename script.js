// --- تهيئة البيانات ---

// قائمة المنتجات (الحيوانات)
const products = [
    { id: 1, name: 'دجاجة بياضة', icon: '🐔', price: 10, dailyProfit: 0.5, period: 30 },
    { id: 2, name: 'خروف عراقي', icon: '🐑', price: 50, dailyProfit: 2.8, period: 45 },
    { id: 3, name: 'بقرة هولندية', icon: '🐄', price: 150, dailyProfit: 9.5, period: 60 },
    { id: 4, name: 'حصان أصيل', icon: '🐎', price: 500, dailyProfit: 35.0, period: 90 }
];

// حالة المستخدم (يتم تحميلها من LocalStorage أو إنشاء جديد)
let userState = JSON.parse(localStorage.getItem('smartFarmUser')) || {
    balance: 100.00, // رصيد افتراضي للتجربة
    investments: []  // مصفوفة لتخزين عمليات الشراء
};

// --- تعريف العناصر من HTML ---
const balanceEl = document.getElementById('total-balance');
const marketListEl = document.getElementById('market-list');
const investmentsListEl = document.getElementById('investments-list');
const activeCountEl = document.getElementById('active-count');
const emptyMsgEl = document.getElementById('empty-msg');

// --- الوظائف الأساسية ---

// 1. دالة تهيئة التطبيق عند الفتح
function initApp() {
    renderMarket();
    updateDashboard(); // التحديث الأولي
    
    // تشغيل العداد اللحظي (Loop) كل 100 جزء من الثانية
    setInterval(updateLiveProfits, 100);
}

// 2. رسم سوق المواشي
function renderMarket() {
    marketListEl.innerHTML = '';
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <span class="product-icon">${product.icon}</span>
            <h3>${product.name}</h3>
            <span class="price-tag">$${product.price}</span>
            <div class="roi-info">
                <p>الربح اليومي: $${product.dailyProfit}</p>
                <p>المدة: ${product.period} يوم</p>
            </div>
            <button onclick="buyProduct(${product.id})" class="btn-buy">شراء الآن</button>
        `;
        marketListEl.appendChild(card);
    });
}

// 3. دالة الشراء
window.buyProduct = function(id) {
    const product = products.find(p => p.id === id);
    
    if (userState.balance >= product.price) {
        // خصم الرصيد
        userState.balance -= product.price;
        
        // إنشاء استثمار جديد
        const newInvestment = {
            id: Date.now(), // معرف فريد
            productId: product.id,
            name: product.name,
            icon: product.icon,
            dailyProfit: product.dailyProfit,
            purchaseTime: Date.now() // وقت الشراء بالمللي ثانية (مهم جداً للعداد)
        };
        
        userState.investments.push(newInvestment);
        saveData();
        updateDashboard();
        alert(`مبروك! تم شراء ${product.name} بنجاح.`);
    } else {
        alert('عذراً، رصيدك غير كافي!');
    }
};

// 4. تحديث الواجهة (الرصيد والقوائم)
function updateDashboard() {
    // تحديث الرصيد الظاهر
    balanceEl.textContent = userState.balance.toFixed(2) + ' $';
    activeCountEl.textContent = userState.investments.length + ' حيوان';

    // رسم قائمة الاستثمارات
    investmentsListEl.innerHTML = '';
    if (userState.investments.length === 0) {
        investmentsListEl.appendChild(emptyMsgEl);
    } else {
        userState.investments.forEach(inv => {
            const div = document.createElement('div');
            div.className = 'investment-card';
            // إضافة خاصية data-id و data-profit لتسهيل التحديث اللحظي
            div.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-size:1.5rem;">${inv.icon}</span>
                    <div>
                        <h4>${inv.name}</h4>
                        <small style="color:#777">نشط منذ قليل</small>
                    </div>
                </div>
                <div class="live-profit" id="profit-${inv.id}">0.0000 $</div>
            `;
            investmentsListEl.appendChild(div);
        });
    }
}

// 5. دالة العداد اللحظي (The Live Counter Logic)
function updateLiveProfits() {
    let totalAccumulatedProfit = 0;

    userState.investments.forEach(inv => {
        // المعادلة: الوقت المنقضي (ثانية) * الربح في الثانية
        const now = Date.now();
        const timeElapsedInSeconds = (now - inv.purchaseTime) / 1000;
        
        // تحويل الربح اليومي إلى ربح بالثانية
        // الربح بالثانية = الربح اليومي / 86400
        const profitPerSecond = inv.dailyProfit / 86400;
        
        const currentProfit = timeElapsedInSeconds * profitPerSecond;
        
        // تحديث الرقم في البطاقة الخاصة بالحيوان
        const profitEl = document.getElementById(`profit-${inv.id}`);
        if (profitEl) {
            profitEl.textContent = currentProfit.toFixed(6) + ' $'; // 6 خانات عشرية لزيادة الشعور بالحركة
        }
    });
}

// 6. حفظ البيانات
function saveData() {
    localStorage.setItem('smartFarmUser', JSON.stringify(userState));
}

// تشغيل التطبيق
initApp();
