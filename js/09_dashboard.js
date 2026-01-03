// ============================================================================
// لوحة التحكم والتقارير الأساسية
// ============================================================================

class DashboardManager {
    constructor() {
        this.recentActivityCount = 10;
    }
    
    init() {
        this.bindEvents();
        this.updateDashboard();
        this.initReportGenerator();
    }
    
    bindEvents() {
        // تحديث لوحة التحكم
        document.getElementById('refreshDashboard')?.addEventListener('click', () => {
            this.updateDashboard();
            Utils.showAlert('تم تحديث البيانات', 'success');
        });
        
        // توليد التقارير
        document.getElementById('generateReport')?.addEventListener('click', () => {
            this.generateReport();
        });
    }
    
    updateDashboard() {
        this.updateTotals();
        this.displayRecentActivity();
    }
    
    updateTotals() {
        // حساب إجمالي المبيعات
        const totalSales = Utils.calculateTotal(System.data.sales, 'total');
        this.updateElement('totalSales', totalSales);
        
        // حساب إجمالي المشتريات
        const totalPurchases = Utils.calculateTotal(System.data.purchases, 'total');
        this.updateElement('totalPurchases', totalPurchases);
        
        // حساب إجمالي المصروفات
        const totalExpenses = Utils.calculateTotal(System.data.expenses, 'amount');
        this.updateElement('totalExpenses', totalExpenses);
        
        // حساب صافي الربح
        const netProfit = totalSales - totalPurchases - totalExpenses;
        this.updateElement('netProfit', netProfit, true);
    }
    
    updateElement(elementId, value, isProfit = false) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = Utils.formatCurrency(value);
            
