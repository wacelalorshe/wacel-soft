// ============================================================================
// نظام محاسبة المتاجر الصغيرة - الإصدار الموحد
// ============================================================================

// ============================================================================
// القسم 1: الإعدادات والثوابت
// ============================================================================
const CONFIG = {
    APP_NAME: 'نظام محاسبة المتاجر الصغيرة',
    APP_VERSION: '1.0.0',
    DEFAULT_CURRENCY: 'ر.س',
    
    EXPENSE_TYPES: [
        'إيجار', 'مرتبات', 'كهرباء', 'ماء', 
        'إنترنت', 'صيانة', 'تسويق', 'نقل', 'أخرى'
    ],
    
    REPORT_PERIODS: {
        'daily': 'يومي',
        'weekly': 'أسبوعي',
        'monthly': 'شهري',
        'custom': 'مخصص'
    },
    
    REPORT_TYPES: {
        'sales': 'المبيعات',
        'purchases': 'المشتريات',
        'expenses': 'المصروفات',
        'profits': 'الأرباح',
        'inventory': 'المخزون',
        'summary': 'تقرير شامل'
    },
    
    BACKUP_INTERVALS: {
        'disabled': 'معطل',
        'daily': 'يومي',
        'weekly': 'أسبوعي',
        'monthly': 'شهري'
    },
    
    INVENTORY_CATEGORIES: [
        'فئة 1', 'فئة 2', 'مشتريات جديدة', 'الكترونيات',
        'ملابس', 'أغذية', 'أدوات', 'مكتبية', 'أخرى'
    ]
};

const STORAGE_KEYS = {
    SALES: 'sales',
    PURCHASES: 'purchases',
    EXPENSES: 'expenses',
    INVENTORY: 'inventory',
    BACKUPS: 'backups',
    BACKUP_HISTORY: 'backup_history',
    BACKUP_ACTIVITIES: 'backup_activities',
    AUTO_BACKUP_SETTINGS: 'auto_backup_settings'
};

const DEFAULT_INVENTORY = [
    { id: 1, name: "منتج أ", category: "فئة 1", quantity: 10, price: 50, cost: 30 },
    { id: 2, name: "منتج ب", category: "فئة 1", quantity: 15, price: 30, cost: 20 },
    { id: 3, name: "منتج ج", category: "فئة 2", quantity: 8, price: 80, cost: 50 }
];
// نهاية القسم 1: الإعدادات والثوابت
// ============================================================================

// ============================================================================
// القسم 2: النظام الأساسي وإدارة البيانات (CoreSystem)
// ============================================================================
class CoreSystem {
    constructor() {
        this.today = Utils.getToday();
        this.data = {
            sales: [],
            purchases: [],
            expenses: [],
            inventory: [],
            backups: [],
            backupHistory: [],
            backupActivities: []
        };
        
        this.init();
    }
    
    // ============================================================================
    // دالة: init()
    // الغرض: تهيئة النظام الأساسي
    // ============================================================================
    init() {
        this.loadAllData();
        this.initDefaultInventory();
        this.setCurrentYear();
    }
    // نهاية دالة init()
    
