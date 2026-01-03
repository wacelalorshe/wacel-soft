// ============================================================================
// الإعدادات والثوابت العامة
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