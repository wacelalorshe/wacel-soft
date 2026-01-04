// اختبارات المبيعات
console.log('=== بدء اختبارات المبيعات ===');

// اختبار 1: إضافة بيع
try {
    const testSale = {
        date: '2024-01-01',
        product: 'منتج اختبار',
        quantity: 2,
        price: 50,
        total: 100,
        customer: 'عميل اختبار'
    };
    
    // إضافة البيع
    System.data.sales.push(testSale);
    System.saveSales();
    
    console.log('✓ تم إضافة بيع اختبار');
} catch (error) {
    console.error('✗ فشل إضافة البيع:', error);
}

// اختبار 2: البحث في المبيعات
try {
    const searchTerm = 'اختبار';
    const results = System.data.sales.filter(sale => 
        sale.product.includes(searchTerm) || 
        sale.customer.includes(searchTerm)
    );
    
    console.log(`✓ تم البحث في المبيعات، النتائج: ${results.length}`);
} catch (error) {
    console.error('✗ فشل البحث في المبيعات:', error);
}

// اختبار 3: حساب الإجمالي
try {
    const total = Utils.calculateTotal(System.data.sales, 'total');
    console.log('✓ تم حساب إجمالي المبيعات:', total);
} catch (error) {
    console.error('✗ فشل حساب الإجمالي:', error);
}

console.log('=== انتهاء اختبارات المبيعات ===');