    // ============================================================================
    // دالة: loadAllData()
    // الغرض: تحميل جميع البيانات من التخزين المحلي
    // ============================================================================
    loadAllData() {
        // تحميل بيانات المبيعات
        this.data.sales = JSON.parse(localStorage.getItem(STORAGE_KEYS.SALES)) || [];
        
        // تحميل بيانات المشتريات
        this.data.purchases = JSON.parse(localStorage.getItem(STORAGE_KEYS.PURCHASES)) || [];
        
        // تحميل بيانات المصروفات
        this.data.expenses = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES)) || [];
        
        // تحميل بيانات المخزون
        this.data.inventory = JSON.parse(localStorage.getItem(STORAGE_KEYS.INVENTORY)) || [];
        
        // تحميل النسخ الاحتياطية
        this.data.backups = JSON.parse(localStorage.getItem(STORAGE_KEYS.BACKUPS)) || [];
        
        // تحميل سجل النسخ
        this.data.backupHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.BACKUP_HISTORY)) || [];
        
        // تحميل نشاطات النسخ
        this.data.backupActivities = JSON.parse(localStorage.getItem(STORAGE_KEYS.BACKUP_ACTIVITIES)) || [];
    }
    // نهاية دالة loadAllData()
    
    // ============================================================================
    // دالة: saveAllData()
    // الغرض: حفظ جميع البيانات في التخزين المحلي
    // ============================================================================
    saveAllData() {
        localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(this.data.sales));
        localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(this.data.purchases));
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(this.data.expenses));
        localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(this.data.inventory));
        localStorage.setItem(STORAGE_KEYS.BACKUPS, JSON.stringify(this.data.backups));
        localStorage.setItem(STORAGE_KEYS.BACKUP_HISTORY, JSON.stringify(this.data.backupHistory));
        localStorage.setItem(STORAGE_KEYS.BACKUP_ACTIVITIES, JSON.stringify(this.data.backupActivities));
    }
    // نهاية دالة saveAllData()
    
    // ============================================================================
    // دالة: initDefaultInventory()
    // الغرض: تهيئة المخزون الافتراضي إذا كان فارغاً
    // ============================================================================
    initDefaultInventory() {
        if (this.data.inventory.length === 0) {
            this.data.inventory = [...DEFAULT_INVENTORY];
            this.saveInventory();
        }
    }
    // نهاية دالة initDefaultInventory()
    
    // ============================================================================
    // دالة: setCurrentYear()
    // الغرض: تعيين السنة الحالية في الواجهة
    // ============================================================================
    setCurrentYear() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = Utils.getCurrentYear();
        }
    }
    // نهاية دالة setCurrentYear()
    
    // ============================================================================
    // دالة: setDefaultDates()
    // الغرض: تعيين التواريخ الافتراضية في جميع الحقول
    // ============================================================================
    setDefaultDates() {
        const dateFields = [
            'saleDate', 'purchaseDate', 'expenseDate',
            'startDate', 'endDate'
        ];
        
        dateFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = this.today;
            }
        });
    }
    // نهاية دالة setDefaultDates()
    
    // ============================================================================
    // دالة: saveSales()
    // الغرض: حفظ بيانات المبيعات فقط
    // ============================================================================
    saveSales() {
        localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(this.data.sales));
    }
    // نهاية دالة saveSales()
    
    // ============================================================================
    // دالة: savePurchases()
    // الغرض: حفظ بيانات المشتريات فقط
    // ============================================================================
    savePurchases() {
        localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(this.data.purchases));
    }
    // نهاية دالة savePurchases()
    
    // ============================================================================
    // دالة: saveExpenses()
    // الغرض: حفظ بيانات المصروفات فقط
    // ============================================================================
    saveExpenses() {
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(this.data.expenses));
    }
    // نهاية دالة saveExpenses()
    
    // ============================================================================
    // دالة: saveInventory()
    // الغرض: حفظ بيانات المخزون فقط
    // ============================================================================
    saveInventory() {
        localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(this.data.inventory));
    }
    // نهاية دالة saveInventory()
    
    // ============================================================================
    // دالة: saveBackups()
    // الغرض: حفظ بيانات النسخ الاحتياطي فقط
    // ============================================================================
    saveBackups() {
        localStorage.setItem(STORAGE_KEYS.BACKUPS, JSON.stringify(this.data.backups));
    }
    // نهاية دالة saveBackups()
    
    // ============================================================================
    // دالة: findProductByName()
    // الغرض: البحث عن منتج بالاسم
    // ============================================================================
    findProductByName(name) {
        return this.data.inventory.find(item => item.name === name);
    }
    // نهاية دالة findProductByName()
    
    // ============================================================================
    // دالة: findSaleById()
    // الغرض: البحث عن عملية بيع بالمعرف
    // ============================================================================
    findSaleById(id) {
        return this.data.sales.find(sale => sale.id === id);
    }
    // نهاية دالة findSaleById()
    
    // ============================================================================
    // دالة: findPurchaseById()
    // الغرض: البحث عن عملية شراء بالمعرف
    // ============================================================================
    findPurchaseById(id) {
        return this.data.purchases.find(purchase => purchase.id === id);
    }
    // نهاية دالة findPurchaseById()
    
    // ============================================================================
    // دالة: findExpenseById()
    // الغرض: البحث عن مصروف بالمعرف
    // ============================================================================
    findExpenseById(id) {
        return this.data.expenses.find(expense => expense.id === id);
    }
    // نهاية دالة findExpenseById()
    
    // ============================================================================
    // دالة: findInventoryItemById()
    // الغرض: البحث عن عنصر مخزون بالمعرف
    // ============================================================================
    findInventoryItemById(id) {
        return this.data.inventory.find(item => item.id === id);
    }
    // نهاية دالة findInventoryItemById()
    
    // ============================================================================
    // دالة: updateProductQuantity()
    // الغرض: تحديث كمية المنتج
    // ============================================================================
    updateProductQuantity(productName, quantityChange) {
        const product = this.findProductByName(productName);
        if (product) {
            product.quantity += quantityChange;
            if (product.quantity < 0) product.quantity = 0;
            this.saveInventory();
            return true;
        }
        return false;
    }
    // نهاية دالة updateProductQuantity()
    
    // ============================================================================
    // دالة: deleteSale()
    // الغرض: حذف عملية بيع
    // ============================================================================
    deleteSale(id) {
        this.data.sales = this.data.sales.filter(sale => sale.id !== id);
        this.saveSales();
    }
    // نهاية دالة deleteSale()
    
    // ============================================================================
    // دالة: deletePurchase()
    // الغرض: حذف عملية شراء
    // ============================================================================
    deletePurchase(id) {
        this.data.purchases = this.data.purchases.filter(purchase => purchase.id !== id);
        this.savePurchases();
    }
    // نهاية دالة deletePurchase()
    
    // ============================================================================
    // دالة: deleteExpense()
    // الغرض: حذف مصروف
    // ============================================================================
    deleteExpense(id) {
        this.data.expenses = this.data.expenses.filter(expense => expense.id !== id);
        this.saveExpenses();
    }
    // نهاية دالة deleteExpense()
    
    // ============================================================================
    // دالة: deleteInventoryItem()
    // الغرض: حذف عنصر مخزون
    // ============================================================================
    deleteInventoryItem(id) {
        this.data.inventory = this.data.inventory.filter(item => item.id !== id);
        this.saveInventory();
    }
    // نهاية دالة deleteInventoryItem()
}
// نهاية الفئة CoreSystem

