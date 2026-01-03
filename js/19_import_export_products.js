// ============================================================================
// نظام استيراد وتصدير المنتجات
// ============================================================================

class ProductImportExport {
    constructor() {
        this.supportedFormats = {
            'json': 'JSON',
            'csv': 'CSV',
            'excel': 'Excel (CSV)'
        };
    }
    
    init() {
        this.bindEvents();
        this.initExportOptions();
    }
    
    bindEvents() {
        // زر تصدير المنتجات
        document.getElementById('exportProductsBtn')?.addEventListener('click', () => {
            this.showExportDialog();
        });
        
        // زر استيراد المنتجات
        document.getElementById('importProductsBtn')?.addEventListener('click', () => {
            this.showImportDialog();
        });
        
        // استيراد من ملف
        document.getElementById('importProductsFile')?.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleImportFile(e.target.files[0]);
            }
        });
    }
    
    initExportOptions() {
        const formatSelect = document.getElementById('exportFormat');
        if (formatSelect) {
            formatSelect.innerHTML = '';
            
            Object.entries(this.supportedFormats).forEach(([format, name]) => {
                const option = document.createElement('option');
                option.value = format;
                option.textContent = name;
                formatSelect.appendChild(option);
            });
        }
    }
    
    // ==============================================
    // تصدير المنتجات
    // ==============================================
    
    showExportDialog() {
        const dialogHTML = `
            <div class="import-export-dialog">
                <h3><i class="fas fa-download"></i> تصدير المنتجات</h3>
                
                <div class="form-group">
                    <label for="exportFormat">نوع الملف:</label>
                    <select id="exportFormat" class="form-control">
                        <option value="json">JSON</option>
                        <option value="csv">CSV</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="exportColumns">الأعمدة المطلوبة:</label>
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
                            سعر التكلفة
                        </label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="exportFileName">اسم الملف:</label>
                    <input type="text" id="exportFileName" class="form-control" 
                           value="منتجات_${Utils.getToday()}">
                </div>
                
                <div class="preview-section">
                    <h5>معاينة البيانات:</h5>
                    <div class="preview-box">
                        <pre id="exportPreview"></pre>
                    </div>
                </div>
                
                <div class="dialog-buttons">
                    <button class="btn btn-secondary" id="cancelExport">إلغاء</button>
                    <button class="btn btn-primary" id="confirmExport">تصدير</button>
                </div>
            </div>
        `;
        
        this.showDialog('تصدير المنتجات', dialogHTML, () => {
            const format = document.getElementById('exportFormat').value;
            const fileName = document.getElementById('exportFileName').value;
            const selectedColumns = this.getSelectedColumns();
            
            this.exportProducts(format, fileName, selectedColumns);
        });
        
        // تحديث المعاينة
        this.updateExportPreview();
        
        // تحديث المعاينة عند تغيير الإعدادات
        document.getElementById('exportFormat').addEventListener('change', () => {
            this.updateExportPreview();
        });
        
        document.querySelectorAll('input[name="exportColumns"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateExportPreview();
            });
        });
    }
    
    getSelectedColumns() {
        const columns = [];
        document.querySelectorAll('input[name="exportColumns"]:checked').forEach(checkbox => {
            columns.push(checkbox.value);
        });
        return columns;
    }
    
    updateExportPreview() {
        const format = document.getElementById('exportFormat').value;
        const columns = this.getSelectedColumns();
        
        if (format === 'json') {
            this.updateJSONPreview(columns);
        } else if (format === 'csv') {
            this.updateCSVPreview(columns);
        }
    }
    
    updateJSONPreview(columns) {
        const previewData = this.getPreviewData(columns);
        const previewElement = document.getElementById('exportPreview');
        
        if (previewElement) {
            previewElement.textContent = JSON.stringify(previewData, null, 2).substring(0, 300) + '...';
        }
    }
    
    updateCSVPreview(columns) {
        const previewData = this.getPreviewData(columns);
        const previewElement = document.getElementById('exportPreview');
        
        if (previewElement) {
            // رؤوس الأعمدة
            const headers = columns.map(col => this.getColumnName(col)).join(',');
            
            // البيانات
            const rows = previewData.map(item => {
                return columns.map(col => `"${item[col]}"`).join(',');
            }).join('\n');
            
            previewElement.textContent = headers + '\n' + rows;
        }
    }
    
    getPreviewData(columns) {
        // الحصول على أول 3 منتجات للمعاينة
        const sampleProducts = System.data.inventory.slice(0, 3);
        
        return sampleProducts.map(product => {
            const data = {};
            columns.forEach(col => {
                switch(col) {
                    case 'name':
                        data[col] = product.name;
                        break;
                    case 'category':
                        data[col] = product.category;
                        break;
                    case 'quantity':
                        data[col] = product.quantity;
                        break;
                    case 'price':
                        data[col] = product.price || 0;
                        break;
                    case 'cost':
                        data[col] = product.cost || 0;
                        break;
                }
            });
            return data;
        });
    }
    
    getColumnName(column) {
        const columnNames = {
            'name': 'اسم المنتج',
            'category': 'الفئة',
            'quantity': 'الكمية',
            'price': 'سعر البيع',
            'cost': 'سعر التكلفة'
        };
        return columnNames[column] || column;
    }
    
    async exportProducts(format, fileName, columns) {
        try {
            const data = this.prepareExportData(columns);
            let content, mimeType, fileExtension;
            
            if (format === 'json') {
                content = JSON.stringify(data, null, 2);
                mimeType = 'application/json';
                fileExtension = 'json';
            } else if (format === 'csv') {
                content = this.convertToCSV(data, columns);
                mimeType = 'text/csv';
                fileExtension = 'csv';
            }
            
            // تنزيل الملف
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName}.${fileExtension}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            Utils.showAlert('تم تصدير المنتجات بنجاح', 'success');
            
        } catch (error) {
            console.error('خطأ في تصدير المنتجات:', error);
            Utils.showAlert('حدث خطأ أثناء تصدير المنتجات', 'error');
        }
    }
    
    prepareExportData(columns) {
        const exportData = {
            exportInfo: {
                date: new Date().toISOString(),
                format: 'منتجات المخزون',
                productCount: System.data.inventory.length,
                exportedColumns: columns
            },
            products: System.data.inventory.map(product => {
                const productData = {};
                
                columns.forEach(col => {
                    switch(col) {
                        case 'name':
                            productData[col] = product.name;
                            break;
                        case 'category':
                            productData[col] = product.category;
                            break;
                        case 'quantity':
                            productData[col] = product.quantity;
                            break;
                        case 'price':
                            productData[col] = product.price || 0;
                            break;
                        case 'cost':
                            productData[col] = product.cost || 0;
                            break;
                    }
                });
                
                return productData;
            })
        };
        
        return exportData;
    }
    
    convertToCSV(data, columns) {
        const products = data.products;
        
        // رؤوس الأعمدة
        const headers = columns.map(col => this.getColumnName(col)).join(',');
        
        // البيانات
        const rows = products.map(product => {
            return columns.map(col => {
                const value = product[col];
                // وضع القيم النصية بين علامتي اقتباس
                return typeof value === 'string' ? `"${value}"` : value;
            }).join(',');
        });
        
        return headers + '\n' + rows.join('\n');
    }
    
    // ==============================================
    // استيراد المنتجات
    // ==============================================
    
    showImportDialog() {
        const dialogHTML = `
            <div class="import-export-dialog">
                <h3><i class="fas fa-upload"></i> استيراد المنتجات</h3>
                
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    <strong>طرق الاستيراد المتاحة:</strong>
                </div>
                
                <div class="import-methods">
                    <div class="import-method">
                        <h5><i class="fas fa-file-upload"></i> رفع ملف</h5>
                        <p>اختر ملف المنتجات من جهازك</p>
                        <div class="file-upload-area">
                            <input type="file" id="productsFile" accept=".json,.csv,.txt" style="display: none;">
                            <label for="productsFile" class="btn btn-primary">
                                <i class="fas fa-upload"></i> اختر ملف
                            </label>
                            <small class="text-muted">يدعم JSON و CSV</small>
                        </div>
                    </div>
                    
                    <div class="import-method">
                        <h5><i class="fas fa-paste"></i> لصق البيانات</h5>
                        <p>الصق بيانات المنتجات مباشرة</p>
                        <button class="btn btn-success" onclick="productImportExport.showPasteDataDialog()">
                            <i class="fas fa-paste"></i> لصق البيانات
                        </button>
                    </div>
                    
                    <div class="import-method">
                        <h5><i class="fas fa-table"></i> استيرال من قالب</h5>
                        <p>استخدم قالب Excel أو CSV</p>
                        <button class="btn btn-info" onclick="productImportExport.downloadTemplate()">
                            <i class="fas fa-download"></i> تحميل قالب
                        </button>
                    </div>
                </div>
                
                <div class="import-options">
                    <h5>خيارات الاستيراد:</h5>
                    <div class="form-group">
                        <label>
                            <input type="radio" name="importMode" value="add" checked>
                            إضافة المنتجات فقط
                        </label>
                        <small class="text-muted">(إضافة منتجات جديدة دون حذف المنتجات الحالية)</small>
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input type="radio" name="importMode" value="replace">
                            استبدال جميع المنتجات
                        </label>
                        <small class="text-muted">(حذف جميع المنتجات الحالية واستبدالها بالمنتجات الجديدة)</small>
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input type="radio" name="importMode" value="update">
                            تحديث المنتجات الحالية
                        </label>
                        <small class="text-muted">(تحديث المنتجات الموجودة وإضافة الجديدة)</small>
                    </div>
                </div>
                
                <div class="dialog-buttons">
                    <button class="btn btn-secondary" id="cancelImport">إلغاء</button>
                </div>
            </div>
        `;
        
        this.showDialog('استيراد المنتجات', dialogHTML);
        
        // إضافة حدث لرفع الملف
        const fileInput = document.getElementById('productsFile');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleImportFile(e.target.files[0]);
                }
            });
        }
    }
    
    showPasteDataDialog() {
        const dialogHTML = `
            <div class="paste-data-dialog">
                <h3><i class="fas fa-paste"></i> لصق بيانات المنتجات</h3>
                
                <div class="form-group">
                    <label for="dataFormat">تنسيق البيانات:</label>
                    <select id="dataFormat" class="form-control">
                        <option value="auto">تحديد تلقائي</option>
                        <option value="json">JSON</option>
                        <option value="csv">CSV</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="pasteData">البيانات:</label>
                    <textarea id="pasteData" class="form-control" rows="10" 
                              placeholder="الصق بيانات المنتجات هنا..."></textarea>
                </div>
                
                <div class="preview-section">
                    <h5>معاينة البيانات:</h5>
                    <div class="preview-box">
                        <pre id="pastePreview"></pre>
                    </div>
                </div>
                
                <div class="dialog-buttons">
                    <button class="btn btn-secondary" id="cancelPaste">إلغاء</button>
                    <button class="btn btn-primary" id="confirmPaste">استيراد</button>
                </div>
            </div>
        `;
        
        this.showDialog('لصق بيانات المنتجات', dialogHTML, () => {
            const pasteText = document.getElementById('pasteData').value;
            const format = document.getElementById('dataFormat').value;
            
            if (!pasteText.trim()) {
                Utils.showAlert('يرجى لصق بيانات المنتجات', 'error');
                return;
            }
            
            this.processPasteData(pasteText, format);
        });
        
        // تحديث المعاينة أثناء الكتابة
        const pasteTextarea = document.getElementById('pasteData');
        if (pasteTextarea) {
            pasteTextarea.addEventListener('input', () => {
                this.updatePastePreview();
            });
        }
    }
    
    updatePastePreview() {
        const pasteText = document.getElementById('pasteData').value;
        const format = document.getElementById('dataFormat').value;
        const previewElement = document.getElementById('pastePreview');
        
        if (!previewElement || !pasteText) return;
        
        try {
            if (format === 'json' || (format === 'auto' && pasteText.trim().startsWith('{'))) {
                const data = JSON.parse(pasteText.substring(0, 500));
                previewElement.textContent = JSON.stringify(data, null, 2) + '...';
            } else if (format === 'csv' || (format === 'auto' && pasteText.includes(','))) {
                const lines = pasteText.split('\n').slice(0, 5);
                previewElement.textContent = lines.join('\n');
                if (pasteText.split('\n').length > 5) {
                    previewElement.textContent += '\n...';
                }
            }
        } catch (error) {
            previewElement.textContent = 'تعذر تحليل البيانات';
        }
    }
    
    async handleImportFile(file) {
        try {
            const fileContent = await this.readFile(file);
            const importMode = document.querySelector('input[name="importMode"]:checked').value;
            
            this.processImportData(fileContent, file.name, importMode);
            
        } catch (error) {
            console.error('خطأ في قراءة الملف:', error);
            Utils.showAlert('تعذر قراءة الملف', 'error');
        }
    }
    
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('تعذر قراءة الملف'));
            
            reader.readAsText(file);
        });
    }
    
    async processImportData(content, fileName, importMode) {
        try {
            let products;
            
            // تحديد نوع الملف
            if (fileName.toLowerCase().endsWith('.json') || content.trim().startsWith('{')) {
                products = this.parseJSONData(content);
            } else if (fileName.toLowerCase().endsWith('.csv') || content.includes(',')) {
                products = this.parseCSVData(content);
            } else {
                Utils.showAlert('تنسيق الملف غير مدعوم', 'error');
                return;
            }
            
            if (!products || products.length === 0) {
                Utils.showAlert('لم يتم العثور على منتجات في الملف', 'error');
                return;
            }
            
            await this.confirmImport(products, importMode);
            
        } catch (error) {
            console.error('خطأ في معالجة البيانات:', error);
            Utils.showAlert('تعذر معالجة بيانات الملف', 'error');
        }
    }
    
    async processPasteData(content, format) {
        try {
            let products;
            
            if (format === 'json' || (format === 'auto' && content.trim().startsWith('{'))) {
                products = this.parseJSONData(content);
            } else if (format === 'csv' || (format === 'auto' && content.includes(','))) {
                products = this.parseCSVData(content);
            } else {
                Utils.showAlert('تنسيق البيانات غير مدعوم', 'error');
                return;
            }
            
            if (!products || products.length === 0) {
                Utils.showAlert('لم يتم العثور على منتجات في البيانات', 'error');
                return;
            }
            
            const importMode = document.querySelector('input[name="importMode"]:checked').value;
            await this.confirmImport(products, importMode);
            
        } catch (error) {
            console.error('خطأ في معالجة البيانات:', error);
            Utils.showAlert('تعذر معالجة البيانات', 'error');
        }
    }
    
    parseJSONData(content) {
        const data = JSON.parse(content);
        
        // دعم تنسيقات مختلفة
        if (Array.isArray(data)) {
            return data;
        } else if (data.products && Array.isArray(data.products)) {
            return data.products;
        } else if (data.data && Array.isArray(data.data)) {
            return data.data;
        } else {
            throw new Error('تنسيق JSON غير مدعوم');
        }
    }
    
    parseCSVData(content) {
        const lines = content.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) {
            throw new Error('ملف CSV يجب أن يحتوي على رؤوس أعمدة وبيانات');
        }
        
        // تحليل رؤوس الأعمدة
        const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
        
        // تحويل رؤوس الأعمدة العربية إلى إنجليزية
        const headerMapping = {
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
            'التكلفة': 'cost'
        };
        
        const mappedHeaders = headers.map(header => headerMapping[header] || header);
        
        // تحليل البيانات
        const products = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            const product = {};
            
            mappedHeaders.forEach((header, index) => {
                if (values[index] !== undefined) {
                    const value = values[index].trim().replace(/"/g, '');
                    
                    switch(header) {
                        case 'name':
                        case 'category':
                            product[header] = value;
                            break;
                        case 'quantity':
                        case 'price':
                        case 'cost':
                            product[header] = parseFloat(value) || 0;
                            break;
                        default:
                            product[header] = value;
                    }
                }
            });
            
            // التأكد من وجود الاسم
            if (product.name && product.name.trim() !== '') {
                products.push(product);
            }
        }
        
        return products;
    }
    
    parseCSVLine(line) {
        const values = [];
        let currentValue = '';
        let insideQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"' && !insideQuotes) {
                insideQuotes = true;
            } else if (char === '"' && insideQuotes && nextChar === '"') {
                currentValue += '"';
                i++; // تخطي الاقتباس المزدوج
            } else if (char === '"' && insideQuotes) {
                insideQuotes = false;
            } else if (char === ',' && !insideQuotes) {
                values.push(currentValue);
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        
        values.push(currentValue);
        return values;
    }
    
    async confirmImport(products, importMode) {
        const productCount = products.length;
        
        const confirmed = await Utils.confirmDialog(
            'تأكيد استيراد المنتجات',
            `هل تريد استيراد ${productCount} منتج؟
            <br><strong>وضع الاستيراد:</strong> ${this.getImportModeText(importMode)}
            <br><strong>عدد المنتجات:</strong> ${productCount}
            <br><br>سيتم ${this.getImportModeDescription(importMode)}`,
            'استيراد',
            'إلغاء'
        );
        
        if (!confirmed) return;
        
        // تنفيذ الاستيراد
        this.executeImport(products, importMode);
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
    
    executeImport(importedProducts, importMode) {
        try {
            let newInventory;
            
            switch(importMode) {
                case 'add':
                    // إضافة المنتجات الجديدة فقط
                    newInventory = [...System.data.inventory];
                    importedProducts.forEach(product => {
                        if (!newInventory.find(p => p.name === product.name)) {
                            newInventory.push({
                                id: Utils.generateId(newInventory),
                                name: product.name,
                                category: product.category || 'غير مصنف',
                                quantity: product.quantity || 0,
                                price: product.price || 0,
                                cost: product.cost || 0
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
                        cost: product.cost || 0
                    }));
                    break;
                    
                case 'update':
                    // تحديث المنتجات الحالية وإضافة الجديدة
                    newInventory = [...System.data.inventory];
                    
                    importedProducts.forEach(importedProduct => {
                        const existingProduct = newInventory.find(p => p.name === importedProduct.name);
                        
                        if (existingProduct) {
                            // تحديث المنتج الموجود
                            if (importedProduct.category) existingProduct.category = importedProduct.category;
                            if (importedProduct.quantity !== undefined) existingProduct.quantity = importedProduct.quantity;
                            if (importedProduct.price !== undefined) existingProduct.price = importedProduct.price;
                            if (importedProduct.cost !== undefined) existingProduct.cost = importedProduct.cost;
                        } else {
                            // إضافة منتج جديد
                            newInventory.push({
                                id: Utils.generateId(newInventory),
                                name: importedProduct.name,
                                category: importedProduct.category || 'غير مصنف',
                                quantity: importedProduct.quantity || 0,
                                price: importedProduct.price || 0,
                                cost: importedProduct.cost || 0
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
            this.showImportReport(importedProducts.length);
            
        } catch (error) {
            console.error('خطأ في استيراد المنتجات:', error);
            Utils.showAlert('حدث خطأ أثناء استيراد المنتجات', 'error');
        }
    }
    
    showImportReport(importedCount) {
        const currentCount = System.data.inventory.length;
        
        const reportHTML = `
            <div class="import-report">
                <h3><i class="fas fa-check-circle text-success"></i> تم الاستيراد بنجاح!</h3>
                
                <div class="report-details">
                    <div class="report-item">
                        <i class="fas fa-box"></i>
                        <div>
                            <strong>عدد المنتجات المستوردة:</strong>
                            <span class="number">${importedCount}</span>
                        </div>
                    </div>
                    
                    <div class="report-item">
                        <i class="fas fa-database"></i>
                        <div>
                            <strong>إجمالي المنتجات في المخزون:</strong>
                            <span class="number">${currentCount}</span>
                        </div>
                    </div>
                </div>
                
                <div class="alert alert-success">
                    <i class="fas fa-info-circle"></i>
                    يمكنك الآن:
                    <ul>
                        <li>مراجعة المنتجات في قسم المخزون</li>
                        <li>استخدام المنتجات في عمليات البيع</li>
                        <li>تعديل أي معلومات غير صحيحة</li>
                    </ul>
                </div>
                
                <div class="dialog-buttons">
                    <button class="btn btn-primary" onclick="this.closest('.import-report').closest('.dialog-overlay').remove()">
                        موافق
                    </button>
                </div>
            </div>
        `;
        
        this.showDialog('تقرير الاستيراد', reportHTML);
    }
    
    // ==============================================
    // قوالب التصدير
    // ==============================================
    
    downloadTemplate() {
        const templateData = [
            {
                'اسم المنتج': 'منتج مثال 1',
                'الفئة': 'الكترونيات',
                'الكمية': '10',
                'سعر البيع': '100',
                'سعر التكلفة': '70'
            },
            {
                'اسم المنتج': 'منتج مثال 2',
                'الفئة': 'ملابس',
                'الكمية': '20',
                'سعر البيع': '50',
                'سعر التكلفة': '30'
            },
            {
                'اسم المنتج': 'منتج مثال 3',
                'الفئة': 'أدوات',
                'الكمية': '15',
                'سعر البيع': '80',
                'سعر التكلفة': '55'
            }
        ];
        
        // تحويل إلى CSV
        const headers = ['اسم المنتج', 'الفئة', 'الكمية', 'سعر البيع', 'سعر التكلفة'];
        const csvContent = [
            headers.join(','),
            ...templateData.map(row => headers.map(header => row[header]).join(','))
        ].join('\n');
        
        // تنزيل القالب
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'قالب_المنتجات.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        // عرض تعليمات
        this.showTemplateInstructions();
    }
    
    showTemplateInstructions() {
        const instructionsHTML = `
            <div class="template-instructions">
                <h3><i class="fas fa-file-excel"></i> تعليمات استخدام القالب</h3>
                
                <div class="steps">
                    <div class="step">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h5>تحميل القالب</h5>
                            <p>تم تحميل ملف <strong>قالب_المنتجات.csv</strong></p>
                            <p>افتح الملف باستخدام Excel أو أي برنامج جداول</p>
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
                                <li><strong>الكمية:</strong> الكمية المتاحة</li>
                                <li><strong>سعر البيع:</strong> سعر بيع المنتج</li>
                                <li><strong>سعر التكلفة:</strong> تكلفة الشراء</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="step">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <h5>حفظ الملف</h5>
                            <p>احفظ الملف بصيغة CSV</p>
                            <p>ارجع إلى صفحة الاستيراد</p>
                            <p>اختر الملف وابدأ الاستيراد</p>
                        </div>
                    </div>
                </div>
                
                <div class="alert alert-info">
                    <i class="fas fa-lightbulb"></i>
                    <strong>نصائح:</strong>
                    <ul>
                        <li>يمكنك حذف الأسطر التي تحتوي على "منتج مثال"</li>
                        <li>الاسم هو العمود الوحيد المطلوب</li>
                        <li>يمكن ترك الحقول الأخرى فارغة</li>
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
    
    // ==============================================
    // أدوات مساعدة
    // ==============================================
    
    showDialog(title, content, confirmCallback = null) {
        const dialog = document.createElement('div');
        dialog.className = 'dialog-overlay import-export-overlay';
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
            <div class="dialog import-export-dialog" style="
                background: white;
                padding: 25px;
                border-radius: 10px;
                max-width: 700px;
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
                    border-bottom: 2px solid #3498db;
                ">
                    <h3 style="margin: 0; color: #2c3e50;">
                        <i class="fas fa-exchange-alt"></i> ${title}
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
        
        // إضافة أحداث للأزرار
        const cancelButtons = dialog.querySelectorAll('#cancelExport, #cancelImport, #cancelPaste');
        cancelButtons.forEach(button => {
            button?.addEventListener('click', () => {
                dialog.remove();
            });
        });
        
        // زر التأكيد
        const confirmButtons = dialog.querySelectorAll('#confirmExport, #confirmPaste');
        confirmButtons.forEach(button => {
            button?.addEventListener('click', () => {
                if (confirmCallback) confirmCallback();
                dialog.remove();
            });
        });
        
        return dialog;
    }
}

// إنشاء نسخة واحدة من النظام
window.productImportExport = new ProductImportExport();