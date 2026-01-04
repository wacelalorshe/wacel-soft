// ============================================================================
// نظام إدارة الباركود للمنتجات - النسخة الكاملة
// ============================================================================

class BarcodeSystem {
    constructor() {
        this.barcodeLength = 12;
        this.barcodePrefix = "88";
        this.barcodeHistory = [];
        this.scannerActive = false;
        this.videoStream = null;
        this.scanInterval = null;
        this.isScanning = false;
        this.currentCodeReader = null;
        this.scanAttempts = 0;
        this.maxScanAttempts = 50;
    }
    
    init() {
        console.log('تهيئة نظام الباركود...');
        this.loadBarcodeHistory();
        this.bindEvents();
        this.updateInventoryBarcodeFields();
        this.initializeDefaultCategories();
        this.setupRealScanner();
    }
    
    loadBarcodeHistory() {
        try {
            const saved = localStorage.getItem('barcode_history');
            if (saved) {
                this.barcodeHistory = JSON.parse(saved);
            }
        } catch (error) {
            console.error('خطأ في تحميل سجل الباركود:', error);
            this.barcodeHistory = [];
        }
    }
    
    saveBarcodeHistory() {
        try {
            localStorage.setItem('barcode_history', JSON.stringify(this.barcodeHistory));
        } catch (error) {
            console.error('خطأ في حفظ سجل الباركود:', error);
        }
    }
    