// إنشاء نسخة واحدة من النظام
const System = new CoreSystem();
// نهاية القسم 2: النظام الأساسي
// ============================================================================

// ============================================================================
// القسم 3: الملف الرئيسي وتهيئة التطبيق
// ============================================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('تهيئة نظام محاسبة المتاجر الصغيرة...');
    
    // ============================================================================
    // دالة: bindBarcodeEvents()
    // الغرض: ربط أحداث الباركود
    // ============================================================================
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
    // نهاية دالة bindBarcodeEvents()
    
    // ============================================================================
    // دالة: scanBarcodeForSearch()
    // الغرض: مسح باركود للبحث
    // ============================================================================
    function scanBarcodeForSearch() {
        if (window.barcodeSystem) {
            window.barcodeSystem.openBarcodeScanner();
        }
    }
    // نهاية دالة scanBarcodeForSearch()
    
    // ============================================================================
    // دالة: createProductFromBarcode()
    // الغرض: إنشاء منتج جديد من الباركود
    // ============================================================================
    function createProductFromBarcode(barcode) {
        ModalManager.open('inventoryModal');
        
        setTimeout(() => {
            if (window.barcodeSystem) {
                window.barcodeSystem.useBarcodeInInventory(barcode);
            }
            Utils.showAlert('أكمل بيانات المنتج الجديد', 'info');
        }, 500);
    }
    // نهاية دالة createProductFromBarcode()
    
    // ============================================================================
    // دالة: copyToClipboard()
    // الغرض: نسخ النص إلى الحافظة
    // ============================================================================
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
    // نهاية دالة copyToClipboard()
    
    // ============================================================================
    // دالة: generateBarcodeForItem()
    // الغرض: توليد باركود لعنصر
    // ============================================================================
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
    // نهاية دالة generateBarcodeForItem()
    
    // ============================================================================
    // دالة: printBarcodeLabel()
    // الغرض: طباعة ملصق الباركود
    // ============================================================================
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
    // نهاية دالة printBarcodeLabel()
    
    // تصدير الوظائف للاستخدام العالمي
    window.scanBarcodeForSearch = scanBarcodeForSearch;
    window.createProductFromBarcode = createProductFromBarcode;
    window.copyToClipboard = copyToClipboard;
    window.generateBarcodeForItem = generateBarcodeForItem;
    window.printBarcodeLabel = printBarcodeLabel;
    
    // ============================================================================
    // الخطوة 1: تهيئة النظام الأساسي
    // ============================================================================
    System.init();
    
    // ============================================================================
    // الخطوة 2: تهيئة إدارة النوافذ المنبثقة
    // ============================================================================
    ModalManager.initGlobalCloseListeners();
    ModalManager.initModalCloseButtons();
    
    // ============================================================================
    // الخطوة 3: تهيئة معالجات الأحداث
    // ============================================================================
    EventHandlers.init();
    
    // ============================================================================
    // الخطوة 4: تهيئة المكونات حسب الصفحة الحالية
    // ============================================================================
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
    
    // ============================================================================
    // الخطوة 5: تهيئة نظام البحث (دائماً)
    // ============================================================================
    console.log('تهيئة نظام البحث...');
    window.SearchManager = new SearchManager();
    window.SearchManager.init();
    
    // ============================================================================
    // الخطوة 6: تهيئة نظام الباركود
    // ============================================================================
    console.log('تهيئة نظام الباركود...');
    if (window.barcodeSystem) {
        window.barcodeSystem.init();
        
        // تحديث حقول الباركود في جميع النوافذ المنبثقة
        setTimeout(() => {
            window.barcodeSystem.updateInventoryBarcodeFields();
        }, 500);
    }
    
    // ============================================================================
    // الخطوة 7: تهيئة التواريخ الافتراضية في جميع النماذج
    // ============================================================================
    System.setDefaultDates();
    
    // ============================================================================
    // الخطوة 8: تهيئة تحديث تلقائي للوحة التحكم كل دقيقة
    // ============================================================================
    setInterval(() => {
        if (window.DashboardManager) {
            window.DashboardManager.updateDashboard();
        }
    }, 60000);
    
    // ============================================================================
    // الخطوة 9: تهيئة تحديث تلقائي لقائمة النسخ الاحتياطية
    // ============================================================================
    setInterval(() => {
        if (window.localBackupManager) {
            window.localBackupManager.updateBackupList();
            window.localBackupManager.updateStatistics();
        }
    }, 30000);
    
    console.log('تم تهيئة النظام بنجاح!');
    
    // ============================================================================
    // الخطوة 10: إظهار رسالة ترحيب
    // ============================================================================
    setTimeout(() => {
        Utils.showAlert('مرحباً بك في نظام محاسبة المتاجر الصغيرة', 'success');
    }, 1000);
    
    // ============================================================================
    // الخطوة 11: تهيئة نظام استيراد وتصدير المنتجات
    // ============================================================================
    console.log('تهيئة نظام استيراد وتصدير المنتجات...');
    window.productImportExport = new ProductImportExport();
    window.productImportExport.init();
    
    // ============================================================================
    // الخطوة 12: تهيئة مكونات الباركود
    // ============================================================================
    bindBarcodeEvents();
    console.log('تم تهيئة النظام بنجاح!');
    
    // ============================================================================
    // الخطوة 13: تهيئة نظام استيراد وتصدير Excel
    // ============================================================================
    console.log('تهيئة نظام استيراد وتصدير Excel...');
    window.excelImportExport = new ExcelImportExport();
    window.excelImportExport.init();
});
// نهاية القسم 3: الملف الرئيسي
// ============================================================================