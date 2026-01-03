// ============================================================================
// إدارة المصروفات
// ============================================================================

class ExpensesManager {
    constructor() {
        this.modalId = 'expenseModal';
        this.tableId = 'expensesTableBody';
    }
    
    init() {
        this.bindEvents();
        this.displayExpenses();
        this.initExpenseTypes();
    }
    
    bindEvents() {
        // فتح نافذة إضافة مصروف
        document.getElementById('addExpenseBtn')?.addEventListener('click', () => {
            this.openAddModal();
        });
        
        // حفظ المصروف
        document.getElementById('saveExpense')?.addEventListener('click', () => {
            this.saveExpense();
        });
    }
    
    openAddModal() {
        document.getElementById('expenseDate').value = System.today;
        ModalManager.open(this.modalId);
    }
    
    saveExpense() {
        // جمع بيانات النموذج
        const expenseData = {
            date: document.getElementById('expenseDate').value,
            type: document.getElementById('expenseType').value,
            amount: parseFloat(document.getElementById('expenseAmount').value) || 0,
            description: document.getElementById('expenseDescription').value || ''
        };
        
        // التحقق من البيانات
        if (!this.validateExpenseData(expenseData)) {
            Utils.showAlert('يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }
        
        // إنشاء كائن المصروف
        const newExpense = {
            id: Utils.generateId(System.data.expenses),
            date: expenseData.date,
            type: expenseData.type,
            amount: expenseData.amount,
            description: expenseData.description
        };
        
        // حفظ المصروف
        System.data.expenses.push(newExpense);
        System.saveExpenses();
        
        // إغلاق النافذة وتحديث العرض
        ModalManager.close(this.modalId);
        this.resetForm();
        this.displayExpenses();
        
        // تحديث لوحة التحكم
        if (window.DashboardManager) window.DashboardManager.updateDashboard();
        
        Utils.showAlert('تم حفظ المصروف بنجاح', 'success');
    }
    
    validateExpenseData(data) {
        return data.date && data.type && data.amount > 0;
    }
    
    resetForm() {
        document.getElementById('expenseDate').value = System.today;
        document.getElementById('expenseType').value = 'إيجار';
        document.getElementById('expenseAmount').value = '';
        document.getElementById('expenseDescription').value = '';
    }
    
    initExpenseTypes() {
        const typeSelect = document.getElementById('expenseType');
        if (typeSelect) {
            typeSelect.innerHTML = '';
            
            CONFIG.EXPENSE_TYPES.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                typeSelect.appendChild(option);
            });
        }
    }
    
    displayExpenses() {
        const tableBody = document.getElementById(this.tableId);
        if (!tableBody) return;
        
        if (System.data.expenses.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="no-data">لا توجد بيانات مصروفات</td></tr>';
            return;
        }
        
        let html = '';
        let totalExpenses = 0;
        
        System.data.expenses.forEach(expense => {
            html += `
                <tr>
                    <td>${expense.date}</td>
                    <td>${expense.type}</td>
                    <td>${expense.description}</td>
                    <td>${Utils.formatCurrency(expense.amount)}</td>
                    <td>
                        <button class="action-btn edit-btn" onclick="editExpense(${expense.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteExpense(${expense.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            totalExpenses += expense.amount;
        });
        
        // إضافة صف الإجمالي
        html += `
            <tr class="total-row">
                <td colspan="3"><strong>الإجمالي</strong></td>
                <td><strong>${Utils.formatCurrency(totalExpenses)}</strong></td>
                <td></td>
            </tr>
        `;
        
        tableBody.innerHTML = html;
    }
}

// تصدير للاستخدام في الملفات الأخرى
window.ExpensesManager = ExpensesManager;