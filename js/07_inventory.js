// ============================================================================
// إدارة المخزون
// ============================================================================

class InventoryManager {
    constructor() {
        this.modalId = 'inventoryModal';
        this.tableId = 'inventoryTableBody';
        this.searchId = 'بحث_المخزون';
        this.barcodeSearchId = 'searchBarcode';
        this.isSaving = false; // لمنع الحفظ المتعدد
    }
    
    init() {
        this.bindEvents();
        this.displayInventory();
        this.initSearch();
        this.initCategories();
        this.initBarcodeSearch();
        this.setupBarcodeFields();
    }
    
    bindEvents() {
        // فتح نافذة إضافة منتج
        document.getElementById('addInventoryBtn')?.addEventListener('click', () => {
            this.openAddModal();
        });
        
        // حفظ المنتج - إصلاح: مستمع واحد فقط
        const saveBtn = document.getElementById('saveInventory');
        if (saveBtn) {
            // إزالة المستمعات القديمة
            saveBtn.replaceWith(saveBtn.cloneNode(true));
            const newSaveBtn = document.getElementById('saveInventory');
            
            newSaveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.saveInventoryItem();
            });
        }
        
        // إلغاء
        const cancelBtn = document.getElementById('cancelInventory');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                ModalManager.close(this.modalId);
                this.resetForm();
            });
        }
        
        // استيراد المنتجات
        document.getElementById('importProductsBtn')?.addEventListener('click', () => {
            if (window.productImportExport) {
                window.productImportExport.importProducts();
            } else {
                Utils.showAlert('ميزة الاستيراد غير متاحة حالياً', 'info');
            }
        });
        
        // تصدير المنتجات
        document.getElementById('exportProductsBtn')?.addEventListener('click', () => {
            if (window.productImportExport) {
                window.productImportExport.exportProducts();
            } else {
                this.exportInventoryData();
            }
        });
        
        // توليد الباركود من اسم المنتج
        document.getElementById('inventoryName')?.addEventListener('blur', (e) => {
            this.suggestBarcodeFromName(e.target.value);
        });
    }
    
    setupBarcodeFields() {
        // إضافة أزرار الباركود إذا لم تكن موجودة
        setTimeout(() => {
            const modalBody = document.querySelector('#inventoryModal .modal-body');
            if (modalBody && !document.getElementById('inventoryBarcode')) {
                const barcodeField = `
                    <div class="form-group">
                        <label for="inventoryBarcode">باركود المنتج</label>
                        <div class="barcode-input-group">
                            <input type="text" id="inventoryBarcode" placeholder="باركود المنتج (12 رقم)" maxlength="12">
                            <button type="button" class="btn btn-sm btn-secondary" onclick="generateBarcodeForCurrentProduct()">
                                <i class="fas fa-barcode"></i> توليد
                            </button>
                            <button type="button" class="btn btn-sm btn-info" onclick="openBarcodeScannerForInventory()">
                                <i class="fas fa-camera"></i> مسح
                            </button>
                        </div>
                        <small class="text-muted">اتركه فارغاً لتوليد باركود تلقائياً</small>
                    </div>
                `;
                modalBody.insertAdjacentHTML('beforeend', barcodeField);
            }
        }, 100);
    }
    
    openAddModal() {
        ModalManager.open(this.modalId);
        this.resetForm();
        
        // تعيين تاريخ اليوم
        const dateField = document.getElementById('inventoryDate');
        if (dateField) {
            dateField.value = System.today;
        }
    }
    
    saveInventoryItem() {
        // منع الحفظ المتعدد
        if (this.isSaving) {
            Utils.showAlert('جاري حفظ المنتج...', 'info');
            return;
        }
        
        this.isSaving = true;
        
        try {
            // جمع البيانات
            const name = document.getElementById('inventoryName')?.value;
            const category = document.getElementById('inventoryCategory')?.value;
            const quantity = parseInt(document.getElementById('inventoryQuantity')?.value) || 0;
            const price = parseFloat(document.getElementById('inventoryPrice')?.value) || 0;
            const cost = parseFloat(document.getElementById('inventoryCost')?.value) || 0;
            const barcodeInput = document.getElementById('inventoryBarcode');
            const barcode = barcodeInput ? barcodeInput.value.trim() : '';
            
            console.log('بيانات الإدخال:', { name, category, quantity, price, cost, barcode });
            
            // التحقق من البيانات
            if (!name || name.trim() === '') {
                Utils.showAlert('يرجى إدخال اسم المنتج', 'error');
                this.isSaving = false;
                return;
            }
            
            if (!category || category.trim() === '') {
                Utils.showAlert('يرجى إدخال فئة المنتج', 'error');
                this.isSaving = false;
                return;
            }
            
            if (quantity < 0) {
                Utils.showAlert('الكمية يجب أن تكون رقماً موجباً', 'error');
                this.isSaving = false;
                return;
            }
            
            if (price < 0) {
                Utils.showAlert('سعر البيع يجب أن يكون رقماً موجباً', 'error');
                this.isSaving = false;
                return;
            }
            
            // إنشاء منتج جديد
            const newProduct = {
                id: System.data.inventory.length > 0 ? 
                    Math.max(...System.data.inventory.map(item => item.id || 0)) + 1 : 1,
                name: name.trim(),
                category: category.trim(),
                quantity: quantity,
                price: price,
                cost: cost || price * 0.7, // تكلفة افتراضية إذا لم يتم إدخالها
                addedDate: new Date().toISOString()
            };
            
            // إضافة الباركود إذا كان موجوداً
            if (barcode && barcode !== '') {
                // التحقق من عدم تكرار الباركود
                const existingProduct = System.data.inventory.find(item => item.barcode === barcode);
                if (existingProduct) {
                    Utils.showAlert('هذا الباركود مستخدم بالفعل لمنتج آخر', 'warning');
                    this.isSaving = false;
                    return;
                }
                newProduct.barcode = barcode;
            } else {
                // توليد باركود تلقائي
                if (window.barcodeSystem) {
                    newProduct.barcode = window.barcodeSystem.generateBarcodeFromName(newProduct.name);
                } else {
                    // باركود بسيط إذا لم يكن النظام متاحاً
                    const timestamp = Date.now().toString().substr(-8);
                    const nameCode = newProduct.name.substring(0, 3).toUpperCase().replace(/\s/g, '');
                    newProduct.barcode = nameCode + timestamp;
                }
            }
            
            // التحقق من عدم تكرار اسم المنتج (اختياري)
            const existingName = System.data.inventory.find(item => 
                item.name.toLowerCase() === newProduct.name.toLowerCase()
            );
            
            if (existingName) {
                const confirm = window.confirm(`المنتج "${newProduct.name}" موجود بالفعل. هل تريد إضافة الكمية إليه؟`);
                if (confirm) {
                    existingName.quantity += newProduct.quantity;
                    if (price > 0) existingName.price = price;
                    if (cost > 0) existingName.cost = cost;
                    System.saveInventory();
                    
                    ModalManager.close(this.modalId);
                    this.resetForm();
                    this.displayInventory();
                    
                    if (window.SalesManager) {
                        window.SalesManager.updateProductOptions();
                    }
                    
                    Utils.showAlert(`تم تحديث كمية المنتج "${newProduct.name}"`, 'success');
                    this.isSaving = false;
                    return;
                }
            }
            
            console.log('المنتج الجديد:', newProduct);
            
            // إضافة المنتج وحفظه
            System.data.inventory.push(newProduct);
            System.saveInventory();
            
            // إغلاق النافذة
            ModalManager.close(this.modalId);
            
            // إعادة تعيين النموذج
            this.resetForm();
            
            // تحديث العرض
            this.displayInventory();
            
            // تحديث قائمة المنتجات في المبيعات
            if (window.SalesManager) {
                window.SalesManager.updateProductOptions();
            }
            
            Utils.showAlert(`تم إضافة المنتج "${newProduct.name}" إلى المخزون بنجاح`, 'success');
            
        } catch (error) {
            console.error('خطأ في حفظ المنتج:', error);
            Utils.showAlert('حدث خطأ أثناء حفظ المنتج: ' + error.message, 'error');
        } finally {
            this.isSaving = false;
        }
    }
    
    validateInventoryData(data) {
        return data.name && 
               data.name.trim() !== '' && 
               data.category && 
               data.category.trim() !== '' && 
               data.quantity >= 0 && 
               data.price >= 0;
    }
    
    resetForm() {
        const fields = ['inventoryName', 'inventoryCategory', 'inventoryQuantity', 
                       'inventoryPrice', 'inventoryCost', 'inventoryBarcode'];
        
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                if (fieldId === 'inventoryQuantity') {
                    field.value = '0';
                } else if (fieldId === 'inventoryCategory') {
                    field.value = '';
                } else {
                    field.value = '';
                }
            }
        });
    }
    
    initCategories() {
        const categorySelect = document.getElementById('inventoryCategory');
        if (categorySelect) {
            // الحفاظ على القيمة الحالية إذا كانت موجودة
            const currentValue = categorySelect.value;
            
            // مسح الخيارات الحالية
            categorySelect.innerHTML = '';
            
            // إضافة خيار فارغ
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = 'اختر فئة';
            categorySelect.appendChild(emptyOption);
            
            // إضافة فئات من CONFIG
            if (CONFIG && CONFIG.INVENTORY_CATEGORIES) {
                CONFIG.INVENTORY_CATEGORIES.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category;
                    option.textContent = category;
                    categorySelect.appendChild(option);
                });
            }
            
            // استعادة القيمة السابقة إذا كانت موجودة
            if (currentValue && CONFIG && CONFIG.INVENTORY_CATEGORIES && 
                CONFIG.INVENTORY_CATEGORIES.includes(currentValue)) {
                categorySelect.value = currentValue;
            }
        }
    }
    
    displayInventory() {
        const tableBody = document.getElementById(this.tableId);
        if (!tableBody) return;
        
        if (!System.data.inventory || System.data.inventory.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="no-data">
                        <div style="text-align: center; padding: 40px;">
                            <i class="fas fa-warehouse fa-3x" style="color: #ccc; margin-bottom: 20px;"></i>
                            <p>لا توجد منتجات في المخزون</p>
                            <button class="btn btn-success" onclick="document.getElementById('addInventoryBtn').click()">
                                <i class="fas fa-plus"></i> إضافة أول منتج
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        let html = '';
        let totalValue = 0;
        
        System.data.inventory.forEach(item => {
            const itemValue = item.quantity * (item.cost || 0);
            totalValue += itemValue;
            
            const barcodeDisplay = item.barcode ? 
                `<span class="barcode-display" title="${item.barcode}">
                    ${item.barcode.substring(0, 4)}...${item.barcode.substring(item.barcode.length - 4)}
                </span>` :
                '<span class="no-barcode">بدون باركود</span>';
            
            html += `
                <tr data-product-id="${item.id}">
                    <td>${item.name}</td>
                    <td>${item.category}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price ? Utils.formatCurrency(item.price) : '-'}</td>
                    <td>${item.cost ? Utils.formatCurrency(item.cost) : '-'}</td>
                    <td>${Utils.formatCurrency(itemValue)}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 5px;">
                            ${barcodeDisplay}
                            ${item.barcode ? `
                                <button class="action-btn copy-btn" onclick="copyToClipboard('${item.barcode}')" title="نسخ الباركود">
                                    <i class="fas fa-copy"></i>
                                </button>
                            ` : `
                                <button class="action-btn generate-btn" onclick="generateBarcodeForItem(${item.id})" title="توليد باركود">
                                    <i class="fas fa-barcode"></i>
                                </button>
                            `}
                        </div>
                    </td>
                    <td>
                        <div style="display: flex; gap: 5px;">
                            <button class="action-btn edit-btn" onclick="editInventory(${item.id})" title="تعديل">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete-btn" onclick="deleteInventory(${item.id})" title="حذف">
                                <i class="fas fa-trash"></i>
                            </button>
                            ${item.barcode ? `
                                <button class="action-btn print-btn" onclick="printBarcodeLabel(${item.id})" title="طباعة الباركود">
                                    <i class="fas fa-print"></i>
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        });
        
        // إضافة صف الإجمالي
        html += `
            <tr class="total-row">
                <td colspan="5"><strong>إجمالي قيمة المخزون</strong></td>
                <td><strong>${Utils.formatCurrency(totalValue)}</strong></td>
                <td colspan="2"></td>
            </tr>
        `;
        
        tableBody.innerHTML = html;
    }
    
    initSearch() {
        const searchInput = document.getElementById(this.searchId);
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchInventory(e.target.value);
            });
            
            // مسح البحث عند الضغط على ESC
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    searchInput.value = '';
                    this.searchInventory('');
                }
            });
        }
    }
    
    // باقي الدوال تبقى كما هي بدون تغيير كبير...
    
    // إزالة الكود الزائد في نهاية الملف
    
}

