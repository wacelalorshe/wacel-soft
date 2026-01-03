// ============================================================================
// الملف الرئيسي لربط جميع المكونات
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('تهيئة نظام محاسبة المتاجر الصغيرة...');
    
    // وظائف مساعدة للباركود
function bindBarcodeEvents() {
    // حدث لملف النسخ الاحتياطي
    document.getElementById('backupFile')?.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            window.localBackupManager.importFromFile(e.target.files[0]);
        }
    });
    
    // حدث لحقل الباركود في نموذج المخزون
    const inventoryForm = document.getElementById('inventoryModal');
    if (inventoryForm) {
        setTimeout(() => {
            const barcodeInput = document.getElementById('inventoryBarcode');
            if (barcodeInput) {
                barcodeInput.addEventListener('change', function() {
                    if (this.value && this.value.trim() !== '') {
                        window.barcodeSystem.validateBarcode(this.value);
                    }
                });
            }
        }, 1000);
    }
}

// وظائف عامة للباركود للوصول السريع
function scanBarcodeForSearch() {
    if (window.barcodeSystem) {
        window.barcodeSystem.openBarcodeScanner();
    }
}

function createProductFromBarcode(barcode) {
    ModalManager.open('inventoryModal');
    
    setTimeout(() => {
        if (window.barcodeSystem) {
            window.barcodeSystem.useBarcodeInInventory(barcode);
        }
        Utils.showAlert('أكمل بيانات المنتج الجديد', 'info');
    }, 500);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        Utils.showAlert('تم نسخ الباركود إلى الحافظة', 'success');
    }).catch(err => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        Utils.showAlert('تم نسخ الباركود إلى الحافظة', 'success');
    });
}

function generateBarcodeForItem(productId) {
    const product = System.findInventoryItemById(productId);
    if (!product) return;
    
    if (window.barcodeSystem) {
        if (!product.barcode) {
            product.barcode = window.barcodeSystem.generateBarcodeFromName(product.name);
            System.saveInventory();
            
            if (window.InventoryManager) {
                window.InventoryManager.displayInventory();
            }
            
            Utils.showAlert(`تم توليد باركود للمنتج: ${product.barcode}`, 'success');
        } else {
            Utils.showAlert('المنتج لديه باركود بالفعل', 'info');
        }
    }
}

function printBarcodeLabel(productId) {
    const product = System.findInventoryItemById(productId);
    if (!product || !product.barcode) return;
    
    const labelHTML = `
        <div style="direction: rtl; text-align: center; padding: 20px; border: 2px dashed #ddd; width: 300px; margin: 0 auto;">
            <h4 style="margin: 0 0 10px 0;">${product.name}</h4>
            <p style="margin: 0 0 5px 0; color: #666;">${product.category}</p>
            <p style="margin: 0 0 15px 0; font-size: 18px; font-weight: bold;">${Utils.formatCurrency(product.price)}</p>
            <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                <p style="margin: 0; font-family: monospace; font-size: 24px; letter-spacing: 3px;">${product.barcode}</p>
            </div>
            <small style="color: #999;">${new Date().toLocaleDateString('ar-SA')}</small>
        </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>طباعة باركود - ${product.name}</title>
                <style>
                    body { margin: 40px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                    @media print {
                        body { margin: 0; }
                    }
                </style>
            </head>
            <body>
                ${labelHTML}
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(() => window.close(), 1000);
                    }
                </script>
            </body>
        </html>
    `);
    printWindow.document.close();
}

