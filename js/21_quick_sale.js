// ============================================================================
// نظام البيع السريع بالباركود
// ============================================================================

class QuickSaleSystem {
    constructor() {
        this.cart = [];
        this.currentProduct = null;
        this.barcodeInput = null;
        this.quantityInput = null;
        this.customerInput = null;
    }
    
    init() {
        console.log('تهيئة نظام البيع السريع...');
        this.initializeElements();
        this.bindEvents();
        this.loadCart();
        this.updateCartDisplay();
    }
    
    initializeElements() {
        this.barcodeInput = document.getElementById('quickBarcode');
        this.quantityInput = document.getElementById('quickSaleQty');
        this.customerInput = document.getElementById('quickCustomer');
    }
    
    bindEvents() {
        // مسح الباركود
        document.getElementById('scanQuickBarcode')?.addEventListener('click', () => {
            this.openBarcodeScanner();
        });
        
        // إضافة المنتج
        document.getElementById('quickAddProduct')?.addEventListener('click', () => {
            this.processBarcode();
        });
        
        // إدخال الباركود يدوياً بالإنتر
        this.barcodeInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.processBarcode();
            }
        });
        
        // تغيير الكمية
        document.getElementById('increaseQty')?.addEventListener('click', () => {
            this.changeQuantity(1);
        });
        
        document.getElementById('decreaseQty')?.addEventListener('click', () => {
            this.changeQuantity(-1);
        });
        
        this.quantityInput?.addEventListener('input', () => {
            this.updateTotalPrice();
        });
        
        // إعادة التعيين
        document.getElementById('quickReset')?.addEventListener('click', () => {
            this.resetCurrentProduct();
        });
        
        // إتمام البيع الحالي
        document.getElementById('quickCompleteSale')?.addEventListener('click', () => {
            this.completeCurrentSale();
        });
        
        // إفراغ السلة
        document.getElementById('quickClearCart')?.addEventListener('click', () => {
            this.clearCart();
        });
        
        // إتمام جميع المشتريات
        document.getElementById('quickCheckout')?.addEventListener('click', () => {
            this.completeAllSales();
        });
        
        // إنشاء منتج جديد
        document.getElementById('quickCreateProduct')?.addEventListener('click', () => {
            this.createNewProductFromBarcode();
        });
        
        document.getElementById('quickCancelCreate')?.addEventListener('click', () => {
            this.hideProductNotFound();
        });
    }
    
    openBarcodeScanner() {
        if (window.barcodeSystem) {
            window.barcodeSystem.openBarcodeScanner();
            
            // تخصيص السلوك ليقوم بإضافة المنتج للسلة مباشرة
            setTimeout(() => {
                // تعديل سلوك المسح ليكون للبيع السريع
                const processManualBarcodeBtn = document.querySelector('[onclick*="processManualBarcode"]');
                if (processManualBarcodeBtn) {
                    processManualBarcodeBtn.onclick = () => {
                        const manualInput = document.getElementById('manualBarcodeInput');
                        if (manualInput && manualInput.value) {
                            this.barcodeInput.value = manualInput.value;
                            this.processBarcode();
                            
                            // إغلاق الماسح
                            if (window.barcodeSystem.closeScanner) {
                                window.barcodeSystem.closeScanner();
                            }
                        }
                    };
                }
                
                // تعديل سلوك استخدام الباركود الممسوح
                const useBarcodeBtn = document.querySelector('[onclick*="useScannedBarcode"]');
                if (useBarcodeBtn) {
                    const oldOnClick = useBarcodeBtn.onclick;
                    useBarcodeBtn.onclick = function() {
                        if (oldOnClick) oldOnClick();
                        // سيتم تعبئة الحقل تلقائياً عبر useScannedBarcode
                    };
                }
            }, 500);
        } else {
            Utils.showAlert('نظام الباركود غير متاح', 'error');
        }
    }
    
    processBarcode() {
        const barcode = this.barcodeInput?.value?.trim();
        if (!barcode || barcode === '') {
            Utils.showAlert('يرجى إدخال أو مسح باركود المنتج', 'error');
            this.barcodeInput?.focus();
            return;
        }
        
        // البحث عن المنتج
        this.currentProduct = System.data.inventory?.find(item => item.barcode === barcode);
        
        if (this.currentProduct) {
            this.showProductInfo();
            this.hideProductNotFound();
        } else {
            this.hideProductInfo();
            this.showProductNotFound();
        }
    }
    
    showProductInfo() {
        if (!this.currentProduct) return;
        
        const infoDiv = document.getElementById('quickSaleProductInfo');
        const cartDiv = document.getElementById('quickCart');
        
        // تحديث معلومات المنتج
        document.getElementById('quickProductName').textContent = this.currentProduct.name;
        document.getElementById('quickProductCategory').textContent = this.currentProduct.category;
        document.getElementById('quickProductQuantity').textContent = this.currentProduct.quantity;
        document.getElementById('quickProductPrice').textContent = Utils.formatCurrency(this.currentProduct.price);
        
        // تعيين الكمية الافتراضية
        this.quantityInput.value = 1;
        
        // تحديث السعر الإجمالي
        this.updateTotalPrice();
        
        // إظهار المنتج وإخفاء الرسائل الأخرى
        infoDiv.style.display = 'block';
        cartDiv.style.display = 'block';
        
        // إخفاء رسالة المنتج غير موجود
        this.hideProductNotFound();
        
        // التركيز على حقل الكمية
        this.quantityInput.focus();
        this.quantityInput.select();
    }
    
    hideProductInfo() {
        document.getElementById('quickSaleProductInfo').style.display = 'none';
    }
    
    showProductNotFound() {
        document.getElementById('quickProductNotFound').style.display = 'block';
    }
    
    hideProductNotFound() {
        document.getElementById('quickProductNotFound').style.display = 'none';
    }
    
    changeQuantity(change) {
        let currentQty = parseInt(this.quantityInput.value) || 1;
        let newQty = currentQty + change;
        
        // التأكد من أن الكمية لا تقل عن 1
        if (newQty < 1) newQty = 1;
        
        // التأكد من أن الكمية لا تتجاوز المخزون
        if (this.currentProduct && newQty > this.currentProduct.quantity) {
            Utils.showAlert(`الكمية المتاحة فقط ${this.currentProduct.quantity} وحدة`, 'warning');
            newQty = this.currentProduct.quantity;
        }
        
        this.quantityInput.value = newQty;
        this.updateTotalPrice();
    }
    
    updateTotalPrice() {
        if (!this.currentProduct) return;
        
        const quantity = parseInt(this.quantityInput.value) || 1;
        const total = quantity * this.currentProduct.price;
        
        document.getElementById('quickTotalPrice').textContent = Utils.formatCurrency(total);
    }
    
    resetCurrentProduct() {
        this.currentProduct = null;
        this.barcodeInput.value = '';
        this.quantityInput.value = 1;
        this.customerInput.value = '';
        
        this.hideProductInfo();
        this.hideProductNotFound();
        
        // التركيز على حقل الباركود
        this.barcodeInput.focus();
    }
    
    completeCurrentSale() {
        if (!this.currentProduct) {
            Utils.showAlert('لا يوجد منتج حالي لإتمام البيع', 'error');
            return;
        }
        
        const quantity = parseInt(this.quantityInput.value) || 1;
        const customer = this.customerInput.value.trim();
        
        // التحقق من توفر الكمية
        if (quantity > this.currentProduct.quantity) {
            Utils.showAlert(`الكمية المطلوبة غير متوفرة. المتاحة: ${this.currentProduct.quantity}`, 'error');
            return;
        }
        
        // إضافة للسلة
        this.addToCart({
            productId: this.currentProduct.id,
            name: this.currentProduct.name,
            barcode: this.currentProduct.barcode,
            price: this.currentProduct.price,
            quantity: quantity,
            total: quantity * this.currentProduct.price,
            customer: customer || 'عميل سريع'
        });
        
        // إعادة تعيين المنتج الحالي
        this.resetCurrentProduct();
        
        Utils.showAlert('تم إضافة المنتج للسلة', 'success');
    }
    
    addToCart(item) {
        // التحقق مما إذا كان المنتج موجوداً بالفعل في السلة
        const existingItemIndex = this.cart.findIndex(cartItem => 
            cartItem.productId === item.productId && cartItem.customer === item.customer
        );
        
        if (existingItemIndex >= 0) {
            // تحديث الكمية والإجمالي للمنتج الموجود
            this.cart[existingItemIndex].quantity += item.quantity;
            this.cart[existingItemIndex].total = this.cart[existingItemIndex].quantity * this.cart[existingItemIndex].price;
        } else {
            // إضافة منتج جديد للسلة
            this.cart.push(item);
        }
        
        this.saveCart();
        this.updateCartDisplay();
    }
    
    removeFromCart(index) {
        if (index >= 0 && index < this.cart.length) {
            this.cart.splice(index, 1);
            this.saveCart();
            this.updateCartDisplay();
            Utils.showAlert('تم إزالة المنتج من السلة', 'success');
        }
    }
    
    updateCartDisplay() {
        const cartItemsDiv = document.getElementById('quickCartItems');
        const cartCountSpan = document.getElementById('quickCartCount');
        const cartTotalSpan = document.getElementById('quickCartTotal');
        const cartDiv = document.getElementById('quickCart');
        
        if (this.cart.length === 0) {
            cartItemsDiv.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #999;">
                    <i class="fas fa-shopping-cart fa-3x" style="margin-bottom: 15px;"></i>
                    <p>السلة فارغة</p>
                    <p>مسح باركود منتج لإضافته</p>
                </div>
            `;
            cartDiv.style.display = 'none';
            cartCountSpan.textContent = '0';
            cartTotalSpan.textContent = '0 ر.س';
            return;
        }
        
        // حساب الإجماليات
        let totalItems = 0;
        let totalAmount = 0;
        
        let itemsHTML = '';
        
        this.cart.forEach((item, index) => {
            totalItems += item.quantity;
            totalAmount += item.total;
            
            itemsHTML += `
                <div class="cart-item" style="
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center; 
                    padding: 12px; 
                    border-bottom: 1px solid #eee;
                    background: ${index % 2 === 0 ? '#f9f9f9' : 'white'};
                ">
                    <div style="flex: 3;">
                        <div style="font-weight: bold; margin-bottom: 5px;">${item.name}</div>
                        <div style="color: #666; font-size: 12px;">
                            <span>باركود: ${item.barcode}</span> | 
                            <span>العميل: ${item.customer}</span>
                        </div>
                    </div>
                    
                    <div style="flex: 2; text-align: center;">
                        <span>${item.quantity} × ${Utils.formatCurrency(item.price)}</span>
                    </div>
                    
                    <div style="flex: 1; text-align: center; font-weight: bold; color: #27ae60;">
                        ${Utils.formatCurrency(item.total)}
                    </div>
                    
                    <div style="flex: 0;">
                        <button class="btn btn-sm btn-danger" onclick="window.quickSaleSystem.removeFromCart(${index})" 
                                style="padding: 5px 10px; font-size: 12px;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        cartItemsDiv.innerHTML = itemsHTML;
        cartCountSpan.textContent = totalItems;
        cartTotalSpan.textContent = Utils.formatCurrency(totalAmount);
        cartDiv.style.display = 'block';
    }
    
    clearCart() {
        if (this.cart.length === 0) {
            Utils.showAlert('السلة فارغة بالفعل', 'info');
            return;
        }
        
        if (confirm(`هل أنت متأكد من إفراغ السلة؟ (${this.cart.length} منتج)`)) {
            this.cart = [];
            this.saveCart();
            this.updateCartDisplay();
            Utils.showAlert('تم إفراغ السلة', 'success');
        }
    }
    
    completeAllSales() {
        if (this.cart.length === 0) {
            Utils.showAlert('السلة فارغة', 'error');
            return;
        }
        
        let successfulSales = 0;
        let failedSales = 0;
        
        // معالجة كل عنصر في السلة
        this.cart.forEach(item => {
            // البحث عن المنتج في المخزون
            const product = System.findInventoryItemById(item.productId);
            
            if (!product) {
                failedSales++;
                return;
            }
            
            // التحقق من توفر الكمية
            if (product.quantity < item.quantity) {
                Utils.showAlert(`الكمية غير متوفرة للمنتج ${product.name} (المتاح: ${product.quantity})`, 'warning');
                failedSales++;
                return;
            }
            
            // خصم الكمية من المخزون
            product.quantity -= item.quantity;
            
            // تسجيل عملية البيع
            const newSale = {
                id: Utils.generateId(System.data.sales),
                date: Utils.getToday(),
                product: product.name,
                quantity: item.quantity,
                price: product.price,
                total: item.total,
                customer: item.customer,
                notes: 'بيع سريع بالباركود',
                barcode: item.barcode
            };
            
            System.data.sales.push(newSale);
            successfulSales++;
        });
        
        if (successfulSales > 0) {
            // حفظ التغييرات
            System.saveSales();
            System.saveInventory();
            
            // تحديث العرض
            if (window.SalesManager) {
                window.SalesManager.displaySales();
            }
            
            if (window.InventoryManager) {
                window.InventoryManager.displayInventory();
            }
            
            if (window.DashboardManager) {
                window.DashboardManager.updateDashboard();
            }
            
            if (window.SalesManager) {
                window.SalesManager.updateProductOptions();
            }
            
            // إظهار فاتورة
            this.showReceipt(this.cart);
            
            // تفريغ السلة
            this.cart = [];
            this.saveCart();
            this.updateCartDisplay();
            
            Utils.showAlert(`تم إتمام ${successfulSales} عملية بيع بنجاح${failedSales > 0 ? ` (فشل ${failedSales})` : ''}`, 'success');
        } else {
            Utils.showAlert('فشل إتمام أي عملية بيع', 'error');
        }
    }
    
    showReceipt(sales) {
        const totalAmount = sales.reduce((sum, item) => sum + item.total, 0);
        
        let receiptHTML = `
            <div style="direction: rtl; text-align: right; padding: 20px; font-family: Arial, sans-serif;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h3 style="margin: 0; color: #2c3e50;">فاتورة البيع السريع</h3>
                    <p style="color: #666; margin: 5px 0;">${new Date().toLocaleString('ar-SA')}</p>
                </div>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr style="background: #f8f9fa;">
                            <th style="padding: 10px; border-bottom: 2px solid #ddd;">المنتج</th>
                            <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: center;">الكمية</th>
                            <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: center;">السعر</th>
                            <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: center;">الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        sales.forEach(item => {
            receiptHTML += `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">
                        ${item.name}<br>
                        <small style="color: #666;">(${item.customer})</small>
                    </td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${Utils.formatCurrency(item.price)}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center; font-weight: bold;">${Utils.formatCurrency(item.total)}</td>
                </tr>
            `;
        });
        
        receiptHTML += `
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" style="padding: 10px; text-align: left; font-weight: bold;">المجموع</td>
                            <td style="padding: 10px; text-align: center; font-weight: bold; color: #27ae60; font-size: 18px;">
                                ${Utils.formatCurrency(totalAmount)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
                
                <div style="margin-top: 20px; text-align: center; color: #666;">
                    <p>شكراً لتعاملكم معنا</p>
                    <p>نظام محاسبة المتاجر الصغيرة</p>
                </div>
            </div>
        `;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>فاتورة البيع السريع</title>
                <style>
                    @media print {
                        body { margin: 0; padding: 10px; }
                        .no-print { display: none !important; }
                    }
                </style>
            </head>
            <body>
                ${receiptHTML}
                <div class="no-print" style="margin-top: 30px; text-align: center;">
                    <button onclick="window.print()" style="
                        padding: 12px 24px;
                        background: #007bff;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                        margin: 10px;
                    ">
                        <i class="fas fa-print"></i> طباعة الفاتورة
                    </button>
                    <button onclick="window.close()" style="
                        padding: 12px 24px;
                        background: #6c757d;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                    ">
                        إغلاق
                    </button>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        
        // افتح نافذة الطباعة بعد تحميل الصفحة
        printWindow.onload = function() {
            // لا نفتح نافذة الطباعة تلقائياً، نترك للمستخدم الخيار
        };
    }
    
    createNewProductFromBarcode() {
        const barcode = this.barcodeInput?.value?.trim();
        if (!barcode) return;
        
        // إغلاق رسالة المنتج غير موجود
        this.hideProductNotFound();
        
        // فتح نافذة إضافة المنتج
        ModalManager.open('inventoryModal');
        
        // تعبئة الباركود بعد فترة قصيرة
        setTimeout(() => {
            const barcodeField = document.getElementById('inventoryBarcode');
            if (barcodeField) {
                barcodeField.value = barcode;
                barcodeField.focus();
            }
            
            const nameField = document.getElementById('inventoryName');
            if (nameField) {
                nameField.focus();
                nameField.placeholder = 'أدخل اسم المنتج لهذا الباركود';
            }
            
            Utils.showAlert('أكمل بيانات المنتج الجديد للبيع السريع', 'info');
            
            // إضافة مستمع لمعرفة متى يتم حفظ المنتج
            const saveBtn = document.getElementById('saveInventory');
            if (saveBtn) {
                const originalClick = saveBtn.onclick;
                saveBtn.onclick = () => {
                    if (originalClick) {
                        originalClick.call(window.InventoryManager);
                    }
                    
                    // بعد حفظ المنتج، معالجته للبيع السريع
                    setTimeout(() => {
                        this.processBarcode(); // سيتم الآن العثور على المنتج
                    }, 500);
                };
            }
        }, 500);
    }
    
    saveCart() {
        localStorage.setItem('quick_sale_cart', JSON.stringify(this.cart));
    }
    
    loadCart() {
        try {
            const saved = localStorage.getItem('quick_sale_cart');
            if (saved) {
                this.cart = JSON.parse(saved);
            }
        } catch (error) {
            console.error('خطأ في تحميل سلة البيع السريع:', error);
            this.cart = [];
        }
    }
}

// إنشاء نسخة واحدة من النظام
window.quickSaleSystem = new QuickSaleSystem();