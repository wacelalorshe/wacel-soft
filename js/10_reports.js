// ============================================================================
// نظام التقارير الشامل
// ============================================================================

// ----------------------------------------------------------------------------
// تهيئة نظام التقارير
// ----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function() {
    
    // --------------------------------------------------------------
    // تهيئة قسم التقارير
    // --------------------------------------------------------------
    تهيئة_التقارير();
    
    // --------------------------------------------------------------
    // أحداث تصنيفات التقارير
    // --------------------------------------------------------------
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // إزالة النشاط من جميع الألسنة
            document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
            
            // إضافة النشاط للسان الحالي
            this.classList.add('active');
            
            // تغيير نوع التقرير
            const category = this.getAttribute('data-category');
            تغيير_نوع_التقرير(category);
        });
    });
    
    // --------------------------------------------------------------
    // حدث تغيير الفترة الزمنية
    // --------------------------------------------------------------
    document.getElementById('reportPeriod').addEventListener('change', function() {
        const period = this.value;
        const customDates = document.getElementById('customDates');
        
        if (period === 'custom') {
            customDates.style.display = 'block';
        } else {
            customDates.style.display = 'none';
        }
    });
    
    // --------------------------------------------------------------
    // حدث توليد التقرير
    // --------------------------------------------------------------
    document.getElementById('generateReport').addEventListener('click', function() {
        توليد_تقرير();
    });
    
    // --------------------------------------------------------------
    // أحداث التصدير والطباعة
    // --------------------------------------------------------------
    document.getElementById('printReport').addEventListener('click', function() {
        طباعة_تقرير();
    });
    
    document.getElementById('exportPDF').addEventListener('click', function() {
        تصدير_PDF();
    });
    
    document.getElementById('exportExcel').addEventListener('click', function() {
        تصدير_Excel();
    });
    
});

// ----------------------------------------------------------------------------
// دالة تهيئة التقارير
// ----------------------------------------------------------------------------
function تهيئة_التقارير() {
    const today = new Date().toISOString().split('T')[0];
    
    // تعيين تواريخ الفترة المخصصة
    document.getElementById('startDate').value = today;
    document.getElementById('endDate').value = today;
    
    // ملء قائمة فئات المنتجات
    ملء_قائمة_الفئات();
    
    // إخفاء مرشح الفئة افتراضياً
    document.getElementById('categoryFilter').style.display = 'none';
}

