// ============================================================================
// نظام التقارير المتقدم (تكملة)
// ============================================================================

// استمرار فئة ReportsManager
Object.assign(ReportsManager.prototype, {
    generatePurchasesReport(dates, format, productName) {
        // تصفية المشتريات
        let filteredPurchases = System.data.purchases.filter(purchase => {
            const withinPeriod = purchase.date >= dates.startDate && purchase.date <= dates.endDate;
            const matchesProduct = !productName || purchase.product.toLowerCase().includes(productName.toLowerCase());
            return withinPeriod && matchesProduct;
        });
        
        // حساب الإحصائيات
        const totalPurchases = Utils.calculateTotal(filteredPurchases, 'total');
        const transactionCount = filteredPurchases.length;
        const averageValue = transactionCount > 0 ? totalPurchases / transactionCount : 0;
        const highestValue = filteredPurchases.length > 0 ? Math.max(...filteredPurchases.map(p => p.total)) : 0;
        
        // تحديث الإحصائيات
        this.updateReportStatistics(totalPurchases, transactionCount, averageValue, highestValue);
        
        // عرض التقرير
        let reportContent = `
            <div class="info-block">
                <h5>ملخص تقرير المشتريات</h5>
                <p><strong>الفترة:</strong> ${dates.startDate} إلى ${dates.endDate}</p>
                <p><strong>إجمالي المشتريات:</strong> ${Utils.formatCurrency(totalPurchases)}</p>
                <p><strong>عدد عمليات الشراء:</strong> ${transactionCount}</p>
                <p><strong>متوسط قيمة العملية:</strong> ${Utils.formatCurrency(averageValue)}</p>
                <p><strong>أعلى مبلغ شراء:</strong> ${Utils.formatCurrency(highestValue)}</p>
            </div>
            
            <div class="info-block">
                <h5>الموردون الرئيسيون</h5>
                ${this.getTopSuppliers(filteredPurchases)}
            </div>
        `;
        
        document.getElementById('reportContent').innerHTML = reportContent;
    },
    
    getTopSuppliers(purchases) {
        const suppliers = {};
        
        purchases.forEach(purchase => {
            const supplier = purchase.supplier || 'غير محدد';
            if (!suppliers[supplier]) {
                suppliers[supplier] = 0;
            }
            suppliers[supplier] += purchase.total;
        });
        
        // ترتيب حسب المبلغ
        const sorted = Object.entries(suppliers).sort((a, b) => b[1] - a[1]).slice(0, 5);
        
        let html = '<ol>';
        sorted.forEach(([supplier, amount]) => {
            html += `<li><strong>${supplier}:</strong> ${Utils.formatCurrency(amount)}</li>`;
        });
        html += '</ol>';
        
        return html;
    },
    
    generateExpensesReport(dates, format) {
        // تصفية المصروفات
        let filteredExpenses = System.data.expenses.filter(expense => {
            return expense.date >= dates.startDate && expense.date <= dates.endDate;
        });
        
        // حساب الإحصائيات
        const totalExpenses = Utils.calculateTotal(filteredExpenses, 'amount');
        const transactionCount = filteredExpenses.length;
        const averageValue = transactionCount > 0 ? totalExpenses / transactionCount : 0;
        const highestValue = filteredExpenses.length > 0 ? Math.max(...filteredExpenses.map(e => e.amount)) : 0;
        
        // تحديث الإحصائيات
        this.updateReportStatistics(totalExpenses, transactionCount, averageValue, highestValue);
        
        // توزيع المصروفات حسب النوع
        const typeDistribution = {};
        filteredExpenses.forEach(expense => {
            if (!typeDistribution[expense.type]) {
                typeDistribution[expense.type] = 0;
            }
            typeDistribution[expense.type] += expense.amount;
        });
        
        // عرض التقرير
        let reportContent = `
            <div class="info-block">
                <h5>ملخص تقرير المصروفات</h5>
                <p><strong>الفترة:</strong> ${dates.startDate} إلى ${dates.endDate}</p>
                <p><strong>إجمالي المصروفات:</strong> ${Utils.formatCurrency(totalExpenses)}</p>
                <p><strong>عدد المصروفات:</strong> ${transactionCount}</p>
                <p><strong>متوسط قيمة المصروف:</strong> ${Utils.formatCurrency(averageValue)}</p>
            </div>
            
            <div class="info-block">
                <h5>توزيع المصروفات حسب النوع</h5>
                <ul>
                    ${Object.entries(typeDistribution).map(([type, amount]) => `
                        <li><strong>${type}:</strong> ${Utils.formatCurrency(amount)} (${((amount / totalExpenses) * 100).toFixed(1)}%)</li>
                    `).join('')}
                </ul>
            </div>
        `;
        
        document.getElementById('reportContent').innerHTML = reportContent;
    },
    
    generateProfitsReport(dates, format) {
        // تصفية البيانات حسب الفترة
        const filteredSales = System.data.sales.filter(s => s.date >= dates.startDate && s.date <= dates.endDate);
        const filteredPurchases = System.data.purchases.filter(p => p.date >= dates.startDate && p.date <= dates.endDate);
        const filteredExpenses = System.data.expenses.filter(e => e.date >= dates.startDate && e.date <= dates.endDate);
        
        // حساب الإجماليات
        const totalSales = Utils.calculateTotal(filteredSales, 'total');
        const totalPurchases = Utils.calculateTotal(filteredPurchases, 'total');
        const totalExpenses = Utils.calculateTotal(filteredExpenses, 'amount');
        const netProfit = totalSales - totalPurchases - totalExpenses;
        const profitPercentage = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;
        
        // تحديث الإحصائيات
        this.updateReportStatistics(netProfit, 
            filteredSales.length + filteredPurchases.length + filteredExpenses.length, 
            profitPercentage, 
            totalSales);
        
        // عرض التقرير
        let reportContent = `
            <div class="info-block">
                <h5>تحليل الربحية</h5>
                <p><strong>الفترة:</strong> ${dates.startDate} إلى ${dates.endDate}</p>
                <p><strong>إجمالي الإيرادات (المبيعات):</strong> ${Utils.formatCurrency(totalSales)}</p>
                <p><strong>إجمالي التكاليف (المشتريات):</strong> ${Utils.formatCurrency(totalPurchases)}</p>
                <p><strong>إجمالي المصروفات:</strong> ${Utils.formatCurrency(totalExpenses)}</p>
                <p><strong>صافي الربح:</strong> <span style="color: ${netProfit >= 0 ? '#28a745' : '#dc3545'}">
                    ${Utils.formatCurrency(netProfit)}
                </span></p>
                <p><strong>نسبة الربح:</strong> <span style="color: ${profitPercentage >= 0 ? '#28a745' : '#dc3545'}">
                    ${profitPercentage.toFixed(2)}%
                </span></p>
            </div>
            
            <div class="info-block">
                <h5>تحليل التكاليف</h5>
                <div class="chart-mini" style="background: linear-gradient(90deg, 
                    #28a745 ${(totalSales > 0 ? (netProfit / totalSales) * 100 : 0)}%, 
                    #ffc107 ${(totalSales > 0 ? (totalPurchases / totalSales) * 100 : 0)}%, 
                    #dc3545 ${(totalSales > 0 ? (totalExpenses / totalSales) * 100 : 0)}%)">
                </div>
                <p>الربح: ${(totalSales > 0 ? (netProfit / totalSales) * 100 : 0).toFixed(1)}%</p>
                <p>المشتريات: ${(totalSales > 0 ? (totalPurchases / totalSales) * 100 : 0).toFixed(1)}%</p>
                <p>المصروفات: ${(totalSales > 0 ? (totalExpenses / totalSales) * 100 : 0).toFixed(1)}%</p>
            </div>
        `;
        
        document.getElementById('reportContent').innerHTML = reportContent;
    },
    
    generateInventoryReport(format, category) {
        // تصفية المخزون حسب الفئة
        let filteredInventory = System.data.inventory;
        if (category) {
            filteredInventory = System.data.inventory.filter(item => item.category === category);
        }
        
        // حساب الإحصائيات
        const productCount = filteredInventory.length;
        const totalQuantity = filteredInventory.reduce((sum, item) => sum + item.quantity, 0);
        const totalValue = filteredInventory.reduce((sum, item) => sum + (item.quantity * (item.cost || 0)), 0);
        const highestQuantity = filteredInventory.length > 0 ? Math.max(...filteredInventory.map(m => m.quantity)) : 0;
        
        // تحديث الإحصائيات
        this.updateReportStatistics(totalValue, productCount, totalQuantity, highestQuantity);
        
        // توزيع المخزون حسب الفئة
        const categoryDistribution = {};
        System.data.inventory.forEach(item => {
            if (!categoryDistribution[item.category]) {
                categoryDistribution[item.category] = { count: 0, quantity: 0, value: 0 };
            }
            categoryDistribution[item.category].count += 1;
            categoryDistribution[item.category].quantity += item.quantity;
            categoryDistribution[item.category].value += item.quantity * (item.cost || 0);
        });
        
        // عرض التقرير
        let reportContent = `
            <div class="info-block">
                <h5>ملخص تقرير المخزون</h5>
                <p><strong>عدد أنواع المنتجات:</strong> ${productCount}</p>
                <p><strong>إجمالي الكمية في المخزون:</strong> ${totalQuantity} وحدة</p>
                <p><strong>القيمة الإجمالية للمخزون:</strong> ${Utils.formatCurrency(totalValue)}</p>
                <p><strong>متوسط الكمية لكل منتج:</strong> ${(productCount > 0 ? totalQuantity / productCount : 0).toFixed(1)} وحدة</p>
            </div>
            
            <div class="info-block">
                <h5>توزيع المخزون حسب الفئة</h5>
                <ul>
                    ${Object.entries(categoryDistribution).map(([category, data]) => `
                        <li>
                            <strong>${category}:</strong> 
                            ${data.count} منتج، 
                            ${data.quantity} وحدة، 
                            قيمة: ${Utils.formatCurrency(data.value)}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
        
        document.getElementById('reportContent').innerHTML = reportContent;
    },
    
    generateSummaryReport(dates, format) {
        // تصفية البيانات حسب الفترة
        const filteredSales = System.data.sales.filter(s => s.date >= dates.startDate && s.date <= dates.endDate);
        const filteredPurchases = System.data.purchases.filter(p => p.date >= dates.startDate && p.date <= dates.endDate);
        const filteredExpenses = System.data.expenses.filter(e => e.date >= dates.startDate && e.date <= dates.endDate);
        
        // حساب الإجماليات
        const totalSales = Utils.calculateTotal(filteredSales, 'total');
        const totalPurchases = Utils.calculateTotal(filteredPurchases, 'total');
        const totalExpenses = Utils.calculateTotal(filteredExpenses, 'amount');
        const netProfit = totalSales - totalPurchases - totalExpenses;
        
        // إحصائيات المخزون
        const inventoryValue = System.data.inventory.reduce((sum, item) => sum + (item.quantity * (item.cost || 0)), 0);
        
        // تحديث الإحصائيات
        this.updateReportStatistics(totalSales, 
            filteredSales.length + filteredPurchases.length + filteredExpenses.length, 
            netProfit, 
            inventoryValue);
        
        // عرض التقرير
        let reportContent = `
            <div class="info-block">
                <h5>التقرير المالي الشامل</h5>
                <p><strong>الفترة:</strong> ${dates.startDate} إلى ${dates.endDate}</p>
                
                <h6>الإيرادات والمبيعات:</h6>
                <p>• إجمالي المبيعات: ${Utils.formatCurrency(totalSales)}</p>
                <p>• عدد عمليات البيع: ${filteredSales.length}</p>
                <p>• متوسط قيمة البيع: ${(filteredSales.length > 0 ? totalSales / filteredSales.length : 0).toFixed(2)} ر.س</p>
                
                <h6>التكاليف والمشتريات:</h6>
                <p>• إجمالي المشتريات: ${Utils.formatCurrency(totalPurchases)}</p>
                <p>• عدد عمليات الشراء: ${filteredPurchases.length}</p>
                
                <h6>المصروفات:</h6>
                <p>• إجمالي المصروفات: ${Utils.formatCurrency(totalExpenses)}</p>
                <p>• عدد المصروفات: ${filteredExpenses.length}</p>
                
                <h6>النتيجة النهائية:</h6>
                <p style="font-size: 1.2em; color: ${netProfit >= 0 ? '#28a745' : '#dc3545'};">
                    <strong>صافي الربح: ${Utils.formatCurrency(netProfit)}</strong>
                </p>
                
                <h6>المخزون:</h6>
                <p>• عدد المنتجات في المخزون: ${System.data.inventory.length}</p>
                <p>• القيمة الإجمالية للمخزون: ${Utils.formatCurrency(inventoryValue)}</p>
            </div>
        `;
        
        document.getElementById('reportContent').innerHTML = reportContent;
    }
});