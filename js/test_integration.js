// اختبارات تكامل النظام
console.log('=== بدء اختبارات التكامل ===');

// اختبار 1: دورة البيع الكاملة
async function testCompleteSaleCycle() {
    console.log('اختبار دورة البيع الكاملة...');
    
    try {
        // 1. إضافة منتج للمخزون
        const testProduct = {
            id: 999,
            name: 'منتج اختبار التكامل',
            category: 'اختبار',
            quantity: 10,
            price: 100,
            cost: 60,
            barcode: '999999999999'
        };
        
        System.data.inventory.push(testProduct);
        System.saveInventory();
        console.log('✓ 1. تم إضافة المنتج للمخزون');
        
        // 2. بيع المنتج
        const testSale = {
            id: Utils.generateId(System.data.sales),
            date: Utils.getToday(),
            product: testProduct.name,
            quantity: 2,
            price: testProduct.price,
            total: 2 * testProduct.price,
            customer: 'عميل اختبار التكامل'
        };
        
        System.data.sales.push(testSale);
        System.saveSales();
        console.log('✓ 2. تم تسجيل البيع');
        
        // 3. تحديث المخزون
        const productInInventory = System.findProductByName(testProduct.name);
        if (productInInventory) {
            productInInventory.quantity -= testSale.quantity;
            System.saveInventory();
            console.log('✓ 3. تم تحديث المخزون');
        }
        
        // 4. التحقق من النتائج
        console.log('النتائج النهائية:');
        console.log('- المنتجات في المخزون:', System.data.inventory.length);
        console.log('- المبيعات:', System.data.sales.length);
        console.log('- كمية المنتج المتبقية:', productInInventory.quantity);
        
        return true;
    } catch (error) {
        console.error('✗ فشل اختبار التكامل:', error);
        return false;
    }
}

// اختبار 2: النسخ الاحتياطي والاستعادة
async function testBackupRestore() {
    console.log('اختبار النسخ الاحتياطي والاستعادة...');
    
    try {
        // 1. إنشاء نسخة احتياطية
        const backupData = {
            sales: System.data.sales,
            inventory: System.data.inventory,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('test_backup', JSON.stringify(backupData));
        console.log('✓ 1. تم إنشاء النسخ الاحتياطي');
        
        // 2. مسح البيانات الحالية
        const originalSales = [...System.data.sales];
        const originalInventory = [...System.data.inventory];
        
        System.data.sales = [];
        System.data.inventory = [];
        System.saveAllData();
        console.log('✓ 2. تم مسح البيانات');
        
        // 3. استعادة البيانات
        const backup = JSON.parse(localStorage.getItem('test_backup'));
        System.data.sales = backup.sales;
        System.data.inventory = backup.inventory;
        System.saveAllData();
        console.log('✓ 3. تم استعادة البيانات');
        
        // 4. التحقق
        console.log('- المبيعات المستعادة:', System.data.sales.length);
        console.log('- المنتجات المستعادة:', System.data.inventory.length);
        
        return true;
    } catch (error) {
        console.error('✗ فشل اختبار النسخ الاحتياطي:', error);
        return false;
    }
}

// تشغيل الاختبارات
async function runAllTests() {
    console.log('جاري تشغيل جميع اختبارات التكامل...\n');
    
    const results = [];
    
    results.push(await testCompleteSaleCycle());
    console.log('---');
    results.push(await testBackupRestore());
    
    console.log('\n=== ملخص النتائج ===');
    const passed = results.filter(r => r).length;
    const failed = results.filter(r => !r).length;
    
    console.log(`الاختبارات الناجحة: ${passed}/${results.length}`);
    console.log(`الاختبارات الفاشلة: ${failed}/${results.length}`);
    
    if (failed === 0) {
        console.log('🎉 جميع الاختبارات ناجحة!');
    } else {
        console.log('⚠️ بعض الاختبارات فشلت');
    }
}

// تشغيل الاختبارات
runAllTests();