// تصدير الوظائف للاستخدام العالمي
window.scanBarcodeForSearch = scanBarcodeForSearch;
window.createProductFromBarcode = createProductFromBarcode;
window.copyToClipboard = copyToClipboard;
window.generateBarcodeForItem = generateBarcodeForItem;
window.printBarcodeLabel = printBarcodeLabel;
    
    // 1. تهيئة النظام الأساسي
    System.init();
    
    // 2. تهيئة إدارة النوافذ المنبثقة
    ModalManager.initGlobalCloseListeners();
    ModalManager.initModalCloseButtons();
    
    // 3. تهيئة معالجات الأحداث
    EventHandlers.init();
    
    // 4. تهيئة المكونات حسب الصفحة الحالية
    const currentPath = window.location.pathname;
    
    // التحقق من وجود الأقسام وتهيئة المديرين المناسبين
    if (document.getElementById('dashboard')) {
        console.log('تهيئة لوحة التحكم...');
        window.DashboardManager = new DashboardManager();
        window.DashboardManager.init();
    }
    
    if (document.getElementById('sales')) {
        console.log('تهيئة إدارة المبيعات...');
        window.SalesManager = new SalesManager();
        window.SalesManager.init();
    }
    
    // تهيئة نظام البيع السريع (في قسم المبيعات دائماً)
console.log('تهيئة نظام البيع السريع...');
window.quickSaleSystem = new QuickSaleSystem();
window.quickSaleSystem.init();
    
    if (document.getElementById('purchases')) {
        console.log('تهيئة إدارة المشتريات...');
        window.PurchasesManager = new PurchasesManager();
        window.PurchasesManager.init();
    }
    
    if (document.getElementById('expenses')) {
        console.log('تهيئة إدارة المصروفات...');
        window.ExpensesManager = new ExpensesManager();
        window.ExpensesManager.init();
    }
    
    if (document.getElementById('inventory')) {
        console.log('تهيئة إدارة المخزون...');
        window.InventoryManager = new InventoryManager();
        window.InventoryManager.init();
    }
    
    if (document.getElementById('reports')) {
        console.log('تهيئة نظام التقارير...');
        window.ReportsManager = new ReportsManager();
        window.ReportsManager.init();
    }
    
    if (document.getElementById('backup')) {
        console.log('تهيئة نظام النسخ الاحتياطي...');
        window.localBackupManager.init();
        window.cloudBackupManager.init();
        
        // تهيئة مكونات واجهة المستخدم للنسخ الاحتياطي
        UIComponents.initAutoBackup();
        UIComponents.initStorageStatus();
        UIComponents.initAllBackupsView();
    }
    
    // 5. تهيئة نظام البحث (دائماً)
    console.log('تهيئة نظام البحث...');
    window.SearchManager = new SearchManager();
    window.SearchManager.init();
    
    // 5. تهيئة نظام الباركود
console.log('تهيئة نظام الباركود...');
if (window.barcodeSystem) {
    window.barcodeSystem.init();
    
    // تحديث حقول الباركود في جميع النوافذ المنبثقة
    setTimeout(() => {
        window.barcodeSystem.updateInventoryBarcodeFields();
    }, 500);
}
    
    
    // 6. تهيئة التواريخ الافتراضية في جميع النماذج
    System.setDefaultDates();
    
    // 7. تهيئة تحديث تلقائي للوحة التحكم كل دقيقة
    setInterval(() => {
        if (window.DashboardManager) {
            window.DashboardManager.updateDashboard();
        }
    }, 60000);
    
    // 8. تهيئة تحديث تلقائي لقائمة النسخ الاحتياطية
    setInterval(() => {
        if (window.localBackupManager) {
            window.localBackupManager.updateBackupList();
            window.localBackupManager.updateStatistics();
        }
    }, 30000);
    
    console.log('تم تهيئة النظام بنجاح!');
    
    // 9. إظهار رسالة ترحيب
    setTimeout(() => {
        Utils.showAlert('مرحباً بك في نظام محاسبة المتاجر الصغيرة', 'success');
    }, 1000);
});

// ... الكود الحالي ...

// 10. تهيئة نظام استيراد وتصدير المنتجات
console.log('تهيئة نظام استيراد وتصدير المنتجات...');
window.productImportExport = new ProductImportExport();
window.productImportExport.init();
// تهيئة مكونات الباركود
bindBarcodeEvents();
console.log('تم تهيئة النظام بنجاح!');





