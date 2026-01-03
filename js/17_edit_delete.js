// ============================================================================
// وظائف التعديل والحذف
// ============================================================================

// وظائف التعديل
function editSale(id) {
    const sale = System.findSaleById(id);
    if (!sale) {
        Utils.showAlert('لم يتم العثور على عملية البيع', 'error');
        return;
    }
    
    Utils.showAlert(`تعديل عملية البيع رقم ${id}`, 'info');
    // يمكن إضافة منطق التعديل هنا
}

function editPurchase(id) {
    const purchase = System.findPurchaseById(id);
    if (!purchase) {
        Utils.showAlert('لم يتم العثور على عملية الشراء', 'error');
        return;
    }
    
    Utils.showAlert(`تعديل عملية الشراء رقم ${id}`, 'info');
    // يمكن إضافة منطق التعديل هنا
}

function editExpense(id) {
    const expense = System.findExpenseById(id);
    if (!expense) {
        Utils.showAlert('لم يتم العثور على المصروف', 'error');
        return;
    }
    
    Utils.showAlert(`تعديل المصروف رقم ${id}`, 'info');
    // يمكن إضافة منطق التعديل هنا
}

function editInventory(id) {
    const item = System.findInventoryItemById(id);
    if (!item) {
        Utils.showAlert('لم يتم العثور على المنتج', 'error');
        return;
    }
    
    Utils.showAlert(`تعديل المنتج رقم ${id}`, 'info');
    // يمكن إضافة منطق التعديل هنا
}

// وظائف الحذف
async function deleteSale(id) {
    const sale = System.findSaleById(id);
    if (!sale) {
        Utils.showAlert('لم يتم العثور على عملية البيع', 'error');
        return;
    }
    
    const confirmed = await Utils.confirmDialog(
        'حذف عملية البيع',
        `هل أنت متأكد من حذف عملية البيع هذه؟
        <br><strong>المنتج:</strong> ${sale.product}
        <br><strong>الكمية:</strong> ${sale.quantity}
        <br><strong>المبلغ:</strong> ${Utils.formatCurrency(sale.total)}
        <br><strong>التاريخ:</strong> ${sale.date}`,
        'حذف',
        'إلغاء'
    );
    
    if (!confirmed) return;
    
    System.deleteSale(id);
    
    // تحديث العرض
    if (window.SalesManager) {
        window.SalesManager.displaySales();
    }
    if (window.DashboardManager) {
        window.DashboardManager.updateDashboard();
    }
    
    Utils.showAlert('تم حذف عملية البيع بنجاح', 'success');
}

async function deletePurchase(id) {
    const purchase = System.findPurchaseById(id);
    if (!purchase) {
        Utils.showAlert('لم يتم العثور على عملية الشراء', 'error');
        return;
    }
    
    const confirmed = await Utils.confirmDialog(
        'حذف عملية الشراء',
        `هل أنت متأكد من حذف عملية الشراء هذه؟
        <br><strong>المنتج:</strong> ${purchase.product}
        <br><strong>الكمية:</strong> ${purchase.quantity}
        <br><strong>المبلغ:</strong> ${Utils.formatCurrency(purchase.total)}
        <br><strong>التاريخ:</strong> ${purchase.date}`,
        'حذف',
        'إلغاء'
    );
    
    if (!confirmed) return;
    
    System.deletePurchase(id);
    
    // تحديث العرض
    if (window.PurchasesManager) {
        window.PurchasesManager.displayPurchases();
    }
    if (window.DashboardManager) {
        window.DashboardManager.updateDashboard();
    }
    
    Utils.showAlert('تم حذف عملية الشراء بنجاح', 'success');
}

async function deleteExpense(id) {
    const expense = System.findExpenseById(id);
    if (!expense) {
        Utils.showAlert('لم يتم العثور على المصروف', 'error');
        return;
    }
    
    const confirmed = await Utils.confirmDialog(
        'حذف المصروف',
        `هل أنت متأكد من حذف هذا المصروف؟
        <br><strong>النوع:</strong> ${expense.type}
        <br><strong>المبلغ:</strong> ${Utils.formatCurrency(expense.amount)}
        <br><strong>التاريخ:</strong> ${expense.date}`,
        'حذف',
        'إلغاء'
    );
    
    if (!confirmed) return;
    
    System.deleteExpense(id);
    
    // تحديث العرض
    if (window.ExpensesManager) {
        window.ExpensesManager.displayExpenses();
    }
    if (window.DashboardManager) {
        window.DashboardManager.updateDashboard();
    }
    
    Utils.showAlert('تم حذف المصروف بنجاح', 'success');
}

async function deleteInventory(id) {
    const item = System.findInventoryItemById(id);
    if (!item) {
        Utils.showAlert('لم يتم العثور على المنتج', 'error');
        return;
    }
    
    const confirmed = await Utils.confirmDialog(
        'حذف المنتج من المخزون',
        `هل أنت متأكد من حذف هذا المنتج من المخزون؟
        <br><strong>الاسم:</strong> ${item.name}
        <br><strong>الفئة:</strong> ${item.category}
        <br><strong>الكمية:</strong> ${item.quantity}
        <br><strong>القيمة:</strong> ${Utils.formatCurrency(item.quantity * (item.cost || 0))}`,
        'حذف',
        'إلغاء'
    );
    
    if (!confirmed) return;
    
    System.deleteInventoryItem(id);
    
    // تحديث العرض
    if (window.InventoryManager) {
        window.InventoryManager.displayInventory();
    }
    if (window.SalesManager) {
        window.SalesManager.updateProductOptions();
    }
    
    Utils.showAlert('تم حذف المنتج من المخزون بنجاح', 'success');
}

// تصدير الوظائف للنافذة العالمية
window.editSale = editSale;
window.editPurchase = editPurchase;
window.editExpense = editExpense;
window.editInventory = editInventory;
window.deleteSale = deleteSale;
window.deletePurchase = deletePurchase;
window.deleteExpense = deleteExpense;
window.deleteInventory = deleteInventory;