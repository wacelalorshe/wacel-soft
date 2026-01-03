// ============================================================================
// النظام الأساسي وإدارة البيانات
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
    
    init() {
        this.loadAllData();
        this.initDefaultInventory();
        this.setCurrentYear();
    }
    
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
    
    saveAllData() {
        localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(this.data.sales));
        localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(this.data.purchases));
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(this.data.expenses));
        localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(this.data.inventory));
        localStorage.setItem(STORAGE_KEYS.BACKUPS, JSON.stringify(this.data.backups));
        localStorage.setItem(STORAGE_KEYS.BACKUP_HISTORY, JSON.stringify(this.data.backupHistory));
        localStorage.setItem(STORAGE_KEYS.BACKUP_ACTIVITIES, JSON.stringify(this.data.backupActivities));
    }
    
    initDefaultInventory() {
        if (this.data.inventory.length === 0) {
            this.data.inventory = [...DEFAULT_INVENTORY];
            this.saveInventory();
        }
    }
    
    setCurrentYear() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = Utils.getCurrentYear();
        }
    }
    
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
    
    // طرق حفظ محددة
    saveSales() {
        localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(this.data.sales));
    }
    
    savePurchases() {
        localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(this.data.purchases));
    }
    
    saveExpenses() {
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(this.data.expenses));
    }
    
    saveInventory() {
        localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(this.data.inventory));
    }
    
    saveBackups() {
        localStorage.setItem(STORAGE_KEYS.BACKUPS, JSON.stringify(this.data.backups));
    }
    
    // طرق البحث
    findProductByName(name) {
        return this.data.inventory.find(item => item.name === name);
    }
    
    findSaleById(id) {
        return this.data.sales.find(sale => sale.id === id);
    }
    
    findPurchaseById(id) {
        return this.data.purchases.find(purchase => purchase.id === id);
    }
    
    findExpenseById(id) {
        return this.data.expenses.find(expense => expense.id === id);
    }
    
    findInventoryItemById(id) {
        return this.data.inventory.find(item => item.id === id);
    }
    
    // طرق التحديث
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
    
    // طرق الحذف
    deleteSale(id) {
        this.data.sales = this.data.sales.filter(sale => sale.id !== id);
        this.saveSales();
    }
    
    deletePurchase(id) {
        this.data.purchases = this.data.purchases.filter(purchase => purchase.id !== id);
        this.savePurchases();
    }
    
    deleteExpense(id) {
        this.data.expenses = this.data.expenses.filter(expense => expense.id !== id);
        this.saveExpenses();
    }
    
    deleteInventoryItem(id) {
        this.data.inventory = this.data.inventory.filter(item => item.id !== id);
        this.saveInventory();
    }
}

// إنشاء نسخة واحدة من النظام
const System = new CoreSystem();