// ============================================================================
// نظام استيراد وتصدير Excel
// ============================================================================

class ExcelImportExport {
    constructor() {
        this.sheetJSLoaded = false;
        this.loadSheetJS();
    }
    
    async loadSheetJS() {
        if (typeof XLSX === 'undefined') {
            try {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
                script.onload = () => {
                    this.sheetJSLoaded = true;
                    console.log('تم تحميل مكتبة SheetJS بنجاح');
                };
                script.onerror = () => {
                    console.error('فشل تحميل مكتبة SheetJS');
                };
                document.head.appendChild(script);
            } catch (error) {
                console.error('خطأ في تحميل مكتبة SheetJS:', error);
            }
        } else {
            this.sheetJSLoaded = true;
        }
    }
    
    init() {
        this.bindEvents();
        this.addExportButtons();
    }
    
    bindEvents() {
        // زر استيراد Excel
        document.getElementById('importExcelBtn')?.addEventListener('click', () => {
            this.showImportExcelDialog();
        });
        
        // حدث اختيار ملف Excel
        document.getElementById('excelFileInput')?.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleExcelFile(e.target.files[0]);
            }
        });
    }
    
    addExportButtons() {
        // إضافة زر تصدير Excel في قسم المخزون
        const inventorySection = document.getElementById('inventory');
        if (inventorySection && !document.getElementById('exportExcelBtn')) {
            const sectionActions = inventorySection.querySelector('.section-actions');
            if (sectionActions) {
                const excelBtn = document.createElement('button');
                excelBtn.id = 'exportExcelBtn';
                excelBtn.className = 'btn btn-success';
                excelBtn.innerHTML = '<i class="fas fa-file-excel"></i> تصدير إلى Excel';
                excelBtn.onclick = () => this.exportToExcel();
                sectionActions.appendChild(excelBtn);
            }
        }
    }
    
    // ==============================================
    // استيراد من Excel
    // ==============================================
    
    showImportExcelDialog() {
        const dialogHTML = `
            <div class="excel-import-dialog">
                <h3><i class="fas fa-file-excel text-success"></i> استيراد من Excel</h3>
                
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    <strong>تعليمات الاستيراد:</strong>
                    <ul>
                        <li>يجب أن يحتوي ملف Excel على الأقل على عمود "اسم المنتج"</li>
                        <li>يمكن تسمية الأعمدة بالعربية أو الإنجليزية</li>
                        <li>يدعم ملفات Excel (.xlsx, .xls) و CSV</li>
                    </ul>
                </div>
                
                <div class="file-upload-area" style="text-align: center; padding: 30px; border: 2px dashed #28a745; border-radius: 10px; margin: 20px 0;">
                    <i class="fas fa-file-excel fa-3x text-success" style="margin-bottom: 15px;"></i>
                    <p style="font-size: 16px; margin-bottom: 15px;">اسحب وأفلت ملف Excel هنا أو</p>
                    <input type="file" id="excelFileInput" accept=".xlsx,.xls,.csv" style="display: none;">
                    <label for="excelFileInput" class="btn btn-success btn-lg">
                        <i class="fas fa-upload"></i> اختر ملف Excel
                    </label>
                    <p class="text-muted" style="margin-top: 10px;">الحد الأقصى: 10MB</p>
                </div>
                
                <div class="import-options">
                    <h5>خيارات الاستيراد:</h5>
                    
                    <div class="form-group">
                        <label>
                            <input type="radio" name="excelImportMode" value="add" checked>
                            إضافة المنتجات الجديدة فقط
                        </label>
                        <small class="text-muted">(إضافة منتجات جديدة دون التأثير على المنتجات الحالية)</small>
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input type="radio" name="excelImportMode" value="update">
                            تحديث المنتجات الحالية
                        </label>
                        <small class="text-muted">(تحديث المنتجات الموجودة وإضافة الجديدة)</small>
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input type="radio" name="excelImportMode" value="replace">
                            استبدال جميع المنتجات
                        </label>
                        <small class="text-muted">(حذف جميع المنتجات الحالية واستبدالها)</small>
                    </div>
                </div>
                
                <div class="excel-preview" id="excelPreviewSection" style="display: none;">
                    <h5>معاينة البيانات:</h5>
                    <div class="table-container" style="max-height: 300px; overflow: auto;">
                        <table class="preview-table" id="excelPreviewTable">
                            <thead id="excelPreviewHeader"></thead>
                            <tbody id="excelPreviewBody"></tbody>
                        </table>
                    </div>
                    <div class="preview-info" id="excelPreviewInfo"></div>
                </div>
                
                <div class="dialog-buttons" style="margin-top: 20px;">
                    <button class="btn btn-secondary" id="cancelExcelImport">إلغاء</button>
                    <button class="btn btn-primary" id="confirmExcelImport" disabled>استيراد البيانات</button>
                </div>
            </div>
        `;
        
        this.showDialog('استيراد من Excel', dialogHTML);
        
        // إضافة إمكانية السحب والإفلات
        this.setupDragAndDrop();
        
        // تحديث حالة زر التأكيد
        document.getElementById('excelFileInput').addEventListener('change', () => {
            const confirmBtn = document.getElementById('confirmExcelImport');
            if (confirmBtn) confirmBtn.disabled = false;
        });
    }
    
    setupDragAndDrop() {
        const uploadArea = document.querySelector('.file-upload-area');
        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = '#218838';
                uploadArea.style.background = '#f0fff4';
            });
            
            uploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = '#28a745';
                uploadArea.style.background = '';
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = '#28a745';
                uploadArea.style.background = '';
                
                if (e.dataTransfer.files.length > 0) {
                    const file = e.dataTransfer.files[0];
                    if (this.isValidExcelFile(file)) {
                        document.getElementById('excelFileInput').files = e.dataTransfer.files;
                        this.handleExcelFile(file);
                    } else {
                        Utils.showAlert('الملف غير مدعوم. يرجى اختيار ملف Excel أو CSV', 'error');
                    }
                }
            });
        }
    }
    
    isValidExcelFile(file) {
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv',
            'application/csv'
        ];
        
        const validExtensions = ['.xlsx', '.xls', '.csv'];
        const fileName = file.name.toLowerCase();
        
        return validTypes.includes(file.type) || 
               validExtensions.some(ext => fileName.endsWith(ext));
    }
    
    async handleExcelFile(file) {
        if (!this.sheetJSLoaded && typeof XLSX === 'undefined') {
            Utils.showAlert('جاري تحميل مكتبة Excel...', 'info');
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        try {
            const data = await this.readExcelFile(file);
            this.previewExcelData(data, file.name);
            
            const confirmBtn = document.getElementById('confirmExcelImport');
            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.onclick = () => this.processExcelData(data, file.name);
            }
            
        } catch (error) {
            console.error('خطأ في قراءة ملف Excel:', error);
            Utils.showAlert('تعذر قراءة ملف Excel. تأكد من صحة تنسيق الملف', 'error');
        }
    }
    
    readExcelFile(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('لم يتم اختيار ملف'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    // الحصول على الورقة الأولى
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    
                    // تحويل إلى JSON
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    
                    resolve({
                        workbook: workbook,
                        worksheet: worksheet,
                        jsonData: jsonData,
                        sheetName: firstSheetName
                    });
                    
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                reject(new Error('تعذر قراءة الملف'));
            };
            
            reader.readAsArrayBuffer(file);
        });
    }
    
    previewExcelData(data, fileName) {
        const previewSection = document.getElementById('excelPreviewSection');
        const previewHeader = document.getElementById('excelPreviewHeader');
        const previewBody = document.getElementById('excelPreviewBody');
        const previewInfo = document.getElementById('excelPreviewInfo');
        
        if (!previewSection || !data.jsonData || data.jsonData.length === 0) {
            return;
        }
        
        // إظهار قسم المعاينة
        previewSection.style.display = 'block';
        
        // تنظيف العرض السابق
        previewHeader.innerHTML = '';
        previewBody.innerHTML = '';
        
        // الحصول على رؤوس الأعمدة
        const firstRow = data.jsonData[0];
        const headers = Object.keys(firstRow);
        
        // عرض رؤوس الأعمدة
        let headerHTML = '<tr>';
        headers.forEach(header => {
            headerHTML += `<th>${header}</th>`;
        });
        headerHTML += '</tr>';
        previewHeader.innerHTML = headerHTML;
        
        // عرض أول 5 صفوف للمعاينة
        const previewRows = data.jsonData.slice(0, 5);
        let bodyHTML = '';
        
        previewRows.forEach(row => {
            bodyHTML += '<tr>';
            headers.forEach(header => {
                const value = row[header];
                bodyHTML += `<td>${value !== undefined ? value : ''}</td>`;
            });
            bodyHTML += '</tr>';
        });
        
        previewBody.innerHTML = bodyHTML;
        
        // عرض معلومات الملف
        previewInfo.innerHTML = `
            <div style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                <strong>معلومات الملف:</strong>
                <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                    <span>اسم الملف: ${fileName}</span>
                    <span>عدد الصفوف: ${data.jsonData.length}</span>
                    <span>عدد الأعمدة: ${headers.length}</span>
                </div>
            </div>
        `;
    }
    
    async processExcelData(data, fileName) {
        if (!data.jsonData || data.jsonData.length === 0) {
            Utils.showAlert('الملف لا يحتوي على بيانات', 'error');
            return;
        }
        
        try {
            const products = this.parseExcelData(data.jsonData);
            
            if (products.length === 0) {
                Utils.showAlert('لم يتم العثور على منتجات في الملف', 'error');
                return;
            }
            
            const importMode = document.querySelector('input[name="excelImportMode"]:checked').value;
            await this.confirmExcelImport(products, importMode, fileName);
            
        } catch (error) {
            console.error('خطأ في معالجة بيانات Excel:', error);
            Utils.showAlert('تعذر معالجة بيانات الملف', 'error');
        }
    }
    
    parseExcelData(jsonData) {
        const products = [];
        
        // تعيين ترميز الأعمدة (العربية والإنجليزية)
        const columnMapping = {
            // العربية
            'اسم المنتج': 'name',
            'الاسم': 'name',
            'اسم': 'name',
            'الفئة': 'category',
            'التصنيف': 'category',
            'الكمية': 'quantity',
            'الكمية المتاحة': 'quantity',
            'سعر البيع': 'price',
            'السعر': 'price',
            'سعر التكلفة': 'cost',
            'التكلفة': 'cost',
            'باركود': 'barcode',
            'الباركود': 'barcode',
            'كود': 'barcode',
            
            // الإنجليزية
            'product name': 'name',
            'name': 'name',
            'category': 'category',
            'quantity': 'quantity',
            'available quantity': 'quantity',
            'price': 'price',
            'sale price': 'price',
            'cost': 'cost',
            'purchase cost': 'cost',
            'barcode': 'barcode',
            'code': 'barcode'
        };
        
        jsonData.forEach((row, index) => {
            const product = {};
            let hasName = false;
            
            Object.keys(row).forEach(columnName => {
                const normalizedColumn = columnName.trim().toLowerCase();
                let mappedColumn = null;
                
                // البحث عن العمود المناسب
                Object.keys(columnMapping).forEach(key => {
                    if (normalizedColumn === key.toLowerCase() || 
                        columnName === key) {
                        mappedColumn = columnMapping[key];
                    }
                });
                
                if (mappedColumn) {
                    let value = row[columnName];
                    
                    // تنظيف وتنسيق القيم
                    if (value !== null && value !== undefined) {
                        if (typeof value === 'string') {
                            value = value.trim();
                            
                            // تحويل الأرقام النصية
                            if (mappedColumn === 'quantity' || 
                                mappedColumn === 'price' || 
                                mappedColumn === 'cost') {
                                const numValue = parseFloat(value.replace(/[^\d.-]/g, ''));
                                if (!isNaN(numValue)) {
                                    value = numValue;
                                }
                            }
                        }
                        
                        product[mappedColumn] = value;
                        
                        if (mappedColumn === 'name' && value) {
                            hasName = true;
                        }
                    }
                }
            });
            
            // التأكد من وجود اسم المنتج
            if (hasName && product.name && product.name.trim() !== '') {
                // تعيين قيم افتراضية إذا كانت غير موجودة
                if (!product.category) product.category = 'غير مصنف';
                if (!product.quantity || isNaN(product.quantity)) product.quantity = 0;
                if (!product.price || isNaN(product.price)) product.price = 0;
                if (!product.cost || isNaN(product.cost)) product.cost = product.price * 0.7;
                
                products.push(product);
            }
        });
        
        return products;
    }
    
    async confirmExcelImport(products, importMode, fileName) {
        const productCount = products.length;
        
        const confirmed = await Utils.confirmDialog(
            'تأكيد استيراد من Excel',
            `هل تريد استيراد ${productCount} منتج من ملف "${fileName}"؟
            <br><strong>وضع الاستيراد:</strong> ${this.getImportModeText(importMode)}
            <br><strong>عدد المنتجات:</strong> ${productCount}
            <br><br>سيتم ${this.getImportModeDescription(importMode)}`,
            'استيراد',
            'إلغاء'
        );
        
        if (!confirmed) return;
        
        // تنفيذ الاستيراد
        this.executeExcelImport(products, importMode);
    }
    
    getImportModeText(mode) {
        const modes = {
            'add': 'إضافة فقط',
            'replace': 'استبدال',
            'update': 'تحديث'
        };
        return modes[mode] || mode;
    }
    
    getImportModeDescription(mode) {
        const descriptions = {
            'add': 'إضافة المنتجات الجديدة فقط',
            'replace': 'حذف جميع المنتجات الحالية واستبدالها بالجديدة',
            'update': 'تحديث المنتجات الموجودة وإضافة الجديدة'
        };
        return descriptions[mode] || '';
    }
    
    executeExcelImport(importedProducts, importMode) {
        try {
            let newInventory;
            
            switch(importMode) {
                case 'add':
                    // إضافة المنتجات الجديدة فقط
                    newInventory = [...System.data.inventory];
                    importedProducts.forEach(product => {
                        // التحقق من عدم تكرار المنتج بالاسم
                        const exists = newInventory.find(p => 
                            p.name.toLowerCase() === product.name.toLowerCase()
                        );
                        
                        if (!exists) {
                            newInventory.push({
                                id: Utils.generateId(newInventory),
                                name: product.name,
                                category: product.category || 'غير مصنف',
                                quantity: product.quantity || 0,
                                price: product.price || 0,
                                cost: product.cost || 0,
                                barcode: product.barcode || this.generateBarcode(product.name)
                            });
                        }
                    });
                    break;
                    
                case 'replace':
                    // استبدال جميع المنتجات
                    newInventory = importedProducts.map((product, index) => ({
                        id: index + 1,
                        name: product.name,
                        category: product.category || 'غير مصنف',
                        quantity: product.quantity || 0,
                        price: product.price || 0,
                        cost: product.cost || 0,
                        barcode: product.barcode || this.generateBarcode(product.name)
                    }));
                    break;
                    
                case 'update':
                    // تحديث المنتجات الحالية وإضافة الجديدة
                    newInventory = [...System.data.inventory];
                    
                    importedProducts.forEach(importedProduct => {
                        const existingProduct = newInventory.find(p => 
                            p.name.toLowerCase() === importedProduct.name.toLowerCase()
                        );
                        
                        if (existingProduct) {
                            // تحديث المنتج الموجود
                            if (importedProduct.category) existingProduct.category = importedProduct.category;
                            if (importedProduct.quantity !== undefined) existingProduct.quantity = importedProduct.quantity;
                            if (importedProduct.price !== undefined) existingProduct.price = importedProduct.price;
                            if (importedProduct.cost !== undefined) existingProduct.cost = importedProduct.cost;
                            if (importedProduct.barcode) existingProduct.barcode = importedProduct.barcode;
                        } else {
                            // إضافة منتج جديد
                            newInventory.push({
                                id: Utils.generateId(newInventory),
                                name: importedProduct.name,
                                category: importedProduct.category || 'غير مصنف',
                                quantity: importedProduct.quantity || 0,
                                price: importedProduct.price || 0,
                                cost: importedProduct.cost || 0,
                                barcode: importedProduct.barcode || this.generateBarcode(importedProduct.name)
                            });
                        }
                    });
                    break;
            }
            
            // حفظ المخزون الجديد
            System.data.inventory = newInventory;
            System.saveInventory();
            
            // تحديث العرض
            if (window.InventoryManager) {
                window.InventoryManager.displayInventory();
            }
            if (window.SalesManager) {
                window.SalesManager.updateProductOptions();
            }
            
            // إظهار تقرير الاستيراد
            this.showExcelImportReport(importedProducts.length, newInventory.length);
            
        } catch (error) {
            console.error('خطأ في استيراد المنتجات من Excel:', error);
            Utils.showAlert('حدث خطأ أثناء استيراد المنتجات', 'error');
        }
    }
    
    generateBarcode(name) {
        if (window.barcodeSystem) {
            return window.barcodeSystem.generateBarcodeFromName(name);
        } else {
            // باركود بسيط
            const timestamp = Date.now().toString().substr(-8);
            const nameCode = name.substring(0, 3).toUpperCase().replace(/\s/g, '');
            return nameCode + timestamp;
        }
    }
    
    showExcelImportReport(importedCount, totalCount) {
        const reportHTML = `
            <div class="excel-import-report">
                <h3><i class="fas fa-check-circle text-success"></i> تم الاستيراد من Excel بنجاح!</h3>
                
                <div class="report-details">
                    <div class="report-card success">
                        <i class="fas fa-file-excel fa-2x"></i>
                        <div>
                            <h5>المنتجات المستوردة</h5>
                            <div class="report-value">${importedCount}</div>
                        </div>
                    </div>
                    
                    <div class="report-card info">
                        <i class="fas fa-database fa-2x"></i>
                        <div>
                            <h5>إجمالي المنتجات</h5>
                            <div class="report-value">${totalCount}</div>
                        </div>
                    </div>
                </div>
                
                <div class="next-steps">
                    <h5>الخطوات التالية:</h5>
                    <ul>
                        <li><i class="fas fa-check"></i> مراجعة المنتجات في قسم المخزون</li>
                        <li><i class="fas fa-check"></i> التحقق من الباركودات المولدة</li>
                        <li><i class="fas fa-check"></i> تعديل أي بيانات غير صحيحة</li>
                    </ul>
                </div>
                
                <div class="dialog-buttons">
                    <button class="btn btn-primary" onclick="this.closest('.excel-import-report').closest('.dialog-overlay').remove()">
                        <i class="fas fa-check"></i> موافق
                    </button>
                </div>
            </div>
        `;
        
        this.showDialog('تقرير استيراد Excel', reportHTML);
    }
    
    // ==============================================
    // تصدير إلى Excel
    // ==============================================
    
    async exportToExcel(options = {}) {
        if (!this.sheetJSLoaded && typeof XLSX === 'undefined') {
            Utils.showAlert('جاري تحميل مكتبة Excel...', 'info');
            await this.loadSheetJS();
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        try {
            const exportOptions = {
                includeAll: options.includeAll !== false,
                selectedColumns: options.selectedColumns || ['name', 'category', 'quantity', 'price', 'cost', 'barcode'],
                fileName: options.fileName || `منتجات_المخزون_${Utils.getToday()}`,
                format: options.format || 'xlsx'
            };
            
            // عرض خيارات التصدير إذا لم تكن محددة
            if (!options.autoConfirm) {
                const confirmed = await this.showExportOptionsDialog(exportOptions);
                if (!confirmed) return;
            }
            
            // إنشاء البيانات
            const excelData = this.prepareExcelData(exportOptions);
            
            // إنشاء ملف Excel
            this.createExcelFile(excelData, exportOptions);
            
        } catch (error) {
            console.error('خطأ في تصدير إلى Excel:', error);
            Utils.showAlert('حدث خطأ أثناء التصدير إلى Excel', 'error');
        }
    }
    
    async showExportOptionsDialog(options) {
        return new Promise((resolve) => {
            const dialogHTML = `
                <div class="excel-export-dialog">
                    <h3><i class="fas fa-file-excel text-success"></i> تصدير إلى Excel</h3>
                    
                    <div class="export-options">
                        <div class="form-group">
                            <label for="exportFileName">اسم الملف:</label>
                            <input type="text" id="exportFileName" class="form-control" 
                                   value="${options.fileName}">
                        </div>
                        
                        <div class="form-group">
                            <label for="exportFormat">تنسيق الملف:</label>
                            <select id="exportFormat" class="form-control">
                                <option value="xlsx">Excel (.xlsx)</option>
                                <option value="xls">Excel (.xls)</option>
                                <option value="csv">CSV (.csv)</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>الأعمدة المطلوبة:</label>
                            <div class="columns-checkbox">
                                <label>
                                    <input type="checkbox" name="exportColumns" value="name" checked>
                                    اسم المنتج
                                </label>
                                <label>
                                    <input type="checkbox" name="exportColumns" value="category" checked>
                                    الفئة
                                </label>
                                <label>
                                    <input type="checkbox" name="exportColumns" value="quantity" checked>
                                    الكمية
                                </label>
                                <label>
                                    <input type="checkbox" name="exportColumns" value="price" checked>
                                    سعر البيع
                                </label>
                                <label>
                                    <input type="checkbox" name="exportColumns" value="cost" checked>
                                    تكلفة الشراء
                                </label>
                                <label>
                                    <input type="checkbox" name="exportColumns" value="barcode" checked>
                                    الباركود
                                </label>
                            </div>
                        </div>
                        
                        <div class="preview-section">
                            <h5>معاينة البيانات:</h5>
                            <div class="preview-box">
                                <div style="font-family: monospace; white-space: pre; font-size: 12px;" id="excelPreview">
                                    جاري تحميل المعاينة...
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="dialog-buttons">
                        <button class="btn btn-secondary" id="cancelExcelExport">إلغاء</button>
                        <button class="btn btn-success" id="confirmExcelExport">تصدير</button>
                    </div>
                </div>
            `;
            
            const dialog = this.showDialog('تصدير إلى Excel', dialogHTML, () => {
                const fileName = document.getElementById('exportFileName').value;
                const format = document.getElementById('exportFormat').value;
                const selectedColumns = this.getSelectedExcelColumns();
                
                resolve({
                    fileName: fileName,
                    format: format,
                    selectedColumns: selectedColumns
                });
            });
            
            // تحديث المعاينة
            this.updateExcelPreview();
            
            // تحديث المعاينة عند التغيير
            document.getElementById('exportFormat').addEventListener('change', () => {
                this.updateExcelPreview();
            });
            
            document.querySelectorAll('input[name="exportColumns"]').forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    this.updateExcelPreview();
                });
            });
            
            // زر الإلغاء
            document.getElementById('cancelExcelExport')?.addEventListener('click', () => {
                dialog.remove();
                resolve(false);
            });
        });
    }
    
    getSelectedExcelColumns() {
        const columns = [];
        document.querySelectorAll('input[name="exportColumns"]:checked').forEach(checkbox => {
            columns.push(checkbox.value);
        });
        return columns;
    }
    
    updateExcelPreview() {
        const format = document.getElementById('exportFormat').value;
        const columns = this.getSelectedExcelColumns();
        const previewElement = document.getElementById('excelPreview');
        
        if (!previewElement) return;
        
        try {
            // الحصول على أول 3 منتجات للمعاينة
            const sampleProducts = System.data.inventory.slice(0, 3);
            
            // ترجمة أسماء الأعمدة
            const columnNames = {
                'name': 'اسم المنتج',
                'category': 'الفئة',
                'quantity': 'الكمية',
                'price': 'سعر البيع',
                'cost': 'تكلفة الشراء',
                'barcode': 'الباركود'
            };
            
            if (format === 'csv') {
                // معاينة CSV
                const headers = columns.map(col => columnNames[col] || col);
                const rows = sampleProducts.map(product => {
                    return columns.map(col => {
                        let value = product[col] || '';
                        // وضع القيم النصية بين علامتي اقتباس
                        if (typeof value === 'string' && value.includes(',')) {
                            value = `"${value}"`;
                        }
                        return value;
                    }).join(',');
                });
                
                previewElement.textContent = headers.join(',') + '\n' + rows.join('\n');
                
            } else {
                // معاينة جدول
                let previewHTML = '<table style="width: 100%; border-collapse: collapse;">';
                
                // رؤوس الأعمدة
                previewHTML += '<tr style="background: #f8f9fa;">';
                columns.forEach(col => {
                    previewHTML += `<th style="border: 1px solid #ddd; padding: 5px;">${columnNames[col] || col}</th>`;
                });
                previewHTML += '</tr>';
                
                // البيانات
                sampleProducts.forEach(product => {
                    previewHTML += '<tr>';
                    columns.forEach(col => {
                        const value = product[col] || '';
                        previewHTML += `<td style="border: 1px solid #ddd; padding: 5px;">${value}</td>`;
                    });
                    previewHTML += '</tr>';
                });
                
                previewHTML += '</table>';
                previewElement.innerHTML = previewHTML;
            }
            
            if (sampleProducts.length === 0) {
                previewElement.textContent = 'لا توجد بيانات لعرضها';
            }
            
        } catch (error) {
            previewElement.textContent = 'تعذر تحميل المعاينة';
        }
    }
    
    prepareExcelData(options) {
        const products = System.data.inventory;
        const selectedColumns = options.selectedColumns || ['name', 'category', 'quantity', 'price', 'cost', 'barcode'];
        
        // ترجمة أسماء الأعمدة للعربية
        const columnTranslations = {
            'name': 'اسم المنتج',
            'category': 'الفئة',
            'quantity': 'الكمية',
            'price': 'سعر البيع',
            'cost': 'تكلفة الشراء',
            'barcode': 'الباركود'
        };
        
        // تحضير رؤوس الأعمدة
        const headers = selectedColumns.map(col => columnTranslations[col] || col);
        
        // تحضير البيانات
        const data = [headers];
        
        products.forEach(product => {
            const row = selectedColumns.map(col => {
                let value = product[col];
                
                // تنسيق القيم
                if (value === undefined || value === null) {
                    value = '';
                } else if (col === 'quantity') {
                    value = Number(value);
                } else if (col === 'price' || col === 'cost') {
                    value = Number(value);
                }
                
                return value;
            });
            
            data.push(row);
        });
        
        return data;
    }
    
    createExcelFile(data, options) {
        try {
            // إنشاء ورقة عمل
            const ws = XLSX.utils.aoa_to_sheet(data);
            
            // تنسيق الأعمدة (جعلها أوسع)
            const wscols = data[0].map(() => ({ wch: 20 }));
            ws['!cols'] = wscols;
            
            // إنشاء مصنف
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'منتجات المخزون');
            
            // كتابة الملف
            const fileName = `${options.fileName}.${options.format}`;
            XLSX.writeFile(wb, fileName);
            
            Utils.showAlert(`تم تصدير ${System.data.inventory.length} منتج إلى ${fileName}`, 'success');
            
        } catch (error) {
            console.error('خطأ في إنشاء ملف Excel:', error);
            throw error;
        }
    }
    
    // ==============================================
    // أدوات مساعدة
    // ==============================================
    
    showDialog(title, content, confirmCallback = null) {
        const dialog = document.createElement('div');
        dialog.className = 'dialog-overlay excel-dialog-overlay';
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            padding: 20px;
        `;
        
        dialog.innerHTML = `
            <div class="dialog excel-dialog" style="
                background: white;
                padding: 25px;
                border-radius: 10px;
                max-width: 800px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 5px 25px rgba(0,0,0,0.2);
            ">
                <div class="dialog-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #28a745;
                ">
                    <h3 style="margin: 0; color: #2c3e50;">
                        <i class="fas fa-file-excel"></i> ${title}
                    </h3>
                    <button class="close-dialog" style="
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        color: #666;
                    ">&times;</button>
                </div>
                
                ${content}
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // حدث الإغلاق
        dialog.querySelector('.close-dialog').addEventListener('click', () => {
            dialog.remove();
        });
        
        // إغلاق بالنقر خارج المحتوى
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
            }
        });
        
        // زر التأكيد
        const confirmBtn = dialog.querySelector('#confirmExcelImport, #confirmExcelExport');
        if (confirmBtn && confirmCallback) {
            confirmBtn.addEventListener('click', () => {
                const result = confirmCallback();
                if (result !== false) {
                    dialog.remove();
                }
            });
        }
        
        return dialog;
    }
    
    // ==============================================
    // وظائف سريعة للوصول
    // ==============================================
    
    quickExportExcel() {
        this.exportToExcel({
            autoConfirm: true,
            fileName: `منتجات_المخزون_${Utils.getToday()}`,
            format: 'xlsx'
        });
    }
    
    downloadTemplate() {
        const templateData = [
            ['اسم المنتج', 'الفئة', 'الكمية', 'سعر البيع', 'تكلفة الشراء', 'الباركود'],
            ['منتج مثال 1', 'الكترونيات', '10', '100.00', '70.00', '880123456789'],
            ['منتج مثال 2', 'ملابس', '20', '50.00', '30.00', '880987654321'],
            ['منتج مثال 3', 'أدوات', '15', '80.00', '55.00', '880456123789'],
            ['منتج مثال 4', 'أغذية', '30', '25.00', '15.00', '880789123456']
        ];
        
        try {
            if (typeof XLSX === 'undefined') {
                Utils.showAlert('جاري تحميل مكتبة Excel...', 'info');
                setTimeout(() => this.downloadTemplate(), 1000);
                return;
            }
            
            // إنشاء ورقة عمل
            const ws = XLSX.utils.aoa_to_sheet(templateData);
            
            // تنسيق الأعمدة
            const wscols = templateData[0].map(() => ({ wch: 20 }));
            ws['!cols'] = wscols;
            
            // إنشاء مصنف
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'قالب المنتجات');
            
            // كتابة الملف
            XLSX.writeFile(wb, 'قالب_استيراد_المنتجات.xlsx');
            
            // عرض تعليمات
            this.showTemplateInstructions();
            
        } catch (error) {
            console.error('خطأ في إنشاء القالب:', error);
            Utils.showAlert('حدث خطأ أثناء إنشاء القالب', 'error');
        }
    }
    
    showTemplateInstructions() {
        const instructionsHTML = `
            <div class="template-instructions">
                <h3><i class="fas fa-file-excel"></i> تعليمات استخدام قالب Excel</h3>
                
                <div class="steps">
                    <div class="step">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h5>تحميل القالب</h5>
                            <p>تم تحميل ملف <strong>قالب_استيراد_المنتجات.xlsx</strong></p>
                            <p>افتح الملف باستخدام Microsoft Excel أو Google Sheets</p>
                        </div>
                    </div>
                    
                    <div class="step">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <h5>ملء البيانات</h5>
                            <p>املأ البيانات حسب الأعمدة التالية:</p>
                            <ul>
                                <li><strong>اسم المنتج:</strong> اسم المنتج (مطلوب)</li>
                                <li><strong>الفئة:</strong> فئة المنتج</li>
                                <li><strong>الكمية:</strong> الكمية المتاحة (رقم)</li>
                                <li><strong>سعر البيع:</strong> سعر بيع المنتج (رقم)</li>
                                <li><strong>تكلفة الشراء:</strong> تكلفة الشراء (رقم)</li>
                                <li><strong>الباركود:</strong> باركود المنتج (اختياري)</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="step">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <h5>حفظ الملف</h5>
                            <p>احفظ الملف بصيغة Excel (.xlsx)</p>
                            <p>ارجع إلى صفحة المخزون</p>
                            <p>اختر الملف وابدأ الاستيراد</p>
                        </div>
                    </div>
                </div>
                
                <div class="alert alert-info">
                    <i class="fas fa-lightbulb"></i>
                    <strong>نصائح:</strong>
                    <ul>
                        <li>يمكنك حذف الأسطر التي تحتوي على "منتج مثال"</li>
                        <li>اسم المنتج هو العمود الوحيد المطلوب</li>
                        <li>يمكن ترك الحقول الأخرى فارغة</li>
                        <li>يمكن تغيير أسماء الأعمدة للعربية أو الإنجليزية</li>
                    </ul>
                </div>
                
                <div class="dialog-buttons">
                    <button class="btn btn-primary" onclick="this.closest('.template-instructions').closest('.dialog-overlay').remove()">
                        فهمت
                    </button>
                </div>
            </div>
        `;
        
        this.showDialog('تعليمات القالب', instructionsHTML);
    }
}

// إنشاء نسخة واحدة من النظام
window.excelImportExport = new ExcelImportExport();

// في نهاية الملف
// تهيئة تلقائية عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (!window.excelImportExport) {
            window.excelImportExport = new ExcelImportExport();
            window.excelImportExport.init();
            console.log('تم تهيئة نظام Excel تلقائياً');
        }
    }, 2000);
});