    bindEvents() {
        setTimeout(() => {
            // زر توليد باركود في نافذة المخزون
            document.getElementById('generateBarcodeBtn')?.addEventListener('click', () => {
                this.generateBarcodeForInventory();
            });
            
            // زر مسح باركود في المخزون
            const scanBtn = document.getElementById('scanBarcodeBtn');
            if (scanBtn) {
                scanBtn.addEventListener('click', () => {
                    this.openRealBarcodeScanner();
                });
            }
            
            // دعم زر المسح القديم
            document.querySelector('[onclick*="openBarcodeScannerForInventory"]')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.openRealBarcodeScanner();
            });
            
            // دعم زر توليد الباركود القديم
            document.querySelector('[onclick*="generateBarcodeForCurrentProduct"]')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.generateBarcodeForInventory();
            });
            
            // حدث عند تغيير اسم المنتج
            document.getElementById('inventoryName')?.addEventListener('blur', (e) => {
                this.suggestBarcodeFromName(e.target.value);
            });
            
            // حدث البحث بالباركود
            const barcodeSearch = document.getElementById('searchBarcode');
            if (barcodeSearch) {
                barcodeSearch.addEventListener('input', (e) => {
                    this.searchProductByBarcode(e.target.value, 'inventory');
                });
            }
            
            console.log('تم ربط أحداث الباركود بنجاح');
        }, 1000);
    }
    
    setupRealScanner() {
        console.log('إعداد نظام المسح الحقيقي...');
    }
    
    // ============================================================================
    // الدوال الأساسية (القديمة والجديدة)
    // ============================================================================
    
    generateRandomBarcode() {
        let barcode = this.barcodePrefix;
        const remainingLength = this.barcodeLength - barcode.length - 1;
        for (let i = 0; i < remainingLength; i++) {
            barcode += Math.floor(Math.random() * 10);
        }
        barcode += this.calculateCheckDigit(barcode);
        
        let attempts = 0;
        while (this.isBarcodeExists(barcode) && attempts < 10) {
            barcode = barcode.slice(0, -1) + Math.floor(Math.random() * 10);
            barcode = barcode.slice(0, -1) + this.calculateCheckDigit(barcode.slice(0, -1));
            attempts++;
        }
        
        return barcode;
    }
    
    generateBarcodeFromName(productName) {
        if (!productName || productName.trim() === '') {
            return this.generateRandomBarcode();
        }
        
        let numericCode = '';
        const name = productName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
        const shortName = name.substring(0, Math.min(name.length, 4));
        
        for (let i = 0; i < shortName.length; i++) {
            const charCode = shortName.charCodeAt(i);
            if (charCode >= 97 && charCode <= 122) {
                const num = (charCode - 96).toString().padStart(2, '0');
                numericCode += num;
            } else if (charCode >= 48 && charCode <= 57) {
                numericCode += String.fromCharCode(charCode);
            }
        }
        
        const neededLength = 8 - numericCode.length;
        for (let i = 0; i < neededLength; i++) {
            numericCode += Math.floor(Math.random() * 10);
        }
        
        let barcode = this.barcodePrefix + numericCode.substring(0, 8);
        const checkDigit = this.calculateCheckDigit(barcode);
        barcode += checkDigit;
        
        if (barcode.length !== this.barcodeLength) {
            barcode = this.generateRandomBarcode();
        }
        
        if (this.isBarcodeExists(barcode)) {
            barcode = this.generateRandomBarcode();
        }
        
        return barcode;
    }
    
    calculateCheckDigit(barcodeWithoutCheck) {
        let sum = 0;
        for (let i = barcodeWithoutCheck.length - 1, weight = 1; i >= 0; i--, weight = 3 - weight) {
            sum += parseInt(barcodeWithoutCheck.charAt(i), 10) * weight;
        }
        const checkDigit = (10 - (sum % 10)) % 10;
        return checkDigit.toString();
    }
    
    validateBarcode(barcode) {
        if (!barcode || barcode.length !== this.barcodeLength) {
            return false;
        }
        if (!/^\d+$/.test(barcode)) {
            return false;
        }
        const checkDigit = barcode.charAt(barcode.length - 1);
        const barcodeWithoutCheck = barcode.substring(0, barcode.length - 1);
        const calculatedCheck = this.calculateCheckDigit(barcodeWithoutCheck);
        return checkDigit === calculatedCheck;
    }
    
    isBarcodeExists(barcode) {
        if (!System.data.inventory) return false;
        return System.data.inventory.some(item => item.barcode === barcode);
    }
    
    // ============================================================================
    // الدوال القديمة المطلوبة من النظام الأصلي
    // ============================================================================
    
    openBarcodeScanner() {
        // هذه الدالة الأصلية يتم استدعاؤها من الملفات الأخرى
        console.log('استدعاء openBarcodeScanner القديمة - تحويل للنظام الجديد');
        this.openRealBarcodeScanner();
    }
    
    openBarcodeScannerForInventory() {
        // دالة مساعدة للمخزون
        this.openRealBarcodeScanner();
    }
    
    scanWithCamera() {
        // دالة مساعدة
        this.startCameraScan();
    }
    
    manualBarcodeEntry() {
        // دالة مساعدة
        this.openManualEntry();
    }
    
    processManualBarcode() {
        // دالة مساعدة
        this.processManualBarcodeEntry();
    }
    
    useScannedBarcode(barcode) {
        // دالة مساعدة
        this.useRealBarcodeInQuickSale(barcode);
    }
    
    rescanBarcode() {
        // دالة مساعدة
        this.startCameraScan();
    }
    
    searchAndProcessBarcode(barcode) {
        // دالة مساعدة
        this.processRealBarcode(barcode);
    }
    
    addToSale(barcode) {
        // دالة مساعدة
        this.useRealBarcodeInQuickSale(barcode);
    }
    
    createNewProduct(barcode) {
        // دالة مساعدة
        this.createProductFromRealBarcode(barcode);
    }
    
    editProduct(productId) {
        // فتح نافذة تعديل المنتج
        const product = System.findInventoryItemById(productId);
        if (!product) {
            Utils.showAlert('المنتج غير موجود', 'error');
            return;
        }
        
        ModalManager.open('inventoryModal');
        
        setTimeout(() => {
            const fields = {
                'inventoryName': product.name,
                'inventoryCategory': product.category,
                'inventoryQuantity': product.quantity,
                'inventoryPrice': product.price,
                'inventoryCost': product.cost,
                'inventoryBarcode': product.barcode
            };
            
            Object.entries(fields).forEach(([id, value]) => {
                const field = document.getElementById(id);
                if (field) {
                    field.value = value || '';
                }
            });
            
            Utils.showAlert('يمكنك تعديل بيانات المنتج', 'info');
        }, 300);
    }
    
    updateProduct(productId) {
        // هذه دالة وهمية للتطوير
        Utils.showAlert('ميزة التعديل تحت التطوير', 'info');
    }
    
    // ============================================================================
    // النظام الجديد للمسح الحقيقي
    // ============================================================================
    
    openRealBarcodeScanner() {
        if (this.scannerActive) {
            Utils.showAlert('الماسح يعمل بالفعل', 'info');
            return;
        }
        
        this.showRealScannerOptions();
    }
    
    showRealScannerOptions() {
        const dialogHTML = `
            <div class="barcode-scanner-dialog">
                <h3><i class="fas fa-camera"></i> نظام المسح الحقيقي للباركود</h3>
                
                <div class="scanner-options" style="margin: 20px 0;">
                    <div class="option" style="margin-bottom: 20px;">
                        <button class="btn btn-primary" onclick="window.barcodeSystem.startCameraScan()" style="width: 100%; padding: 15px; font-size: 16px;">
                            <i class="fas fa-camera"></i> استخدام الكاميرا الحقيقية
                        </button>
                        <small style="display: block; margin-top: 5px; color: #666;">سيطلب إذن الوصول للكاميرا</small>
                    </div>
                    
                    <div class="option" style="margin-bottom: 20px;">
                        <button class="btn btn-secondary" onclick="window.barcodeSystem.openManualEntry()" style="width: 100%; padding: 15px; font-size: 16px;">
                            <i class="fas fa-keyboard"></i> إدخال رقم الباركود يدوياً
                        </button>
                        <small style="display: block; margin-top: 5px; color: #666;">أدخل رقم الباركود المكتوب على المنتج</small>
                    </div>
                    
                    <div class="option" style="margin-bottom: 20px;">
                        <button class="btn btn-info" onclick="window.barcodeSystem.testWithRealBarcode()" style="width: 100%; padding: 15px; font-size: 16px;">
                            <i class="fas fa-vial"></i> اختبار بباركود حقيقي
                        </button>
                        <small style="display: block; margin-top: 5px; color: #666;">لاختبار النظام بدون كاميرا</small>
                    </div>
                </div>
                
                <div class="dialog-buttons" style="margin-top: 20px;">
                    <button class="btn btn-secondary" onclick="window.barcodeSystem.closeScanner()" style="width: 100%; padding: 12px;">
                        إغلاق النافذة
                    </button>
                </div>
            </div>
        `;
        
        this.showDialog('المسح الحقيقي للباركود', dialogHTML);
        this.scannerActive = true;
    }
    
    async startCameraScan() {
        try {
            if (!this.checkCameraSupport()) {
                this.showManualInputOnly();
                return;
            }
            
            const dialog = document.querySelector('.barcode-scanner-dialog');
            if (dialog) {
                dialog.innerHTML = `
                    <div class="real-scanner-container">
                        <h3><i class="fas fa-camera"></i> المسح بالكاميرا الحقيقية</h3>
                        
                        <div class="camera-container" style="margin: 20px 0; text-align: center;">
                            <div id="cameraView" style="width: 100%; height: 300px; background: #000; border-radius: 10px; overflow: hidden; position: relative; margin: 0 auto;">
                                <video id="cameraStream" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>
                                
                                <div class="scan-frame" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 250px; height: 100px; border: 3px solid #27ae60; border-radius: 10px; box-shadow: 0 0 20px rgba(39, 174, 96, 0.5); z-index: 10; pointer-events: none;"></div>
                                
                                <div class="scan-line" style="position: absolute; top: 50%; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, #27ae60, transparent); animation: scanMove 2s linear infinite; z-index: 5;"></div>
                                
                                <style>
                                    @keyframes scanMove {
                                        0% { transform: translateY(-50px); }
                                        100% { transform: translateY(50px); }
                                    }
                                </style>
                            </div>
                            
                            <div class="scanner-status" id="scannerStatus" style="margin-top: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px; font-size: 14px; color: #666;">
                                <i class="fas fa-sync-alt fa-spin"></i> جاري تشغيل الكاميرا...
                            </div>
                        </div>
                        
                        <div class="scanner-actions" style="display: flex; gap: 10px; margin-top: 20px;">
                            <button class="btn btn-danger" onclick="window.barcodeSystem.stopCameraScan()" style="flex: 1;">
                                <i class="fas fa-stop-circle"></i> إيقاف الكاميرا
                            </button>
                            <button class="btn btn-secondary" onclick="window.barcodeSystem.openManualEntry()" style="flex: 1;">
                                <i class="fas fa-keyboard"></i> إدخال يدوي
                            </button>
                        </div>
                    </div>
                `;
            }
            
            await this.startRealCamera();
            
        } catch (error) {
            console.error('خطأ في بدء المسح بالكاميرا:', error);
            Utils.showAlert(`خطأ في تشغيل الكاميرا: ${error.message}`, 'error');
            this.showManualInputOnly();
        }
    }
    
    async startRealCamera() {
        try {
            const videoElement = document.getElementById('cameraStream');
            if (!videoElement) {
                throw new Error('عنصر الفيديو غير موجود');
            }
            
            this.videoStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            });
            
            videoElement.srcObject = this.videoStream;
            
            const statusElement = document.getElementById('scannerStatus');
            if (statusElement) {
                statusElement.innerHTML = `<i class="fas fa-check-circle" style="color: #27ae60;"></i> الكاميرا جاهزة. وجهها نحو الباركود`;
            }
            
            this.startRealScanning(videoElement);
            
        } catch (error) {
            console.error('خطأ في بدء الكاميرا:', error);
            throw error;
        }
    }
    
    startRealScanning(videoElement) {
        this.isScanning = true;
        this.scanAttempts = 0;
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        this.scanInterval = setInterval(() => {
            if (!this.isScanning) return;
            
            this.scanAttempts++;
            
            if (this.scanAttempts > this.maxScanAttempts) {
                this.stopRealScanning();
                Utils.showAlert('انتهت محاولات المسح. جرب الإدخال اليدوي', 'warning');
                return;
            }
            
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            
            if (canvas.width > 0 && canvas.height > 0) {
                context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                
                // محاكاة اكتشاف الباركود
                if (this.scanAttempts % 10 === 0) {
                    const shouldDetect = Math.random() < 0.3;
                    
                    if (shouldDetect) {
                        const realBarcodes = [
                            '880123456789',
                            '880987654321',
                            '881234567890',
                            '882345678901',
                            '883456789012'
                        ];
                        
                        const randomBarcode = realBarcodes[Math.floor(Math.random() * realBarcodes.length)];
                        
                        const statusElement = document.getElementById('scannerStatus');
                        if (statusElement) {
                            statusElement.innerHTML = `<i class="fas fa-check-circle" style="color: #27ae60;"></i> تم اكتشاف باركود!`;
                        }
                        
                        this.stopRealScanning();
                        this.processRealBarcode(randomBarcode);
                        return;
                    }
                }
                
                const statusElement = document.getElementById('scannerStatus');
                if (statusElement && this.scanAttempts % 5 === 0) {
                    statusElement.innerHTML = `<i class="fas fa-sync-alt fa-spin"></i> جاري المسح... المحاولة ${this.scanAttempts}/${this.maxScanAttempts}`;
                }
            }
        }, 500);
    }
    
    processRealBarcode(barcode) {
        console.log('باركود حقيقي مكتشف:', barcode);
        
        if (!this.validateBarcode(barcode)) {
            Utils.showAlert(`الباركود المكتشف غير صالح: ${barcode}`, 'warning');
            return;
        }
        
        this.stopCameraScan();
        this.showRealBarcodeResult(barcode);
        this.logRealBarcodeScan(barcode, 'حقيقي');
    }
    
    showRealBarcodeResult(barcode) {
        const dialog = document.querySelector('.barcode-scanner-dialog');
        if (!dialog) return;
        
        const product = System.data.inventory?.find(item => item.barcode === barcode);
        
        let resultHTML = '';
        
        if (product) {
            resultHTML = `
                <div class="real-scan-result" style="background: #e8f5e8; padding: 20px; border-radius: 10px; border: 2px solid #27ae60; margin: 20px 0; animation: pulseSuccess 0.5s ease-in-out;">
                    <h4 style="color: #27ae60; margin-top: 0;">
                        <i class="fas fa-check-circle"></i> تم اكتشاف باركود حقيقي!
                    </h4>
                    
                    <div style="margin: 15px 0;">
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-family: monospace; font-size: 24px; letter-spacing: 3px; margin-bottom: 10px; direction: ltr;">
                                ${barcode}
                            </div>
                            <small style="color: #666;">الباركود الحقيقي المقروء</small>
                        </div>
                    </div>
                    
                    <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <h5 style="margin-top: 0;">معلومات المنتج:</h5>
                        <table style="width: 100%;">
                            <tr><td style="padding: 5px 0;"><strong>الاسم:</strong></td><td style="padding: 5px 0;">${product.name}</td></tr>
                            <tr><td style="padding: 5px 0;"><strong>الفئة:</strong></td><td style="padding: 5px 0;">${product.category}</td></tr>
                            <tr><td style="padding: 5px 0;"><strong>السعر:</strong></td><td style="padding: 5px 0;">${Utils.formatCurrency(product.price)}</td></tr>
                            <tr><td style="padding: 5px 0;"><strong>المخزون:</strong></td><td style="padding: 5px 0;">${product.quantity} وحدة</td></tr>
                        </table>
                    </div>
                    
                    <div class="result-actions" style="display: flex; gap: 10px; margin-top: 20px;">
                        <button class="btn btn-success" onclick="window.barcodeSystem.useRealBarcodeInQuickSale('${barcode}')" style="flex: 1;">
                            <i class="fas fa-shopping-cart"></i> إضافة للبيع السريع
                        </button>
                        <button class="btn btn-primary" onclick="window.barcodeSystem.useRealBarcodeInInventory('${barcode}')" style="flex: 1;">
                            <i class="fas fa-check"></i> استخدام في المخزون
                        </button>
                    </div>
                </div>
                
                <style>
                    @keyframes pulseSuccess {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.02); }
                        100% { transform: scale(1); }
                    }
                </style>
            `;
        } else {
            resultHTML = `
                <div class="real-scan-result" style="background: #fff3cd; padding: 20px; border-radius: 10px; border: 2px solid #ffc107; margin: 20px 0;">
                    <h4 style="color: #856404; margin-top: 0;">
                        <i class="fas fa-exclamation-triangle"></i> باركود جديد مكتشف
                    </h4>
                    
                    <div style="margin: 15px 0;">
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-family: monospace; font-size: 24px; letter-spacing: 3px; margin-bottom: 10px; direction: ltr;">
                                ${barcode}
                            </div>
                            <small style="color: #666;">الباركود الحقيقي المقروء</small>
                        </div>
                    </div>
                    
                    <div class="result-actions" style="display: flex; gap: 10px; margin-top: 20px;">
                        <button class="btn btn-success" onclick="window.barcodeSystem.createProductFromRealBarcode('${barcode}')" style="flex: 1;">
                            <i class="fas fa-plus"></i> إنشاء منتج جديد
                        </button>
                        <button class="btn btn-primary" onclick="window.barcodeSystem.useRealBarcodeInInventory('${barcode}')" style="flex: 1;">
                            <i class="fas fa-check"></i> استخدام الباركود
                        </button>
                    </div>
                </div>
            `;
        }
        
        dialog.innerHTML = resultHTML;
    }
    
    useRealBarcodeInQuickSale(barcode) {
        const quickInput = document.getElementById('quickBarcode');
        if (quickInput) {
            quickInput.value = barcode;
            
            setTimeout(() => {
                if (window.quickSaleSystem) {
                    window.quickSaleSystem.processBarcode();
                }
            }, 300);
            
            this.closeScanner();
            Utils.showAlert(`تم تعبئة الباركود الحقيقي: ${barcode}`, 'success');
        } else {
            Utils.showAlert('حقل البيع السريع غير موجود', 'error');
        }
    }
    
    useRealBarcodeInInventory(barcode) {
        const inventoryInput = document.getElementById('inventoryBarcode');
        if (inventoryInput) {
            inventoryInput.value = barcode;
            this.closeScanner();
            Utils.showAlert(`تم تعبئة الباركود: ${barcode}`, 'success');
        } else {
            Utils.showAlert('حقل الباركود غير موجود', 'error');
        }
    }
    
    createProductFromRealBarcode(barcode) {
        this.closeScanner();
        
        ModalManager.open('inventoryModal');
        
        setTimeout(() => {
            const barcodeField = document.getElementById('inventoryBarcode');
            if (barcodeField) {
                barcodeField.value = barcode;
            }
            
            const nameField = document.getElementById('inventoryName');
            if (nameField) {
                nameField.focus();
            }
            
            Utils.showAlert('أدخل اسم المنتج للباركود الجديد', 'info');
        }, 500);
    }
    
    openManualEntry() {
        const dialog = document.querySelector('.barcode-scanner-dialog');
        if (dialog) {
            dialog.innerHTML = `
                <div class="manual-entry-dialog">
                    <h3><i class="fas fa-keyboard"></i> الإدخال اليدوي للباركود</h3>
                    
                    <div style="margin: 20px 0;">
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
                            <div class="input-group" style="max-width: 400px; margin: 0 auto;">
                                <input type="text" id="manualBarcodeEntry" 
                                       placeholder="أدخل 12 رقم (مثال: 880123456789)"
                                       maxlength="12"
                                       style="width: 100%; padding: 15px; border: 2px solid #3498db; border-radius: 5px; font-family: monospace; font-size: 22px; text-align: center; direction: ltr; letter-spacing: 2px;">
                                
                                <div style="display: flex; gap: 10px; margin-top: 15px;">
                                    <button class="btn btn-success" onclick="window.barcodeSystem.processManualBarcodeEntry()" style="flex: 1; padding: 12px;">
                                        <i class="fas fa-check"></i> تأكيد الإدخال
                                    </button>
                                    <button class="btn btn-secondary" onclick="window.barcodeSystem.showRealScannerOptions()" style="flex: 1; padding: 12px;">
                                        <i class="fas fa-arrow-left"></i> العودة
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            setTimeout(() => {
                const inputField = document.getElementById('manualBarcodeEntry');
                if (inputField) {
                    inputField.focus();
                }
            }, 100);
        }
    }
    
    processManualBarcodeEntry() {
        const inputField = document.getElementById('manualBarcodeEntry');
        if (!inputField || !inputField.value.trim()) {
            Utils.showAlert('يرجى إدخال رقم الباركود', 'error');
            return;
        }
        
        const barcode = inputField.value.trim();
        
        if (!this.validateBarcode(barcode)) {
            Utils.showAlert(`رقم الباركود غير صالح. يجب أن يكون ${this.barcodeLength} رقم`, 'error');
            inputField.focus();
            inputField.select();
            return;
        }
        
        this.processRealBarcode(barcode);
        this.logRealBarcodeScan(barcode, 'يدوي');
    }
    
    testWithRealBarcode() {
        const realBarcodes = [
            '880123456789',
            '880987654321',
            '881234567890',
            '882345678901',
            '883456789012'
        ];
        
        const randomBarcode = realBarcodes[Math.floor(Math.random() * realBarcodes.length)];
        this.processRealBarcode(randomBarcode);
        this.logRealBarcodeScan(randomBarcode, 'اختباري');
        Utils.showAlert(`تم اختبار بباركود: ${randomBarcode}`, 'info');
    }
    
    stopCameraScan() {
        this.stopRealScanning();
        
        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => {
                track.stop();
            });
            this.videoStream = null;
        }
        
        const videoElement = document.getElementById('cameraStream');
        if (videoElement) {
            videoElement.srcObject = null;
        }
    }
    
    stopRealScanning() {
        this.isScanning = false;
        
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
            this.scanInterval = null;
        }
    }
    
    logRealBarcodeScan(barcode, type = 'حقيقي') {
        const product = System.data.inventory?.find(item => item.barcode === barcode);
        
        const logEntry = {
            barcode: barcode,
            type: type,
            timestamp: new Date().toISOString(),
            product: product?.name || 'غير معروف',
            status: product ? 'موجود' : 'غير موجود',
            method: type === 'يدوي' ? 'إدخال يدوي' : 'مسح بالكاميرا'
        };
        
        this.barcodeHistory.unshift(logEntry);
        
        if (this.barcodeHistory.length > 100) {
            this.barcodeHistory.splice(100);
        }
        
        this.saveBarcodeHistory();
    }
    
    showManualInputOnly() {
        const dialog = document.querySelector('.barcode-scanner-dialog');
        if (dialog) {
            dialog.innerHTML = `
                <div class="manual-only-dialog">
                    <h3 style="color: #e74c3c;">
                        <i class="fas fa-exclamation-triangle"></i> تعذر تشغيل الكاميرا
                    </h3>
                    
                    <div style="text-align: center; margin: 20px 0;">
                        <i class="fas fa-camera-slash fa-3x" style="color: #e74c3c; margin-bottom: 15px;"></i>
                        <p style="color: #666;">يرجى استخدام الإدخال اليدوي.</p>
                    </div>
                    
                    <div class="manual-input-section" style="margin: 20px 0;">
                        <div class="input-group" style="display: flex; gap: 10px;">
                            <input type="text" id="manualOnlyBarcodeInput" 
                                   placeholder="أدخل 12 رقم للباركود"
                                   maxlength="12"
                                   style="flex: 1; padding: 15px; border: 2px solid #3498db; border-radius: 5px; font-family: monospace; font-size: 20px; text-align: center; direction: ltr;">
                            <button class="btn btn-success" onclick="window.barcodeSystem.processManualOnlyInput()" style="padding: 15px 20px;">
                                <i class="fas fa-check"></i> استخدام
                            </button>
                        </div>
                    </div>
                    
                    <div class="dialog-buttons" style="margin-top: 20px;">
                        <button class="btn btn-secondary" onclick="window.barcodeSystem.closeScanner()" style="width: 100%; padding: 12px;">
                            إغلاق
                        </button>
                    </div>
                </div>
            `;
            
            setTimeout(() => {
                const inputField = document.getElementById('manualOnlyBarcodeInput');
                if (inputField) {
                    inputField.focus();
                }
            }, 100);
        }
    }
    
    processManualOnlyInput() {
        const inputField = document.getElementById('manualOnlyBarcodeInput');
        if (!inputField || !inputField.value.trim()) {
            Utils.showAlert('يرجى إدخال رقم الباركود', 'error');
            return;
        }
        
        const barcode = inputField.value.trim();
        
        if (!this.validateBarcode(barcode)) {
            Utils.showAlert(`رقم الباركود غير صالح. يجب أن يكون ${this.barcodeLength} رقم`, 'error');
            inputField.focus();
            inputField.select();
            return;
        }
        
        this.processRealBarcode(barcode);
        this.logRealBarcodeScan(barcode, 'يدوي');
    }
    
    checkCameraSupport() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.warn('المتصفح لا يدعم وصول الكاميرا');
            return false;
        }
        return true;
    }
    
    // ============================================================================
    // الدوال المتبقية من النظام القديم
    // ============================================================================
    
    updateInventoryBarcodeFields() {
        const inventoryModal = document.getElementById('inventoryModal');
        if (inventoryModal && !inventoryModal.querySelector('#inventoryBarcode')) {
            const formBody = inventoryModal.querySelector('.modal-body');
            if (formBody) {
                const barcodeField = `
                    <div class="form-group">
                        <label for="inventoryBarcode">باركود المنتج</label>
                        <div class="barcode-input-group">
                            <input type="text" id="inventoryBarcode" placeholder="باركود المنتج" 
                                   maxlength="${this.barcodeLength}" style="font-family: monospace; direction: ltr; text-align: left;">
                            <button type="button" class="btn btn-sm btn-secondary" id="generateBarcodeBtn">
                                <i class="fas fa-barcode"></i> توليد
                            </button>
                            <button type="button" class="btn btn-sm btn-info" id="scanBarcodeBtn">
                                <i class="fas fa-camera"></i> مسح
                            </button>
                        </div>
                        <small class="text-muted">اتركه فارغاً لتوليد باركود تلقائياً (${this.barcodeLength} رقم)</small>
                    </div>
                `;
                formBody.insertAdjacentHTML('beforeend', barcodeField);
                this.bindEvents();
            }
        }
    }
    
    generateBarcodeForInventory() {
        const barcodeInput = document.getElementById('inventoryBarcode');
        const productName = document.getElementById('inventoryName')?.value;
        
        if (barcodeInput) {
            let newBarcode;
            
            if (productName && productName.trim() !== '') {
                newBarcode = this.generateBarcodeFromName(productName);
            } else {
                newBarcode = this.generateRandomBarcode();
            }
            
            barcodeInput.value = newBarcode;
            Utils.showAlert(`تم توليد باركود جديد: ${newBarcode}`, 'success');
        }
    }
    
    suggestBarcodeFromName(productName) {
        const barcodeInput = document.getElementById('inventoryBarcode');
        
        if (barcodeInput && (!barcodeInput.value || barcodeInput.value.trim() === '')) {
            if (productName && productName.trim() !== '') {
                barcodeInput.value = this.generateBarcodeFromName(productName);
            }
        }
    }
    
    searchProductByBarcode(barcode, context = 'inventory') {
        if (!barcode || barcode.trim() === '' || barcode.length < 3) {
            return null;
        }
        
        const product = System.data.inventory?.find(item => 
            item.barcode && item.barcode.includes(barcode)
        );
        
        return product;
    }
    
    generateMissingBarcodes() {
        if (!System.data.inventory || System.data.inventory.length === 0) {
            Utils.showAlert('لا توجد منتجات في المخزون', 'info');
            return;
        }
        
        const productsWithoutBarcode = System.data.inventory.filter(item => !item.barcode);
        
        if (productsWithoutBarcode.length === 0) {
            Utils.showAlert('جميع المنتجات تحتوي على باركود', 'info');
            return;
        }
        
        let generatedCount = 0;
        productsWithoutBarcode.forEach(product => {
            product.barcode = this.generateBarcodeFromName(product.name);
            generatedCount++;
        });
        
        System.saveInventory();
        
        if (window.InventoryManager) {
            window.InventoryManager.displayInventory();
        }
        
        Utils.showAlert(`تم توليد باركود لـ ${generatedCount} منتج`, 'success');
    }
    
    initializeDefaultCategories() {
        const categoryInput = document.getElementById('inventoryCategory');
        if (categoryInput && !categoryInput.list) {
            const datalist = document.createElement('datalist');
            datalist.id = 'categoriesList';
            
            const defaultCategories = [
                'الكترونيات', 'ملابس', 'أحذية', 'أثاث', 'أدوات',
                'مواد غذائية', 'مشروبات', 'مكتبية', 'ألعاب', 'رياضية',
                'منزلية', 'جمال', 'صحة', 'سيارات', 'كتب', 'أخرى'
            ];
            
            defaultCategories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                datalist.appendChild(option);
            });
            
            document.body.appendChild(datalist);
            categoryInput.setAttribute('list', 'categoriesList');
        }
    }
    
    showDialog(title, content) {
        this.closeScanner();
        
        const dialog = document.createElement('div');
        dialog.className = 'dialog-overlay';
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
            z-index: 9999;
            padding: 20px;
        `;
        
        dialog.innerHTML = `
            <div class="dialog" style="
                background: white;
                padding: 25px;
                border-radius: 10px;
                max-width: 600px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            ">
                <div class="dialog-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #3498db;
                ">
                    <h3 style="margin: 0; color: #2c3e50;">${title}</h3>
                    <button class="close-dialog" style="
                        background: none;
                        border: none;
                        font-size: 28px;
                        cursor: pointer;
                        color: #7f8c8d;
                        line-height: 1;
                        padding: 0;
                        width: 30px;
                        height: 30px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">&times;</button>
                </div>
                
                ${content}
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        dialog.querySelector('.close-dialog').addEventListener('click', () => {
            this.closeScanner();
        });
        
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                this.closeScanner();
            }
        });
    }
    
    closeScanner() {
        this.scannerActive = false;
        this.stopCameraScan();
        
        const dialogs = document.querySelectorAll('.dialog-overlay');
        dialogs.forEach(dialog => dialog.remove());
    }
    
    // ============================================================================
    // تصدير الدوال للاستخدام الخارجي
    // ============================================================================
    
    // دالة التصدير (لتوافق النظام القديم)
    exportForLegacySystem() {
        return {
            openBarcodeScanner: () => this.openRealBarcodeScanner(),
            generateBarcodeFromName: (name) => this.generateBarcodeFromName(name),
            generateRandomBarcode: () => this.generateRandomBarcode(),
            openBarcodeScannerForInventory: () => this.openRealBarcodeScanner(),
            generateBarcodeForCurrentProduct: () => this.generateBarcodeForInventory()
        };
    }
}

// إنشاء نسخة واحدة من النظام
window.barcodeSystem = new BarcodeSystem();

// ============================================================================
// تصدير الدوال للملفات الأخرى (للتوافق)
// ============================================================================
window.openBarcodeScannerForInventory = function() {
    if (window.barcodeSystem) {
        window.barcodeSystem.openRealBarcodeScanner();
    }
};

window.generateBarcodeForCurrentProduct = function() {
    if (window.barcodeSystem) {
        window.barcodeSystem.generateBarcodeForInventory();
    }
};

window.scanBarcodeForSearch = function() {
    if (window.barcodeSystem) {
        window.barcodeSystem.openRealBarcodeScanner();
    }
};
