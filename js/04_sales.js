// ============================================================================
// إدارة المبيعات
// ============================================================================

class SalesManager {
    constructor() {
        this.modalId = 'saleModal';
        this.tableId = 'salesTableBody';
        this.searchId = 'بحث_المبيعات';
if (window.quickSaleSystem) {
    window.quickSaleSystem.updateCartDisplay();
}
    }
    
    init() {
        this.bindEvents();
        this.updateProductOptions();
        this.displaySales();
        this.initSearch();
    }
    
    bindEvents() {
        // فتح نافذة إضافة بيع
        document.getElementById('addSaleBtn')?.addEventListener('click', () => {
            this.openAddModal();
        });
        
        // حفظ البيع
        document.getElementById('saveSale')?.addEventListener('click', () => {
            this.saveSale();
        });
        
        // تحديث سعر المنتج عند الاختيار
        const productSelect = document.getElementById('saleProduct');
        if (productSelect) {
            productSelect.addEventListener('change', () => {
                this.updateProductPrice();
            });
        }
    }
    
    openAddModal() {
        document.getElementById('saleDate').value = System.today;
        ModalManager.open(this.modalId);
    }
    
    updateProductPrice() {
        const productSelect = document.getElementById('saleProduct');
        const priceInput = document.getElementById('salePrice');
        
        if (productSelect && priceInput) {
            const productName = productSelect.value;
            const product = System.findProductByName(productName);
            
            if (product && product.price) {
                priceInput.value = product.price;
            } else {
                priceInput.value = '';
            }
        }
    }
    
    saveSale() {
        // جمع بيانات النموذج
        const saleData = {
            date: document.getElementById('saleDate').value,
            product: document.getElementById('saleProduct').value,
            quantity: parseInt(document.getElementById('saleQuantity').value) || 1,
            price: parseFloat(document.getElementById('salePrice').value) || 0,
            customer: document.getElementById('saleCustomer').value || '',
            notes: document.getElementById('saleNotes').value || ''
        };
        
        // التحقق من البيانات
        if (!this.validateSaleData(saleData)) {
            Utils.showAlert('يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }
        
        // التحقق من توفر المنتج في المخزون
        const product = System.findProductByName(saleData.product);
        if (!product) {
            Utils.showAlert('المنتج غير موجود في المخزون', 'error');
            return;
        }
        
        // التحقق من توفر الكمية
        if (product.quantity < saleData.quantity) {
            Utils.showAlert(`الكمية المطلوبة غير متوفرة. المتاحة: ${product.quantity}`, 'error');
            return;
        }
        
        // تحديث المخزون
        product.quantity -= saleData.quantity;
        
        // إنشاء كائن البيع
        const newSale = {
            id: Utils.generateId(System.data.sales),
            date: saleData.date,
            product: saleData.product,
            quantity: saleData.quantity,
            price: saleData.price,
            total: saleData.quantity * saleData.price,
            customer: saleData.customer,
            notes: saleData.notes
        };
        
        // حفظ البيع
        System.data.sales.push(newSale);
        System.saveSales();
        System.saveInventory();
        
        // إغلاق النافذة وتحديث العرض
        ModalManager.close(this.modalId);
        this.resetForm();
        this.displaySales();
        
        // تحديث البيانات الأخرى
        if (window.DashboardManager) window.DashboardManager.updateDashboard();
        if (window.InventoryManager) window.InventoryManager.displayInventory();
        if (window.ProductOptionsManager) window.ProductOptionsManager.updateOptions();
        
        Utils.showAlert('تم حفظ عملية البيع بنجاح', 'success');
    }
    
    validateSaleData(data) {
        return data.date && data.product && data.quantity > 0 && data.price > 0;
    }
    
    resetForm() {
        document.getElementById('saleDate').value = System.today;
        document.getElementById('saleProduct').value = '';
        document.getElementById('saleQuantity').value = '1';
        document.getElementById('salePrice').value = '';
        document.getElementById('saleCustomer').value = '';
        document.getElementById('saleNotes').value = '';
    }
    
    updateProductOptions() {
        const select = document.getElementById('saleProduct');
        if (!select) return;
        
        select.innerHTML = '<option value="">اختر منتج</option>';
        
        System.data.inventory.forEach(item => {
            if (item.quantity > 0) {
                const option = document.createElement('option');
                option.value = item.name;
                option.textContent = `${item.name} (المتبقي: ${item.quantity})`;
                select.appendChild(option);
            }
        });
    }
    
    displaySales() {
        const tableBody = document.getElementById(this.tableId);
        if (!tableBody) return;
        
        if (System.data.sales.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="no-data">لا توجد بيانات مبيعات</td></tr>';
            return;
        }
        
        let html = '';
        let totalSales = 0;
        
        System.data.sales.forEach(sale => {
            html += `
                <tr>
                    <td>${sale.date}</td>
                    <td>${sale.product}</td>
                    <td>${sale.quantity}</td>
                    <td>${Utils.formatCurrency(sale.price)}</td>
                    <td>${Utils.formatCurrency(sale.total)}</td>
                    <td>${sale.customer || '-'}</td>
                    <td>
                        <button class="action-btn edit-btn" onclick="editSale(${sale.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteSale(${sale.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            totalSales += sale.total;
        });
        
        // إضافة صف الإجمالي
        html += `
            <tr class="total-row">
                <td colspan="4"><strong>الإجمالي</strong></td>
                <td><strong>${Utils.formatCurrency(totalSales)}</strong></td>
                <td colspan="2"></td>
            </tr>
        `;
        
        tableBody.innerHTML = html;
    }
    
    initSearch() {
        const searchInput = document.getElementById(this.searchId);
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchSales(e.target.value);
            });
        }
    }
    
    searchSales(searchText) {
        const tableBody = document.getElementById(this.tableId);
        if (!tableBody) return;
        
        if (!searchText || searchText.trim() === '') {
            this.displaySales();
            return;
        }
        
        searchText = searchText.toLowerCase().trim();
        
        const filteredSales = System.data.sales.filter(sale => {
            return (
                sale.product.toLowerCase().includes(searchText) ||
                (sale.customer && sale.customer.toLowerCase().includes(searchText))
            );
        });
        
        if (filteredSales.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="no-data">لا توجد نتائج للبحث</td></tr>';
            return;
        }
        
        let html = '';
        let totalSales = 0;
        
        filteredSales.forEach(sale => {
            html += `
                <tr>
                    <td>${sale.date}</td>
                    <td>${sale.product}</td>
                    <td>${sale.quantity}</td>
                    <td>${Utils.formatCurrency(sale.price)}</td>
                    <td>${Utils.formatCurrency(sale.total)}</td>
                    <td>${sale.customer || '-'}</td>
                    <td>
                        <button class="action-btn edit-btn" onclick="editSale(${sale.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteSale(${sale.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            totalSales += sale.total;
        });
        
        // إضافة صف إجمالي نتائج البحث
        html += `
            <tr class="total-row">
                <td colspan="4"><strong>إجمالي نتائج البحث</strong></td>
                <td><strong>${Utils.formatCurrency(totalSales)}</strong></td>
                <td colspan="2"></td>
            </tr>
        `;
        
        tableBody.innerHTML = html;
    }
}

// تصدير للاستخدام في الملفات الأخرى
window.SalesManager = SalesManager;