// ----------------------------------------------------------------------------
// دالة تغيير نوع التقرير
// ----------------------------------------------------------------------------
function تغيير_نوع_التقرير(نوع) {
    const reportTitle = document.getElementById('reportTitle');
    const productFilter = document.getElementById('productFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    
    // تحديث عنوان التقرير
    const عناوين = {
        'sales': 'تقرير المبيعات',
        'purchases': 'تقرير المشتريات',
        'expenses': 'تقرير المصروفات',
        'profits': 'تقرير الأرباح',
        'inventory': 'تقرير المخازن',
        'summary': 'تقرير شامل'
    };
    
    reportTitle.textContent = عناوين[نوع] || 'تقرير';
    
    // إظهار/إخفاء المرشحات حسب نوع التقرير
    if (نوع === 'sales' || نوع === 'purchases' || نوع === 'inventory') {
        productFilter.style.display = 'block';
        if (نوع === 'inventory') {
            categoryFilter.style.display = 'block';
        } else {
            categoryFilter.style.display = 'none';
        }
    } else {
        productFilter.style.display = 'none';
        categoryFilter.style.display = 'none';
    }
}

// ----------------------------------------------------------------------------
// دالة توليد التقرير
// ----------------------------------------------------------------------------
function توليد_تقرير() {
    const نوع_التقرير = document.querySelector('.category-tab.active').getAttribute('data-category');
    const الفترة = document.getElementById('reportPeriod').value;
    const تنسيق = document.getElementById('reportFormat').value;
    const اسم_المنتج = document.getElementById('productName').value;
    const الفئة = document.getElementById('productCategory').value;
    
    // الحصول على التواريخ
    const تواريخ = الحصول_على_التواريخ(الفترة);
    
    // تحديث نص الفترة
    document.getElementById('reportPeriodText').textContent = `الفترة: ${الحصول_على_نص_الفترة(الفترة, تواريخ)}`;
    
    // توليد التقرير حسب النوع
    switch(نوع_التقرير) {
        case 'sales':
            تقرير_المبيعات(تواريخ, تنسيق, اسم_المنتج);
            break;
        case 'purchases':
            تقرير_المشتريات(تواريخ, تنسيق, اسم_المنتج);
            break;
        case 'expenses':
            تقرير_المصروفات(تواريخ, تنسيق);
            break;
        case 'profits':
            تقرير_الأرباح(تواريخ, تنسيق);
            break;
        case 'inventory':
            تقرير_المخازن(تنسيق, الفئة);
            break;
        case 'summary':
            تقرير_شامل(تواريخ, تنسيق);
            break;
    }
    
    // عرض الرسوم البيانية إذا كان التنسيق مناسب
    if (تنسيق === 'chart') {
        عرض_الرسوم_البيانية(نوع_التقرير, تواريخ);
    }
}

// ----------------------------------------------------------------------------
// دالة الحصول على التواريخ
// ----------------------------------------------------------------------------
function الحصول_على_التواريخ(الفترة) {
    const اليوم = new Date();
    let تاريخ_البداية, تاريخ_النهاية;
    
    switch(الفترة) {
        case 'daily':
            تاريخ_البداية = اليوم.toISOString().split('T')[0];
            تاريخ_النهاية = تاريخ_البداية;
            break;
            
        case 'weekly':
            تاريخ_النهاية = اليوم.toISOString().split('T')[0];
            const قبل_اسبوع = new Date(اليوم);
            قبل_اسبوع.setDate(اليوم.getDate() - 7);
            تاريخ_البداية = قبل_اسبوع.toISOString().split('T')[0];
            break;
            
        case 'monthly':
            تاريخ_النهاية = اليوم.toISOString().split('T')[0];
            const أول_الشهر = new Date(اليوم.getFullYear(), اليوم.getMonth(), 1);
            تاريخ_البداية = أول_الشهر.toISOString().split('T')[0];
            break;
            
        case 'yearly':
            تاريخ_النهاية = اليوم.toISOString().split('T')[0];
            const أول_السنة = new Date(اليوم.getFullYear(), 0, 1);
            تاريخ_البداية = أول_السنة.toISOString().split('T')[0];
            break;
            
        case 'custom':
            تاريخ_البداية = document.getElementById('startDate').value;
            تاريخ_النهاية = document.getElementById('endDate').value;
            break;
            
        default:
            تاريخ_البداية = اليوم.toISOString().split('T')[0];
            تاريخ_النهاية = تاريخ_البداية;
    }
    
    return { تاريخ_البداية, تاريخ_النهاية };
}

// ----------------------------------------------------------------------------
// دالة الحصول على نص الفترة
// ----------------------------------------------------------------------------
function الحصول_على_نص_الفترة(الفترة, تواريخ) {
    const نصوص_الفترة = {
        'daily': 'اليوم',
        'weekly': 'أسبوع',
        'monthly': 'شهر',
        'yearly': 'سنة',
        'custom': `${تواريخ.تاريخ_البداية} إلى ${تواريخ.تاريخ_النهاية}`
    };
    
    return نصوص_الفترة[الفترة] || 'فترة غير محددة';
}

// ----------------------------------------------------------------------------
// دالة تقرير المبيعات
// ----------------------------------------------------------------------------
function تقرير_المبيعات(تواريخ, تنسيق, اسم_المنتج) {
    const جميع_المبيعات = JSON.parse(localStorage.getItem('sales')) || [];
    
    // تصفية المبيعات حسب الفترة والمنتج
    let مبيعات_مصفاة = جميع_المبيعات.filter(بيع => {
        const ضمن_الفترة = بيع.date >= تواريخ.تاريخ_البداية && بيع.date <= تواريخ.تاريخ_النهاية;
        const مطابق_للمنتج = !اسم_المنتج || بيع.product.toLowerCase().includes(اسم_المنتج.toLowerCase());
        return ضمن_الفترة && مطابق_للمنتج;
    });
    
    // حساب الإحصائيات
    const إجمالي_المبيعات = مبيعات_مصفاة.reduce((مجموع, بيع) => مجموع + بيع.total, 0);
    const عدد_العمليات = مبيعات_مصفاة.length;
    const متوسط_القيمة = عدد_العمليات > 0 ? إجمالي_المبيعات / عدد_العمليات : 0;
    const أعلى_مبلغ = مبيعات_مصفاة.length > 0 ? Math.max(...مبيعات_مصفاة.map(ب => ب.total)) : 0;
    
    // تحديث الإحصائيات
    document.getElementById('reportTotalSales').textContent = إجمالي_المبيعات.toFixed(2) + ' ر.س';
    document.getElementById('reportTransactionsCount').textContent = عدد_العمليات;
    document.getElementById('reportAverageValue').textContent = متوسط_القيمة.toFixed(2) + ' ر.س';
    document.getElementById('reportHighestValue').textContent = أعلى_مبلغ.toFixed(2) + ' ر.س';
    
    // عرض تفاصيل التقرير
    let محتوى_التقرير = '';
    
    if (تنسيق === 'summary') {
        محتوى_التقرير = `
            <div class="info-block">
                <h5>ملخص تقرير المبيعات</h5>
                <p><strong>الفترة:</strong> ${تواريخ.تاريخ_البداية} إلى ${تواريخ.تاريخ_النهاية}</p>
                <p><strong>إجمالي المبيعات:</strong> ${إجمالي_المبيعات.toFixed(2)} ر.س</p>
                <p><strong>عدد عمليات البيع:</strong> ${عدد_العمليات}</p>
                <p><strong>متوسط قيمة العملية:</strong> ${متوسط_القيمة.toFixed(2)} ر.س</p>
                <p><strong>أعلى مبلغ بيع:</strong> ${أعلى_مبلغ.toFixed(2)} ر.س</p>
            </div>
            
            <div class="info-block">
                <h5>المبيعات حسب اليوم</h5>
                ${توزيع_المبيعات_حسب_اليوم(مبيعات_مصفاة)}
            </div>
            
            <div class="info-block">
                <h5>أكثر المنتجات مبيعاً</h5>
                ${أكثر_المنتجات_مبيعاً(مبيعات_مصفاة)}
            </div>
        `;
    } else if (تنسيق === 'detailed') {
        محتوى_التقرير = `
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
                        ${مبيعات_مصفاة.map(بيع => `
                            <tr>
                                <td>${بيع.date}</td>
                                <td>${بيع.product}</td>
                                <td>${بيع.quantity}</td>
                                <td>${بيع.price.toFixed(2)} ر.س</td>
                                <td>${بيع.total.toFixed(2)} ر.س</td>
                                <td>${بيع.customer || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    document.getElementById('reportContent').innerHTML = محتوى_التقرير;
    
    // تحديث جدول البيانات
    تحديث_جدول_البيانات(مبيعات_مصفاة.map(بيع => ({
        التاريخ: بيع.date,
        الوصف: `بيع ${بيع.product} - ${بيع.quantity} وحدة`,
        المبلغ: بيع.total,
        النوع: 'مبيعات'
    })));
}

// ----------------------------------------------------------------------------
// دالة تقرير المشتريات
// ----------------------------------------------------------------------------
function تقرير_المشتريات(تواريخ, تنسيق, اسم_المنتج) {
    const جميع_المشتريات = JSON.parse(localStorage.getItem('purchases')) || [];
    
    // تصفية المشتريات
    let مشتريات_مصفاة = جميع_المشتريات.filter(شراء => {
        const ضمن_الفترة = شراء.date >= تواريخ.تاريخ_البداية && شراء.date <= تواريخ.تاريخ_النهاية;
        const مطابق_للمنتج = !اسم_المنتج || شراء.product.toLowerCase().includes(اسم_المنتج.toLowerCase());
        return ضمن_الفترة && مطابق_للمنتج;
    });
    
    // حساب الإحصائيات
    const إجمالي_المشتريات = مشتريات_مصفاة.reduce((مجموع, شراء) => مجموع + شراء.total, 0);
    const عدد_العمليات = مشتريات_مصفاة.length;
    const متوسط_القيمة = عدد_العمليات > 0 ? إجمالي_المشتريات / عدد_العمليات : 0;
    const أعلى_مبلغ = مشتريات_مصفاة.length > 0 ? Math.max(...مشتريات_مصفاة.map(ش => ش.total)) : 0;
    
    // تحديث الإحصائيات
    document.getElementById('reportTotalSales').textContent = إجمالي_المشتريات.toFixed(2) + ' ر.س';
    document.getElementById('reportTransactionsCount').textContent = عدد_العمليات;
    document.getElementById('reportAverageValue').textContent = متوسط_القيمة.toFixed(2) + ' ر.س';
    document.getElementById('reportHighestValue').textContent = أعلى_مبلغ.toFixed(2) + ' ر.س';
    
    // عرض التقرير
    let محتوى_التقرير = `
        <div class="info-block">
            <h5>ملخص تقرير المشتريات</h5>
            <p><strong>الفترة:</strong> ${تواريخ.تاريخ_البداية} إلى ${تواريخ.تاريخ_النهاية}</p>
            <p><strong>إجمالي المشتريات:</strong> ${إجمالي_المشتريات.toFixed(2)} ر.س</p>
            <p><strong>عدد عمليات الشراء:</strong> ${عدد_العمليات}</p>
            <p><strong>متوسط قيمة العملية:</strong> ${متوسط_القيمة.toFixed(2)} ر.س</p>
            <p><strong>أعلى مبلغ شراء:</strong> ${أعلى_مبلغ.toFixed(2)} ر.س</p>
        </div>
        
        <div class="info-block">
            <h5>الموردون الرئيسيون</h5>
            ${الموردون_الرئيسيون(مشتريات_مصفاة)}
        </div>
    `;
    
    document.getElementById('reportContent').innerHTML = محتوى_التقرير;
    
    // تحديث جدول البيانات
    تحديث_جدول_البيانات(مشتريات_مصفاة.map(شراء => ({
        التاريخ: شراء.date,
        الوصف: `شراء ${شراء.product} - ${شراء.quantity} وحدة`,
        المبلغ: شراء.total,
        النوع: 'مشتريات'
    })));
}

// ----------------------------------------------------------------------------
// دالة تقرير المصروفات
// ----------------------------------------------------------------------------
function تقرير_المصروفات(تواريخ, تنسيق) {
    const جميع_المصروفات = JSON.parse(localStorage.getItem('expenses')) || [];
    
    // تصفية المصروفات
    let مصروفات_مصفاة = جميع_المصروفات.filter(مصروف => {
        return مصروف.date >= تواريخ.تاريخ_البداية && مصروف.date <= تواريخ.تاريخ_النهاية;
    });
    
    // حساب الإحصائيات
    const إجمالي_المصروفات = مصروفات_مصفاة.reduce((مجموع, مصروف) => مجموع + مصروف.amount, 0);
    const عدد_العمليات = مصروفات_مصفاة.length;
    const متوسط_القيمة = عدد_العمليات > 0 ? إجمالي_المصروفات / عدد_العمليات : 0;
    const أعلى_مبلغ = مصروفات_مصفاة.length > 0 ? Math.max(...مصروفات_مصفاة.map(م => م.amount)) : 0;
    
    // تحديث الإحصائيات
    document.getElementById('reportTotalSales').textContent = إجمالي_المصروفات.toFixed(2) + ' ر.س';
    document.getElementById('reportTransactionsCount').textContent = عدد_العمليات;
    document.getElementById('reportAverageValue').textContent = متوسط_القيمة.toFixed(2) + ' ر.س';
    document.getElementById('reportHighestValue').textContent = أعلى_مبلغ.toFixed(2) + ' ر.س';
    
    // توزيع المصروفات حسب النوع
    const توزيع_النوع = {};
    مصروفات_مصفاة.forEach(مصروف => {
        if (!توزيع_النوع[مصروف.type]) {
            توزيع_النوع[مصروف.type] = 0;
        }
        توزيع_النوع[مصروف.type] += مصروف.amount;
    });
    
    // عرض التقرير
    let محتوى_التقرير = `
        <div class="info-block">
            <h5>ملخص تقرير المصروفات</h5>
            <p><strong>الفترة:</strong> ${تواريخ.تاريخ_البداية} إلى ${تواريخ.تاريخ_النهاية}</p>
            <p><strong>إجمالي المصروفات:</strong> ${إجمالي_المصروفات.toFixed(2)} ر.س</p>
            <p><strong>عدد المصروفات:</strong> ${عدد_العمليات}</p>
            <p><strong>متوسط قيمة المصروف:</strong> ${متوسط_القيمة.toFixed(2)} ر.س</p>
        </div>
        
        <div class="info-block">
            <h5>توزيع المصروفات حسب النوع</h5>
            <ul>
                ${Object.entries(توزيع_النوع).map(([نوع, مبلغ]) => `
                    <li><strong>${نوع}:</strong> ${مبلغ.toFixed(2)} ر.س (${((مبلغ / إجمالي_المصروفات) * 100).toFixed(1)}%)</li>
                `).join('')}
            </ul>
        </div>
    `;
    
    document.getElementById('reportContent').innerHTML = محتوى_التقرير;
    
    // تحديث جدول البيانات
    تحديث_جدول_البيانات(مصروفات_مصفاة.map(مصروف => ({
        التاريخ: مصروف.date,
        الوصف: `${مصروف.type}: ${مصروف.description}`,
        المبلغ: مصروف.amount,
        النوع: 'مصروفات'
    })));
}

// ----------------------------------------------------------------------------
// دالة تقرير الأرباح
// ----------------------------------------------------------------------------
function تقرير_الأرباح(تواريخ, تنسيق) {
    const جميع_المبيعات = JSON.parse(localStorage.getItem('sales')) || [];
    const جميع_المشتريات = JSON.parse(localStorage.getItem('purchases')) || [];
    const جميع_المصروفات = JSON.parse(localStorage.getItem('expenses')) || [];
    
    // تصفية البيانات حسب الفترة
    const مبيعات_مصفاة = جميع_المبيعات.filter(ب => ب.date >= تواريخ.تاريخ_البداية && ب.date <= تواريخ.تاريخ_النهاية);
    const مشتريات_مصفاة = جميع_المشتريات.filter(ش => ش.date >= تواريخ.تاريخ_البداية && ش.date <= تواريخ.تاريخ_النهاية);
    const مصروفات_مصفاة = جميع_المصروفات.filter(م => م.date >= تواريخ.تاريخ_البداية && م.date <= تواريخ.تاريخ_النهاية);
    
    // حساب الإجماليات
    const إجمالي_المبيعات = مبيعات_مصفاة.reduce((مجموع, بيع) => مجموع + بيع.total, 0);
    const إجمالي_المشتريات = مشتريات_مصفاة.reduce((مجموع, شراء) => مجموع + شراء.total, 0);
    const إجمالي_المصروفات = مصروفات_مصفاة.reduce((مجموع, مصروف) => مجموع + مصروف.amount, 0);
    const صافي_الربح = إجمالي_المبيعات - إجمالي_المشتريات - إجمالي_المصروفات;
    const نسبة_الربح = إجمالي_المبيعات > 0 ? (صافي_الربح / إجمالي_المبيعات) * 100 : 0;
    
    // تحديث الإحصائيات
    document.getElementById('reportTotalSales').textContent = صافي_الربح.toFixed(2) + ' ر.س';
    document.getElementById('reportTransactionsCount').textContent = مبيعات_مصفاة.length + مشتريات_مصفاة.length + مصروفات_مصفاة.length;
    document.getElementById('reportAverageValue').textContent = نسبة_الربح.toFixed(2) + '%';
    document.getElementById('reportHighestValue').textContent = إجمالي_المبيعات.toFixed(2) + ' ر.س';
    
    // عرض التقرير
    let محتوى_التقرير = `
        <div class="info-block">
            <h5>تحليل الربحية</h5>
            <p><strong>الفترة:</strong> ${تواريخ.تاريخ_البداية} إلى ${تواريخ.تاريخ_النهاية}</p>
            <p><strong>إجمالي الإيرادات (المبيعات):</strong> ${إجمالي_المبيعات.toFixed(2)} ر.س</p>
            <p><strong>إجمالي التكاليف (المشتريات):</strong> ${إجمالي_المشتريات.toFixed(2)} ر.س</p>
            <p><strong>إجمالي المصروفات:</strong> ${إجمالي_المصروفات.toFixed(2)} ر.س</p>
            <p><strong>صافي الربح:</strong> <span style="color: ${صافي_الربح >= 0 ? 'var(--success-color)' : 'var(--danger-color)'}">
                ${صافي_الربح.toFixed(2)} ر.س
            </span></p>
            <p><strong>نسبة الربح:</strong> <span style="color: ${نسبة_الربح >= 0 ? 'var(--success-color)' : 'var(--danger-color)'}">
                ${نسبة_الربح.toFixed(2)}%
            </span></p>
        </div>
        
        <div class="info-block">
            <h5>تحليل التكاليف</h5>
            <div class="chart-mini" style="background: linear-gradient(90deg, 
                var(--success-color) ${(إجمالي_المبيعات > 0 ? (صافي_الربح / إجمالي_المبيعات) * 100 : 0)}%, 
                var(--warning-color) ${(إجمالي_المبيعات > 0 ? (إجمالي_المشتريات / إجمالي_المبيعات) * 100 : 0)}%, 
                var(--danger-color) ${(إجمالي_المبيعات > 0 ? (إجمالي_المصروفات / إجمالي_المبيعات) * 100 : 0)}%)">
            </div>
            <p>الربح: ${(إجمالي_المبيعات > 0 ? (صافي_الربح / إجمالي_المبيعات) * 100 : 0).toFixed(1)}%</p>
            <p>المشتريات: ${(إجمالي_المبيعات > 0 ? (إجمالي_المشتريات / إجمالي_المبيعات) * 100 : 0).toFixed(1)}%</p>
            <p>المصروفات: ${(إجمالي_المبيعات > 0 ? (إجمالي_المصروفات / إجمالي_المبيعات) * 100 : 0).toFixed(1)}%</p>
        </div>
    `;
    
    document.getElementById('reportContent').innerHTML = محتوى_التقرير;
}

// ----------------------------------------------------------------------------
// دالة تقرير المخازن
// ----------------------------------------------------------------------------
function تقرير_المخازن(تنسيق, الفئة) {
    const جميع_المخزون = JSON.parse(localStorage.getItem('inventory')) || [];
    
    // تصفية المخزون حسب الفئة
    let مخزون_مصفى = جميع_المخزون;
    if (الفئة) {
        مخزون_مصفى = جميع_المخزون.filter(منتج => منتج.category === الفئة);
    }
    
    // حساب الإحصائيات
    const عدد_المنتجات = مخزون_مصفى.length;
    const إجمالي_الكمية = مخزون_مصفى.reduce((مجموع, منتج) => مجموع + منتج.quantity, 0);
    const القيمة_الإجمالية = مخزون_مصفى.reduce((مجموع, منتج) => مجموع + (منتج.quantity * (منتج.cost || 0)), 0);
    const أعلى_كمية = مخزون_مصفى.length > 0 ? Math.max(...مخزون_مصفى.map(م => م.quantity)) : 0;
    
    // تحديث الإحصائيات
    document.getElementById('reportTotalSales').textContent = القيمة_الإجمالية.toFixed(2) + ' ر.س';
    document.getElementById('reportTransactionsCount').textContent = عدد_المنتجات;
    document.getElementById('reportAverageValue').textContent = إجمالي_الكمية;
    document.getElementById('reportHighestValue').textContent = أعلى_كمية;
    
    // توزيع المخزون حسب الفئة
    const توزيع_الفئة = {};
    جميع_المخزون.forEach(منتج => {
        if (!توزيع_الفئة[منتج.category]) {
            توزيع_الفئة[منتج.category] = { عدد: 0, كمية: 0, قيمة: 0 };
        }
        توزيع_الفئة[منتج.category].عدد += 1;
        توزيع_الفئة[منتج.category].كمية += منتج.quantity;
        توزيع_الفئة[منتج.category].قيمة += منتج.quantity * (منتج.cost || 0);
    });
    
    // عرض التقرير
    let محتوى_التقرير = `
        <div class="info-block">
            <h5>ملخص تقرير المخزون</h5>
            <p><strong>عدد أنواع المنتجات:</strong> ${عدد_المنتجات}</p>
            <p><strong>إجمالي الكمية في المخزون:</strong> ${إجمالي_الكمية} وحدة</p>
            <p><strong>القيمة الإجمالية للمخزون:</strong> ${القيمة_الإجمالية.toFixed(2)} ر.س</p>
            <p><strong>متوسط الكمية لكل منتج:</strong> ${(عدد_المنتجات > 0 ? إجمالي_الكمية / عدد_المنتجات : 0).toFixed(1)} وحدة</p>
        </div>
        
        <div class="info-block">
            <h5>توزيع المخزون حسب الفئة</h5>
            <ul>
                ${Object.entries(توزيع_الفئة).map(([فئة, بيانات]) => `
                    <li>
                        <strong>${فئة}:</strong> 
                        ${بيانات.عدد} منتج، 
                        ${بيانات.كمية} وحدة، 
                        قيمة: ${بيانات.قيمة.toFixed(2)} ر.س
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
    
    document.getElementById('reportContent').innerHTML = محتوى_التقرير;
    
    // تحديث جدول البيانات
    تحديث_جدول_البيانات(مخزون_مصفى.map(منتج => ({
        التاريخ: '-',
        الوصف: `${منتج.name} (${منتج.category}) - ${منتج.quantity} وحدة`,
        المبلغ: منتج.quantity * (منتج.cost || 0),
        النوع: 'مخزون'
    })));
}

// ----------------------------------------------------------------------------
// دالة تقرير شامل
// ----------------------------------------------------------------------------
function تقرير_شامل(تواريخ, تنسيق) {
    const جميع_المبيعات = JSON.parse(localStorage.getItem('sales')) || [];
    const جميع_المشتريات = JSON.parse(localStorage.getItem('purchases')) || [];
    const جميع_المصروفات = JSON.parse(localStorage.getItem('expenses')) || [];
    const جميع_المخزون = JSON.parse(localStorage.getItem('inventory')) || [];
    
    // تصفية البيانات حسب الفترة
    const مبيعات_مصفاة = جميع_المبيعات.filter(ب => ب.date >= تواريخ.تاريخ_البداية && ب.date <= تواريخ.تاريخ_النهاية);
    const مشتريات_مصفاة = جميع_المشتريات.filter(ش => ش.date >= تواريخ.تاريخ_البداية && ش.date <= تواريخ.تاريخ_النهاية);
    const مصروفات_مصفاة = جميع_المصروفات.filter(م => م.date >= تواريخ.تاريخ_البداية && م.date <= تواريخ.تاريخ_النهاية);
    
    // حساب الإجماليات
    const إجمالي_المبيعات = مبيعات_مصفاة.reduce((مجموع, بيع) => مجموع + بيع.total, 0);
    const إجمالي_المشتريات = مشتريات_مصفاة.reduce((مجموع, شراء) => مجموع + شراء.total, 0);
    const إجمالي_المصروفات = مصروفات_مصفاة.reduce((مجموع, مصروف) => مجموع + مصروف.amount, 0);
    const صافي_الربح = إجمالي_المبيعات - إجمالي_المشتريات - إجمالي_المصروفات;
    
    // إحصائيات المخزون
    const قيمة_المخزون = جميع_المخزون.reduce((مجموع, منتج) => مجموع + (منتج.quantity * (منتج.cost || 0)), 0);
    
    // تحديث الإحصائيات
    document.getElementById('reportTotalSales').textContent = إجمالي_المبيعات.toFixed(2) + ' ر.س';
    document.getElementById('reportTransactionsCount').textContent = مبيعات_مصفاة.length + مشتريات_مصفاة.length + مصروفات_مصفاة.length;
    document.getElementById('reportAverageValue').textContent = صافي_الربح.toFixed(2) + ' ر.س';
    document.getElementById('reportHighestValue').textContent = قيمة_المخزون.toFixed(2) + ' ر.س';
    
    // عرض التقرير
    let محتوى_التقرير = `
        <div class="info-block">
            <h5>التقرير المالي الشامل</h5>
            <p><strong>الفترة:</strong> ${تواريخ.تاريخ_البداية} إلى ${تواريخ.تاريخ_النهاية}</p>
            
            <h6>الإيرادات والمبيعات:</h6>
            <p>• إجمالي المبيعات: ${إجمالي_المبيعات.toFixed(2)} ر.س</p>
            <p>• عدد عمليات البيع: ${مبيعات_مصفاة.length}</p>
            <p>• متوسط قيمة البيع: ${(مبيعات_مصفاة.length > 0 ? إجمالي_المبيعات / مبيعات_مصفاة.length : 0).toFixed(2)} ر.س</p>
            
            <h6>التكاليف والمشتريات:</h6>
            <p>• إجمالي المشتريات: ${إجمالي_المشتريات.toFixed(2)} ر.س</p>
            <p>• عدد عمليات الشراء: ${مشتريات_مصفاة.length}</p>
            
            <h6>المصروفات:</h6>
            <p>• إجمالي المصروفات: ${إجمالي_المصروفات.toFixed(2)} ر.س</p>
            <p>• عدد المصروفات: ${مصروفات_مصفاة.length}</p>
            
            <h6>النتيجة النهائية:</h6>
            <p style="font-size: 1.2em; color: ${صافي_الربح >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">
                <strong>صافي الربح: ${صافي_الربح.toFixed(2)} ر.س</strong>
            </p>
            
            <h6>المخزون:</h6>
            <p>• عدد المنتجات في المخزون: ${جميع_المخزون.length}</p>
            <p>• القيمة الإجمالية للمخزون: ${قيمة_المخزون.toFixed(2)} ر.س</p>
        </div>
    `;
    
    document.getElementById('reportContent').innerHTML = محتوى_التقرير;
}

// ----------------------------------------------------------------------------
// دوال مساعدة للتقارير
// ----------------------------------------------------------------------------

// دالة تحديث جدول البيانات
function تحديث_جدول_البيانات(البيانات) {
    const جدول_الجسم = document.getElementById('reportTableBody');
    
    if (البيانات.length === 0) {
        جدول_الجسم.innerHTML = '<tr><td colspan="4">لا توجد بيانات لعرضها</td></tr>';
        return;
    }
    
    let html = '';
    البيانات.forEach(بيان => {
        html += `
            <tr>
                <td>${بيان.التاريخ}</td>
                <td>${بيان.الوصف}</td>
                <td>${بيان.المبلغ.toFixed(2)} ر.س</td>
                <td>${بيان.النوع}</td>
            </tr>
        `;
    });
    
    جدول_الجسم.innerHTML = html;
}

// دالة توزيع المبيعات حسب اليوم
function توزيع_المبيعات_حسب_اليوم(المبيعات) {
    const توزيع = {};
    
    المبيعات.forEach(بيع => {
        if (!توزيع[بيع.date]) {
            توزيع[بيع.date] = 0;
        }
        توزيع[بيع.date] += بيع.total;
    });
    
    let html = '<ul>';
    Object.entries(توزيع).sort().forEach(([تاريخ, مبلغ]) => {
        html += `<li><strong>${تاريخ}:</strong> ${مبلغ.toFixed(2)} ر.س</li>`;
    });
    html += '</ul>';
    
    return html;
}

// دالة أكثر المنتجات مبيعاً
function أكثر_المنتجات_مبيعاً(المبيعات) {
    const المنتجات = {};
    
    المبيعات.forEach(بيع => {
        if (!المنتجات[بيع.product]) {
            المنتجات[بيع.product] = { كمية: 0, مبلغ: 0 };
        }
        المنتجات[بيع.product].كمية += بيع.quantity;
        المنتجات[بيع.product].مبلغ += بيع.total;
    });
    
    // ترتيب حسب الكمية
    const مرتبة = Object.entries(المنتجات).sort((أ, ب) => ب[1].كمية - أ[1].كمية).slice(0, 5);
    
    let html = '<ol>';
    مرتبة.forEach(([منتج, بيانات]) => {
        html += `
            <li>
                <strong>${منتج}:</strong>
                ${بيانات.كمية} وحدة،
                ${بيانات.مبلغ.toFixed(2)} ر.س
            </li>
        `;
    });
    html += '</ol>';
    
    return html;
}

// دالة الموردون الرئيسيون
function الموردون_الرئيسيون(المشتريات) {
    const الموردون = {};
    
    المشتريات.forEach(شراء => {
        const المورد = شراء.supplier || 'غير محدد';
        if (!الموردون[المورد]) {
            الموردون[المورد] = 0;
        }
        الموردون[المورد] += شراء.total;
    });
    
    // ترتيب حسب المبلغ
    const مرتبة = Object.entries(الموردون).sort((أ, ب) => ب[1] - أ[1]).slice(0, 5);
    
    let html = '<ol>';
    مرتبة.forEach(([مورد, مبلغ]) => {
        html += `<li><strong>${مورد}:</strong> ${مبلغ.toFixed(2)} ر.س</li>`;
    });
    html += '</ol>';
    
    return html;
}

// دالة ملء قائمة الفئات
function ملء_قائمة_الفئات() {
    const جميع_المخزون = JSON.parse(localStorage.getItem('inventory')) || [];
    const قائمة_الفئات = document.getElementById('productCategory');
    
    // جمع الفئات الفريدة
    const فئات = [...new Set(جميع_المخزون.map(منتج => منتج.category))];
    
    // إضافة الخيارات
    فئات.forEach(فئة => {
        const خيار = document.createElement('option');
        خيار.value = فئة;
        خيار.textContent = فئة;
        قائمة_الفئات.appendChild(خيار);
    });
}

// دالة عرض الرسوم البيانية
function عرض_الرسوم_البيانية(نوع_التقرير, تواريخ) {
    const salesChart = document.getElementById('salesChart');
    const comparisonChart = document.getElementById('comparisonChart');
    
    // عرض رسومات تجميلية (بدلاً من رسوم بيانية حقيقية)
    salesChart.innerHTML = `
        <div class="chart-mini" style="background: linear-gradient(90deg, 
            var(--success-color) 40%, 
            var(--warning-color) 25%, 
            var(--secondary-color) 20%, 
            var(--primary-color) 15%)">
        </div>
        <p style="text-align: center; margin-top: 10px;">رسم بياني توضيحي</p>
    `;
    
    comparisonChart.innerHTML = `
        <div class="chart-mini" style="background: linear-gradient(90deg, 
            #3498db 30%, #2ecc71 25%, #e74c3c 20%, #f39c12 15%, #9b59b6 10%)">
        </div>
        <p style="text-align: center; margin-top: 10px;">مقارنة شهور السنة</p>
    `;
}

// ----------------------------------------------------------------------------
// دوال التصدير والطباعة
// ----------------------------------------------------------------------------

// دالة طباعة التقرير
function طباعة_تقرير() {
    window.print();
}

// دالة تصدير PDF
function تصدير_PDF() {
    alert('سيتم تطوير ميزة تصدير PDF في النسخة القادمة');
}

// دالة تصدير Excel
function تصدير_Excel() {
    alert('سيتم تطوير ميزة تصدير Excel في النسخة القادمة');
}