// وظائف مساعدة للباركود
function generateBarcodeForCurrentProduct() {
    const productName = document.getElementById('inventoryName')?.value;
    const barcodeInput = document.getElementById('inventoryBarcode');
    
    if (barcodeInput) {
        if (window.barcodeSystem) {
            if (productName && productName.trim() !== '') {
                barcodeInput.value = window.barcodeSystem.generateBarcodeFromName(productName);
            } else {
                barcodeInput.value = window.barcodeSystem.generateRandomBarcode();
            }
            
            Utils.showAlert('تم توليد باركود جديد', 'success');
        } else {
            // توليد باركود بسيط إذا لم يكن النظام متاحاً
            const simpleBarcode = '88' + Math.floor(1000000000 + Math.random() * 9000000000).toString().substring(0, 10);
            barcodeInput.value = simpleBarcode;
            Utils.showAlert('تم توليد باركود مؤقت', 'info');
        }
    }
}

function openBarcodeScannerForInventory() {
    if (window.barcodeSystem) {
        window.barcodeSystem.openBarcodeScanner();
    } else {
        Utils.showAlert('نظام الباركود غير متاح حالياً', 'error');
    }
}

// وظائف مساعدة (يتم تصديرها للاستخدام في الملفات الأخرى)
function copyToClipboard(text) {
    if (!text) return;
    
    navigator.clipboard.writeText(text).then(() => {
        Utils.showAlert('تم نسخ الباركود إلى الحافظة', 'success');
    }).catch(err => {
        // طريقة بديلة
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        Utils.showAlert('تم نسخ الباركود إلى الحافظة', 'success');
    });
}

