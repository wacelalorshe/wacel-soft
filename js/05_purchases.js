// ============================================================================
// إدارة المشتريات
// ============================================================================

class PurchasesManager {
    constructor() {
        this.modalId = 'purchaseModal';
        this.tableId = 'purchasesTableBody';
        this.searchId = 'بحث_المشتريات';
    }
    
    init() {
        this.bindEvents();
        this.displayPurchases();
        this.initSearch();
    }
    
    bindEvents() {
        // فتح نافذة إضافة شراء
        document.getElementById('addPurchaseBtn')?.addEventListener('click', () => {
            this.openAddModal();
        });
        
        // حفظ الشراء
        document.getElementById('savePurchase')?.addEventListener('click', () => {
            this.savePurchase();
        });
    }
    
    openAddModal() {
        document.getElementById('purchaseDate').value = System.today;
        ModalManager.open(this.modalId);
    }
    
    savePurchase() {
        // جمع بيانات النموذج
        const purchaseData = {
            date: document.getElementById('purchaseDate').value,
            product: document.getElementById('purchaseProduct').value,
            quantity: parseInt(document.getElementById('purchaseQuantity').value) || 1,
            price: parseFloat(document.getElementById('purchasePrice').value) || 0,
            supplier: document.getElementById('purchaseSupplier').value || '',
            notes: document.getElementById('purchaseNotes').value || ''
        };
        
        // التحقق من البيانات
        if (!this.validatePurchaseData(purchaseData)) {
            Utils.showAlert('يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }
        
        // حساب الإجمالي وإنشاء كائن الشراء
        const newPurchase = {
            id: Utils.generateId(System.data.purchases),
            date: purchaseData.date,
            product: purchaseData.product,
            quantity: purchaseData.quantity,
            price: purchaseData.price,
            total: purchaseData.quantity * purchaseData.price,
            supplier: purchaseData.supplier,
            notes: purchaseData.notes
        };
        
        // حفظ الشراء
        System.data.purchases.push(newPurchase);
        System.savePurchases();
        
        // تحديث المخزون
        this.updateInventory(purchaseData);
        
        // إغلاق النافذة وتحديث العرض
        ModalManager.close(this.modalId);
        this.resetForm();
        this.displayPurchases();
        
        // تحديث البيانات الأخرى
        if (window.DashboardManager) window.DashboardManager.updateDashboard();
        if (window.InventoryManager) window.InventoryManager.displayInventory();
        if (window.ProductOptionsManager) window.ProductOptionsManager.updateOptions();
        
        Utils.showAlert('تم حفظ عملية الشراء بنجاح', 'success');
    }
    
    validatePurchaseData(data) {
        return data.date && data.product && data.quantity > 0 && data.price > 0;
    }
    
    updateInventory(purchaseData) {
        const existingProduct = System.findProductByName(purchaseData.product);
        
        if (existingProduct) {
            // تحديث المنتج الموجود
            existingProduct.quantity += purchaseData.quantity;
            
            // تحديث التكلفة إذا كانت أقل
            if (purchaseData.price < existingProduct.cost || existingProduct.cost === 0) {
                existingProduct.cost = purchaseData.price;
            }
        } else {
            // إضافة منتج جديد
            const newProduct = {
                id: Utils.generateId(System.data.inventory),
                name: purchaseData.product,
                category: "مشتريات جديدة",
                quantity: purchaseData.quantity,
                price: 0,
                cost: purchaseData.price
            };
            
            System.data.inventory.push(newProduct);
        }
        
        System.saveInventory();
    }
    
    resetForm() {
        document.getElementById('purchaseDate').value = System.today;
        document.getElementById('purchaseProduct').value = '';
        document.getElementById('purchaseQuantity').value = '1';
        document.getElementById('purchasePrice').value = '';
        document.getElementById('purchaseSupplier').value = '';
        document.getElementById('purchaseNotes').value = '';
    }
    
    displayPurchases() {
        const tableBody = document.getElementById(this.tableId);
        if (!tableBody) return;
        
        if (System.data.purchases.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="no-data">لا توجد بيانات مشتريات</td></tr>';
            return;
        }
        
        let html = '';
        let totalPurchases = 0;
        
        System.data.purchases.forEach(purchase => {
            html += `
                <tr>
                    <td>${purchase.date}</td>
                    <td>${purchase.product}</td>
                    <td>${purchase.quantity}</td>
                    <td>${Utils.formatCurrency(purchase.price)}</td>
                    <td>${Utils.formatCurrency(purchase.total)}</td>
                    <td>${purchase.supplier || '-'}</td>
                    <td>
                        <button class="action-btn edit-btn" onclick="editPurchase(${purchase.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="deletePurchase(${purchase.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            totalPurchases += purchase.total;
        });
        
        // إضافة صف الإجمالي
        html += `
            <tr class="total-row">
                <td colspan="4"><strong>الإجمالي</strong></td>
                <td><strong>${Utils.formatCurrency(totalPurchases)}</strong></td>
                <td colspan="2"></td>
            </tr>
        `;
        
        tableBody.innerHTML = html;
    }
    
    initSearch() {
        const searchInput = document.getElementById(this.searchId);
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchPurchases(e.target.value);
            });
        }
    }
    
    searchPurchases(searchText) {
        const tableBody = document.getElementById(this.tableId);
        if (!tableBody) return;
        
        if (!searchText || searchText.trim() === '') {
            this.displayPurchases();
            return;
        }
        
        searchText = searchText.toLowerCase().trim();
        
        const filteredPurchases = System.data.purchases.filter(purchase => {
            return (
                purchase.product.toLowerCase().includes(searchText) ||
                (purchase.supplier && purchase.supplier.toLowerCase().includes(searchText))
            );
        });
        
        if (filteredPurchases.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="no-data">لا توجد نتائج للبحث</td></tr>';
            return;
        }
        
        let html = '';
        let totalPurchases = 0;
        
        filteredPurchases.forEach(purchase => {
            html += `
                <tr>
                    <td>${purchase.date}</td>
                    <td>${purchase.product}</td>
                    <td>${purchase.quantity}</td>
                    <td>${Utils.formatCurrency(purchase.price)}</td>
                    <td>${Utils.formatCurrency(purchase.total)}</td>
                    <td>${purchase.supplier || '-'}</td>
                    <td>
                        <button class="action-btn edit-btn" onclick="editPurchase(${purchase.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="deletePurchase(${purchase.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            totalPurchases += purchase.total;
        });
        
        // إضافة صف إجمالي نتائج البحث
        html += `
            <tr class="total-row">
                <td colspan="4"><strong>إجمالي نتائج البحث</strong></td>
                <td><strong>${Utils.formatCurrency(totalPurchases)}</strong></td>
                <td colspan="2"></td>
            </tr>
        `;
        
        tableBody.innerHTML = html;
    }
}

// تصدير للاستخدام في الملفات الأخرى
window.PurchasesManager = PurchasesManager;