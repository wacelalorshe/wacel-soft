// ============================================================================
// نظام البحث الشامل
// ============================================================================

class SearchManager {
    constructor() {
        this.searchHandlers = {
            'بحث_المبيعات': this.searchSales.bind(this),
            'بحث_المشتريات': this.searchPurchases.bind(this),
            'بحث_المخزون': this.searchInventory.bind(this)
        };
    }
    
    init() {
        this.initSearchInputs();
    }
    
    initSearchInputs() {
        // إضافة مستمعات الأحداث لحقول البحث
        for (const [inputId, handler] of Object.entries(this.searchHandlers)) {
            const inputElement = document.getElementById(inputId);
            if (inputElement) {
                inputElement.addEventListener('input', (e) => {
                    handler(e.target.value);
                });
            }
        }
    }
    
    searchSales(searchText) {
        if (!searchText || searchText.trim() === '') {
            if (window.SalesManager && typeof window.SalesManager.displaySales === 'function') {
                window.SalesManager.displaySales();
            }
            return;
        }
        
        searchText = searchText.toLowerCase().trim();
        const filteredSales = System.data.sales.filter(sale => {
            return (
                sale.product.toLowerCase().includes(searchText) ||
                (sale.customer && sale.customer.toLowerCase().includes(searchText))
            );
        });
        
        this.displaySearchResults('salesTableBody', filteredSales, 'sales');
    }
    
    searchPurchases(searchText) {
        if (!searchText || searchText.trim() === '') {
            if (window.PurchasesManager && typeof window.PurchasesManager.displayPurchases === 'function') {
                window.PurchasesManager.displayPurchases();
            }
            return;
        }
        
        searchText = searchText.toLowerCase().trim();
        const filteredPurchases = System.data.purchases.filter(purchase => {
            return (
                purchase.product.toLowerCase().includes(searchText) ||
                (purchase.supplier && purchase.supplier.toLowerCase().includes(searchText))
            );
        });
        
        this.displaySearchResults('purchasesTableBody', filteredPurchases, 'purchases');
    }
    
    searchInventory(searchText) {
        if (!searchText || searchText.trim() === '') {
            if (window.InventoryManager && typeof window.InventoryManager.displayInventory === 'function') {
                window.InventoryManager.displayInventory();
            }
            return;
        }
        
        searchText = searchText.toLowerCase().trim();
        const filteredInventory = System.data.inventory.filter(item => {
            return (
                item.name.toLowerCase().includes(searchText) ||
                item.category.toLowerCase().includes(searchText)
            );
        });
        
        this.displaySearchResults('inventoryTableBody', filteredInventory, 'inventory');
    }
    
    displaySearchResults(tableBodyId, data, dataType) {
        const tableBody = document.getElementById(tableBodyId);
        if (!tableBody) return;
        
        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="no-data">لا توجد نتائج للبحث</td></tr>';
            return;
        }
        
        let html = '';
        
        switch(dataType) {
            case 'sales':
                html = this.generateSalesTable(data);
                break;
            case 'purchases':
                html = this.generatePurchasesTable(data);
                break;
            case 'inventory':
                html = this.generateInventoryTable(data);
                break;
        }
        
        tableBody.innerHTML = html;
    }
    
    generateSalesTable(sales) {
        let html = '';
        let totalSales = 0;
        
        sales.forEach(sale => {
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
        
        return html;
    }
    
    generatePurchasesTable(purchases) {
        let html = '';
        let totalPurchases = 0;
        
        purchases.forEach(purchase => {
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
        
        return html;
    }
    
    generateInventoryTable(inventory) {
        let html = '';
        
        inventory.forEach(item => {
            const totalValue = item.quantity * (item.cost || 0);
            html += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.category}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price ? Utils.formatCurrency(item.price) : '-'}</td>
                    <td>${item.cost ? Utils.formatCurrency(item.cost) : '-'}</td>
                    <td>${Utils.formatCurrency(totalValue)}</td>
                    <td>
                        <button class="action-btn edit-btn" onclick="editInventory(${item.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteInventory(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        return html;
    }
}

// تصدير للاستخدام في الملفات الأخرى
window.SearchManager = SearchManager;