function generateBarcodeForItem(productId) {
    const product = System.findInventoryItemById(productId);
    if (!product) {
        Utils.showAlert('المنتج غير موجود', 'error');
        return;
    }
    
    if (product.barcode) {
        Utils.showAlert('المنتج لديه باركود بالفعل', 'info');
        return;
    }
    
    if (window.barcodeSystem) {
        product.barcode = window.barcodeSystem.generateBarcodeFromName(product.name);
        System.saveInventory();
        
        // تحديث العرض
        if (window.InventoryManager) {
            window.InventoryManager.displayInventory();
        }
        
        Utils.showAlert(`تم توليد باركود للمنتج: ${product.barcode}`, 'success');
    } else {
        Utils.showAlert('نظام الباركود غير متاح', 'error');
    }
}

function printBarcodeLabel(productId) {
    const product = System.findInventoryItemById(productId);
    if (!product || !product.barcode) {
        Utils.showAlert('المنتج ليس لديه باركود', 'error');
        return;
    }
    
    const labelHTML = `
        <div style="direction: rtl; text-align: center; padding: 20px; border: 2px dashed #ddd; width: 300px; margin: 0 auto;">
            <h4 style="margin: 0 0 10px 0; font-size: 18px;">${product.name}</h4>
            <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">${product.category}</p>
            <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: bold;">${Utils.formatCurrency(product.price)}</p>
            <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                <p style="margin: 0; font-family: 'Courier New', monospace; font-size: 20px; letter-spacing: 3px;">
                    ${product.barcode}
                </p>
            </div>
            <small style="color: #999; font-size: 12px;">${new Date().toLocaleDateString('ar-SA')}</small>
        </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>طباعة باركود - ${product.name}</title>
            <style>
                body { 
                    margin: 40px; 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    min-height: 100vh;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                @media print {
                    body { margin: 20px; }
                    .no-print { display: none !important; }
                }
            </style>
        </head>
        <body>
            ${labelHTML}
            <div class="no-print" style="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);">
                <button onclick="window.print()" style="
                    padding: 10px 20px;
                    background: #007bff;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                ">
                    <i class="fas fa-print"></i> طباعة
                </button>
                <button onclick="window.close()" style="
                    padding: 10px 20px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                    margin-right: 10px;
                ">
                    إغلاق
                </button>
            </div>
            <script>
                // محاكاة أيقونات Font Awesome
                document.addEventListener('DOMContentLoaded', function() {
                    const style = document.createElement('style');
                    style.textContent = \`
                        .fa-print:before { content: '🖨️'; }
                        .fa-print { font-family: inherit; }
                    \`;
                    document.head.appendChild(style);
                });
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

function createProductFromBarcode(barcode) {
    if (!barcode || barcode.trim() === '') return;
    
    ModalManager.open('inventoryModal');
    
    setTimeout(() => {
        const barcodeInput = document.getElementById('inventoryBarcode');
        if (barcodeInput) {
            barcodeInput.value = barcode;
            barcodeInput.focus();
        }
        
        const nameInput = document.getElementById('inventoryName');
        if (nameInput) {
            nameInput.focus();
        }
        
        Utils.showAlert('أكمل بيانات المنتج الجديد', 'info');
    }, 300);
}

function scanBarcodeForSearch() {
    if (window.barcodeSystem) {
        window.barcodeSystem.openBarcodeScanner();
    } else {
        Utils.showAlert('نظام مسح الباركود غير متاح', 'error');
    }
}

// تصدير للاستخدام في الملفات الأخرى
window.InventoryManager = InventoryManager;

// تصدير الوظائف المساعدة
window.copyToClipboard = copyToClipboard;
window.generateBarcodeForItem = generateBarcodeForItem;
window.printBarcodeLabel = printBarcodeLabel;
window.createProductFromBarcode = createProductFromBarcode;
window.scanBarcodeForSearch = scanBarcodeForSearch;
window.generateBarcodeForCurrentProduct = generateBarcodeForCurrentProduct;
window.openBarcodeScannerForInventory = openBarcodeScannerForInventory;


// وظائف التحرير والحذف للمخزون
function editInventory(productId) {
    const product = System.findInventoryItemById(productId);
    if (!product) {
        Utils.showAlert('المنتج غير موجود', 'error');
        return;
    }
    
    ModalManager.open('inventoryModal');
    
    setTimeout(() => {
        // تعبئة بيانات المنتج
        const fields = {
            'inventoryName': product.name,
            'inventoryCategory': product.category,
            'inventoryQuantity': product.quantity,
            'inventoryPrice': product.price,
            'inventoryCost': product.cost || '',
            'inventoryBarcode': product.barcode || ''
        };
        
        Object.entries(fields).forEach(([id, value]) => {
            const field = document.getElementById(id);
            if (field) {
                field.value = value || '';
            }
        });
        
        // تغيير زر الحفظ ليصبح تحديث
        const saveBtn = document.getElementById('saveInventory');
        if (saveBtn) {
            saveBtn.dataset.editId = productId;
            saveBtn.textContent = 'تحديث المنتج';
            saveBtn.onclick = function() {
                updateInventoryItem(productId);
            };
        }
        
        Utils.showAlert('يمكنك تعديل بيانات المنتج', 'info');
    }, 300);
}

function updateInventoryItem(productId) {
    try {
        const product = System.findInventoryItemById(productId);
        if (!product) {
            Utils.showAlert('المنتج غير موجود', 'error');
            return;
        }
        
        // جمع البيانات الجديدة
        const name = document.getElementById('inventoryName')?.value;
        const category = document.getElementById('inventoryCategory')?.value;
        const quantity = parseInt(document.getElementById('inventoryQuantity')?.value) || 0;
        const price = parseFloat(document.getElementById('inventoryPrice')?.value) || 0;
        const cost = parseFloat(document.getElementById('inventoryCost')?.value) || 0;
        const barcode = document.getElementById('inventoryBarcode')?.value?.trim() || '';
        
        // التحقق من البيانات
        if (!name || !category || name.trim() === '' || category.trim() === '') {
            Utils.showAlert('يرجى إدخال اسم المنتج والفئة', 'error');
            return;
        }
        
        if (quantity < 0 || price < 0) {
            Utils.showAlert('الكمية والسعر يجب أن يكونا أرقاماً موجبة', 'error');
            return;
        }
        
        // تحديث بيانات المنتج
        product.name = name.trim();
        product.category = category.trim();
        product.quantity = quantity;
        product.price = price;
        product.cost = cost || price * 0.7;
        
        // تحديث الباركود إذا تم تغييره
        if (barcode && barcode !== '' && barcode !== product.barcode) {
            // التحقق من عدم تكرار الباركود
            const existingProduct = System.data.inventory.find(item => 
                item.id !== productId && item.barcode === barcode
            );
            if (existingProduct) {
                Utils.showAlert('هذا الباركود مستخدم بالفعل لمنتج آخر', 'warning');
                return;
            }
            product.barcode = barcode;
        }
        
        // حفظ التغييرات
        System.saveInventory();
        
        // إغلاق النافذة
        ModalManager.close('inventoryModal');
        
        // إعادة تعيين النموذج
        if (window.InventoryManager) {
            window.InventoryManager.resetForm();
        }
        
        // تحديث العرض
        if (window.InventoryManager) {
            window.InventoryManager.displayInventory();
        }
        
        // تحديث قائمة المنتجات في المبيعات
        if (window.SalesManager) {
            window.SalesManager.updateProductOptions();
        }
        
        // إعادة تعيين زر الحفظ
        const saveBtn = document.getElementById('saveInventory');
        if (saveBtn) {
            delete saveBtn.dataset.editId;
            saveBtn.textContent = 'حفظ المنتج';
            saveBtn.onclick = function() {
                if (window.InventoryManager) {
                    window.InventoryManager.saveInventoryItem();
                }
            };
        }
        
        Utils.showAlert(`تم تحديث المنتج "${product.name}" بنجاح`, 'success');
        
    } catch (error) {
        console.error('خطأ في تحديث المنتج:', error);
        Utils.showAlert('حدث خطأ أثناء تحديث المنتج: ' + error.message, 'error');
    }
}

function deleteInventory(productId) {
    const product = System.findInventoryItemById(productId);
    if (!product) {
        Utils.showAlert('المنتج غير موجود', 'error');
        return;
    }
    
    if (confirm(`هل أنت متأكد من حذف المنتج "${product.name}"؟`)) {
        // حذف المنتج
        System.data.inventory = System.data.inventory.filter(item => item.id !== productId);
        System.saveInventory();
        
        // تحديث العرض
        if (window.InventoryManager) {
            window.InventoryManager.displayInventory();
        }
        
        // تحديث قائمة المنتجات في المبيعات
        if (window.SalesManager) {
            window.SalesManager.updateProductOptions();
        }
        
        Utils.showAlert(`تم حذف المنتج "${product.name}" بنجاح`, 'success');
    }
}

// تصدير وظائف التحرير والحذف
window.editInventory = editInventory;
window.deleteInventory = deleteInventory;
window.updateInventoryItem = updateInventoryItem;