            if (isProfit) {
                if (value < 0) {
                    element.classList.add('negative');
                } else {
                    element.classList.remove('negative');
                }
            }
        }
    }
    
    displayRecentActivity() {
        const container = document.getElementById('recentActivity');
        if (!container) return;
        
        const transactions = this.getRecentTransactions();
        
        if (transactions.length === 0) {
            container.innerHTML = '<p>لا توجد معاملات حديثة</p>';
            return;
        }
        
        container.innerHTML = this.createActivityTable(transactions);
    }
    
    getRecentTransactions() {
        const transactions = [];
        
        // آخر المبيعات
        const recentSales = System.data.sales.slice(-5).map(sale => ({
            type: 'مبيعات',
            date: sale.date,
            description: `بيع ${sale.product} - ${sale.quantity} × ${Utils.formatCurrency(sale.price)}`,
            amount: sale.total
        }));
        
        // آخر المشتريات
        const recentPurchases = System.data.purchases.slice(-5).map(purchase => ({
            type: 'مشتريات',
            date: purchase.date,
            description: `شراء ${purchase.product} - ${purchase.quantity} × ${Utils.formatCurrency(purchase.price)}`,
            amount: purchase.total
        }));
        
        // آخر المصروفات
        const recentExpenses = System.data.expenses.slice(-5).map(expense => ({
            type: 'مصروفات',
            date: expense.date,
            description: `${expense.type}: ${expense.description}`,
            amount: expense.amount
        }));
        
        transactions.push(...recentSales, ...recentPurchases, ...recentExpenses);
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        return transactions.slice(0, this.recentActivityCount);
    }
    
    createActivityTable(transactions) {
        let html = '<table style="width:100%"><thead><tr><th>النوع</th><th>التاريخ</th><th>الوصف</th><th>المبلغ</th></tr></thead><tbody>';
        
        transactions.forEach(transaction => {
            html += `
                <tr>
                    <td><span class="badge">${transaction.type}</span></td>
                    <td>${transaction.date}</td>
                    <td>${transaction.description}</td>
                    <td>${Utils.formatCurrency(transaction.amount)}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        return html;
    }
    
    initReportGenerator() {
        // تعيين تواريخ اليوم كافتراضية
        System.setDefaultDates();
    }
    
    generateReport() {
        const reportType = document.getElementById('reportType').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        let filteredSales = [];
        let filteredPurchases = [];
        let filteredExpenses = [];
        
        // تصفية البيانات حسب نوع التقرير
        switch(reportType) {
            case 'daily':
                filteredSales = System.data.sales.filter(sale => sale.date === System.today);
                filteredPurchases = System.data.purchases.filter(purchase => purchase.date === System.today);
                filteredExpenses = System.data.expenses.filter(expense => expense.date === System.today);
                break;
                
            case 'weekly':
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];
                
                filteredSales = System.data.sales.filter(sale => sale.date >= oneWeekAgoStr && sale.date <= System.today);
                filteredPurchases = System.data.purchases.filter(purchase => purchase.date >= oneWeekAgoStr && purchase.date <= System.today);
                filteredExpenses = System.data.expenses.filter(expense => expense.date >= oneWeekAgoStr && expense.date <= System.today);
                break;
                
            case 'monthly':
                const firstDayOfMonth = new Date();
                firstDayOfMonth.setDate(1);
                const firstDayStr = firstDayOfMonth.toISOString().split('T')[0];
                
                filteredSales = System.data.sales.filter(sale => sale.date >= firstDayStr && sale.date <= System.today);
                filteredPurchases = System.data.purchases.filter(purchase => purchase.date >= firstDayStr && purchase.date <= System.today);
                filteredExpenses = System.data.expenses.filter(expense => expense.date >= firstDayStr && expense.date <= System.today);
                break;
                
            case 'custom':
                if (!startDate || !endDate) {
                    Utils.showAlert('يرجى تحديد تاريخ البداية والنهاية', 'error');
                    return;
                }
                
                filteredSales = System.data.sales.filter(sale => sale.date >= startDate && sale.date <= endDate);
                filteredPurchases = System.data.purchases.filter(purchase => purchase.date >= startDate && purchase.date <= endDate);
                filteredExpenses = System.data.expenses.filter(expense => expense.date >= startDate && expense.date <= endDate);
                break;
        }
        
        // حساب الإجماليات
        const totalSales = Utils.calculateTotal(filteredSales, 'total');
        const totalPurchases = Utils.calculateTotal(filteredPurchases, 'total');
        const totalExpenses = Utils.calculateTotal(filteredExpenses, 'amount');
        const netProfit = totalSales - totalPurchases - totalExpenses;
        
        // تحديث واجهة التقارير
        this.updateReportDisplay(totalSales, totalPurchases, totalExpenses, netProfit);
        
        // بناء محتوى التقرير
        this.buildReportContent(reportType, startDate, endDate, filteredSales, filteredPurchases, filteredExpenses);
    }
    
    updateReportDisplay(sales, purchases, expenses, profit) {
        document.getElementById('reportSales').textContent = Utils.formatCurrency(sales);
        document.getElementById('reportPurchases').textContent = Utils.formatCurrency(purchases);
        document.getElementById('reportExpenses').textContent = Utils.formatCurrency(expenses);
        document.getElementById('reportProfit').textContent = Utils.formatCurrency(profit);
    }
    
    buildReportContent(reportType, startDate, endDate, sales, purchases, expenses) {
        const reportTypeName = CONFIG.REPORT_PERIODS[reportType] || reportType;
        
        let reportContent = `<h4>تقرير ${reportTypeName}</h4>`;
        reportContent += `<p>الفترة: ${startDate} إلى ${endDate}</p>`;
        
        reportContent += `<h5>المبيعات (${sales.length} عملية)</h5>`;
        if (sales.length > 0) {
            reportContent += '<ul>';
            sales.forEach(sale => {
                reportContent += `<li>${sale.date}: ${sale.product} - ${sale.quantity} × ${Utils.formatCurrency(sale.price)} = ${Utils.formatCurrency(sale.total)}</li>`;
            });
            reportContent += '</ul>';
        } else {
            reportContent += '<p>لا توجد مبيعات في هذه الفترة</p>';
        }
        
        reportContent += `<h5>المشتريات (${purchases.length} عملية)</h5>`;
        if (purchases.length > 0) {
            reportContent += '<ul>';
            purchases.forEach(purchase => {
                reportContent += `<li>${purchase.date}: ${purchase.product} - ${purchase.quantity} × ${Utils.formatCurrency(purchase.price)} = ${Utils.formatCurrency(purchase.total)}</li>`;
            });
            reportContent += '</ul>';
        } else {
            reportContent += '<p>لا توجد مشتريات في هذه الفترة</p>';
        }
        
        reportContent += `<h5>المصروفات (${expenses.length} عملية)</h5>`;
        if (expenses.length > 0) {
            reportContent += '<ul>';
            expenses.forEach(expense => {
                reportContent += `<li>${expense.date}: ${expense.type} - ${expense.description} = ${Utils.formatCurrency(expense.amount)}</li>`;
            });
            reportContent += '</ul>';
        } else {
            reportContent += '<p>لا توجد مصروفات في هذه الفترة</p>';
        }
        
        document.getElementById('reportContent').innerHTML = reportContent;
    }
}

// تصدير للاستخدام في الملفات الأخرى
window.DashboardManager = DashboardManager;