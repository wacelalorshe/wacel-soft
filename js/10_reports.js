// ============================================================================
// نظام التقارير الأساسي
// ============================================================================

class ReportsManager {
    constructor() {
        this.currentReportType = 'sales';
    }
    
    init() {
        this.bindEvents();
        this.initializeReports();
    }
    
    bindEvents() {
        // أحداث تصنيفات التقارير
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.changeReportType(e.currentTarget);
            });
        });
        
        // حدث تغيير الفترة الزمنية
        document.getElementById('reportPeriod')?.addEventListener('change', () => {
            this.toggleCustomDates();
        });
        
        // حدث توليد التقرير
        document.getElementById('generateReportBtn')?.addEventListener('click', () => {
            this.generateReport();
        });
    }
    
    initializeReports() {
        const today = Utils.getToday();
        
        // تعيين تواريخ الفترة المخصصة
        const startDate = document.getElementById('startDate');
        const endDate = document.getElementById('endDate');
        
        if (startDate) startDate.value = today;
        if (endDate) endDate.value = today;
        
        // ملء قائمة فئات المنتجات
        this.populateCategories();
        
        // إخفاء مرشح الفئة افتراضياً
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.style.display = 'none';
        }
    }
    
    changeReportType(tabElement) {
        // إزالة النشاط من جميع الألسنة
        document.querySelectorAll('.category-tab').forEach(t => {
            t.classList.remove('active');
        });
        
        // إضافة النشاط للسان الحالي
        tabElement.classList.add('active');
        
        // تغيير نوع التقرير
        const category = tabElement.getAttribute('data-category');
        this.currentReportType = category;
        this.updateReportInterface(category);
    }
    
    updateReportInterface(reportType) {
        const reportTitle = document.getElementById('reportTitle');
        const productFilter = document.getElementById('productFilter');
        const categoryFilter = document.getElementById('categoryFilter');
        
        // تحديث عنوان التقرير
        const titles = {
            'sales': 'تقرير المبيعات',
            'purchases': 'تقرير المشتريات',
            'expenses': 'تقرير المصروفات',
            'profits': 'تقرير الأرباح',
            'inventory': 'تقرير المخازن',
            'summary': 'تقرير شامل'
        };
        
        if (reportTitle) {
            reportTitle.textContent = titles[reportType] || 'تقرير';
        }
        
        // إظهار/إخفاء المرشحات حسب نوع التقرير
        if (productFilter) {
            if (reportType === 'sales' || reportType === 'purchases' || reportType === 'inventory') {
                productFilter.style.display = 'block';
            } else {
                productFilter.style.display = 'none';
            }
        }
        
        if (categoryFilter) {
            if (reportType === 'inventory') {
                categoryFilter.style.display = 'block';
            } else {
                categoryFilter.style.display = 'none';
            }
        }
    }
    
    toggleCustomDates() {
        const period = document.getElementById('reportPeriod').value;
        const customDates = document.getElementById('customDates');
        
        if (customDates) {
            if (period === 'custom') {
                customDates.style.display = 'block';
            } else {
                customDates.style.display = 'none';
            }
        }
    }
    
    populateCategories() {
        const categorySelect = document.getElementById('productCategory');
        if (!categorySelect) return;
        
        // جمع الفئات الفريدة من المخزون
        const categories = [...new Set(System.data.inventory.map(item => item.category))];
        
        // إضافة الخيارات
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }
    
    generateReport() {
        const reportType = this.currentReportType;
        const period = document.getElementById('reportPeriod').value;
        const format = document.getElementById('reportFormat').value;
        const productName = document.getElementById('productName')?.value || '';
        const category = document.getElementById('productCategory')?.value || '';
        
        // الحصول على التواريخ
        const dates = this.getDates(period);
        
        // تحديث نص الفترة
        const periodText = document.getElementById('reportPeriodText');
        if (periodText) {
            periodText.textContent = `الفترة: ${this.getPeriodText(period, dates)}`;
        }
        
        // توليد التقرير حسب النوع
        switch(reportType) {
            case 'sales':
                this.generateSalesReport(dates, format, productName);
                break;
            case 'purchases':
                this.generatePurchasesReport(dates, format, productName);
                break;
            case 'expenses':
                this.generateExpensesReport(dates, format);
                break;
            case 'profits':
                this.generateProfitsReport(dates, format);
                break;
            case 'inventory':
                this.generateInventoryReport(format, category);
                break;
            case 'summary':
                this.generateSummaryReport(dates, format);
                break;
        }
    }
    
    getDates(period) {
        const today = new Date();
        let startDate, endDate;
        
        switch(period) {
            case 'daily':
                startDate = today.toISOString().split('T')[0];
                endDate = startDate;
                break;
                
            case 'weekly':
                endDate = today.toISOString().split('T')[0];
                const weekAgo = new Date(today);
                weekAgo.setDate(today.getDate() - 7);
                startDate = weekAgo.toISOString().split('T')[0];
                break;
                
            case 'monthly':
                endDate = today.toISOString().split('T')[0];
                const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                startDate = firstDayOfMonth.toISOString().split('T')[0];
                break;
                
            case 'yearly':
                endDate = today.toISOString().split('T')[0];
                const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
                startDate = firstDayOfYear.toISOString().split('T')[0];
                break;
                
            case 'custom':
                startDate = document.getElementById('startDate').value;
                endDate = document.getElementById('endDate').value;
                break;
                
            default:
                startDate = today.toISOString().split('T')[0];
                endDate = startDate;
        }
        
        return { startDate, endDate };
    }
    
    getPeriodText(period, dates) {
        const periodTexts = {
            'daily': 'اليوم',
            'weekly': 'أسبوع',
            'monthly': 'شهر',
            'yearly': 'سنة',
            'custom': `${dates.startDate} إلى ${dates.endDate}`
        };
        
        return periodTexts[period] || 'فترة غير محددة';
    }
    
    generateSalesReport(dates, format, productName) {
        // تصفية المبيعات حسب الفترة والمنتج
        let filteredSales = System.data.sales.filter(sale => {
            const withinPeriod = sale.date >= dates.startDate && sale.date <= dates.endDate;
            const matchesProduct = !productName || sale.product.toLowerCase().includes(productName.toLowerCase());
            return withinPeriod && matchesProduct;
        });
        
        // حساب الإحصائيات
        const totalSales = Utils.calculateTotal(filteredSales, 'total');
        const transactionCount = filteredSales.length;
        const averageValue = transactionCount > 0 ? totalSales / transactionCount : 0;
        const highestValue = filteredSales.length > 0 ? Math.max(...filteredSales.map(s => s.total)) : 0;
        
        // تحديث الإحصائيات
        this.updateReportStatistics(totalSales, transactionCount, averageValue, highestValue);
        
        // عرض التقرير
        this.displaySalesReportContent(dates, filteredSales, totalSales, transactionCount, averageValue, highestValue, format);
    }
    
    updateReportStatistics(total, count, average, highest) {
        const totalElement = document.getElementById('reportTotalSales');
        const countElement = document.getElementById('reportTransactionsCount');
        const averageElement = document.getElementById('reportAverageValue');
        const highestElement = document.getElementById('reportHighestValue');
        
        if (totalElement) totalElement.textContent = Utils.formatCurrency(total);
        if (countElement) countElement.textContent = count;
        if (averageElement) averageElement.textContent = Utils.formatCurrency(average);
        if (highestElement) highestElement.textContent = Utils.formatCurrency(highest);
    }
    
    displaySalesReportContent(dates, sales, total, count, average, highest, format) {
        let reportContent = '';
        
        if (format === 'summary') {
            reportContent = `
                <div class="info-block">
                    <h5>ملخص تقرير المبيعات</h5>
                    <p><strong>الفترة:</strong> ${dates.startDate} إلى ${dates.endDate}</p>
                    <p><strong>إجمالي المبيعات:</strong> ${Utils.formatCurrency(total)}</p>
                    <p><strong>عدد عمليات البيع:</strong> ${count}</p>
                    <p><strong>متوسط قيمة العملية:</strong> ${Utils.formatCurrency(average)}</p>
                    <p><strong>أعلى مبلغ بيع:</strong> ${Utils.formatCurrency(highest)}</p>
                </div>
                
                <div class="info-block">
                    <h5>المبيعات حسب اليوم</h5>
                    ${this.getSalesByDayDistribution(sales)}
                </div>
                
                <div class="info-block">
                    <h5>أكثر المنتجات مبيعاً</h5>
                    ${this.getTopSellingProducts(sales)}
                </div>
            `;
        } else if (format === 'detailed') {
            reportContent = `
                <h5>تفاصيل جميع عمليات البيع</h5>
                <div class="table-container">
                    <table class="detailed-table">
                        <thead>
                            <tr>
                                <th>التاريخ</th>
                                <th>المنتج</th>
                                <th>الكمية</th>
                                <th>السعر</th>
                                <th>الإجمالي</th>
                                <th>العميل</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sales.map(sale => `
                                <tr>
                                    <td>${sale.date}</td>
                                    <td>${sale.product}</td>
                                    <td>${sale.quantity}</td>
                                    <td>${Utils.formatCurrency(sale.price)}</td>
                                    <td>${Utils.formatCurrency(sale.total)}</td>
                                    <td>${sale.customer || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
        
        document.getElementById('reportContent').innerHTML = reportContent;
    }
    
    getSalesByDayDistribution(sales) {
        const distribution = {};
        
        sales.forEach(sale => {
            if (!distribution[sale.date]) {
                distribution[sale.date] = 0;
            }
            distribution[sale.date] += sale.total;
        });
        
        let html = '<ul>';
        Object.entries(distribution).sort().forEach(([date, amount]) => {
            html += `<li><strong>${date}:</strong> ${Utils.formatCurrency(amount)}</li>`;
        });
        html += '</ul>';
        
        return html;
    }
    
    getTopSellingProducts(sales) {
        const products = {};
        
        sales.forEach(sale => {
            if (!products[sale.product]) {
                products[sale.product] = { quantity: 0, amount: 0 };
            }
            products[sale.product].quantity += sale.quantity;
            products[sale.product].amount += sale.total;
        });
        
        // ترتيب حسب الكمية
        const sorted = Object.entries(products).sort((a, b) => b[1].quantity - a[1].quantity).slice(0, 5);
        
        let html = '<ol>';
        sorted.forEach(([product, data]) => {
            html += `
                <li>
                    <strong>${product}:</strong>
                    ${data.quantity} وحدة،
                    ${Utils.formatCurrency(data.amount)}
                </li>
            `;
        });
        html += '</ol>';
        
        return html;
    }
    
    // دوال التقارير الأخرى (مشتريات، مصروفات، أرباح، مخزون، شامل)
    // ... سيتم إكمالها في الملف التالي ...
}

// تصدير للاستخدام في الملفات الأخرى
window.ReportsManager = ReportsManager;