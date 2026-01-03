// ============================================================================
// نظام إدارة الباركود للمنتجات
// ============================================================================

class BarcodeSystem {
    constructor() {
        this.barcodeLength = 12; // طول باركود EAN-12 (شائع الاستخدام)
        this.barcodePrefix = "88"; // بادئة خاصة بالمتجر
        this.barcodeHistory = [];
        this.scannerActive = false;
    }
    
    // ============================================================================
    // دالة التهيئة الرئيسية - START
    // ============================================================================
    init() {
        console.log('تهيئة نظام الباركود...');
        this.loadBarcodeHistory();
        this.bindEvents();
        this.updateInventoryBarcodeFields();
        this.initializeDefaultCategories();
    }
    // ============================================================================
    // دالة التهيئة الرئيسية - END
    // ============================================================================
    
    // ============================================================================
    // دالة تحميل سجل الباركود - START
    // ============================================================================
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
    // ============================================================================
    // دالة تحميل سجل الباركود - END
    // ============================================================================
    
    // ============================================================================
    // دالة حفظ سجل الباركود - START
    // ============================================================================
    saveBarcodeHistory() {
        try {
            localStorage.setItem('barcode_history', JSON.stringify(this.barcodeHistory));
        } catch (error) {
            console.error('خطأ في حفظ سجل الباركود:', error);
        }
    }
    // ============================================================================
    // دالة حفظ سجل الباركود - END
    // ============================================================================
    
    // ============================================================================
    // دالة ربط الأحداث - START
    // ============================================================================
    bindEvents() {
        console.log('ربط أحداث نظام الباركود...');
        
        // إعادة ربط الأحداث بعد وقت قصير للتأكد من تحميل DOM
        setTimeout(() => {
            // زر توليد باركود في نافذة المخزون
            document.getElementById('generateBarcodeBtn')?.addEventListener('click', () => {
                this.generateBarcodeForInventory();
            });
            
            // زر مسح باركود في المخزون
            const scanBtn = document.getElementById('scanBarcodeBtn');
            if (scanBtn) {
                scanBtn.addEventListener('click', () => {
                    this.openBarcodeScanner();
                });
            }
            
            // حدث عند تغيير اسم المنتج في نموذج المخزون
            document.getElementById('inventoryName')?.addEventListener('blur', (e) => {
                this.suggestBarcodeFromName(e.target.value);
            });
            
            // حدث البحث بالباركود في المخزون
            const barcodeSearch = document.getElementById('searchBarcode');
            if (barcodeSearch) {
                barcodeSearch.addEventListener('input', (e) => {
                    this.searchProductByBarcode(e.target.value, 'inventory');
                });
                
                barcodeSearch.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.searchProductByBarcode(e.target.value, 'inventory');
                    }
                });
            }
            
            // حدث البحث بالباركود في المبيعات
            const searchBarcodeSales = document.getElementById('searchBarcodeSales');
            if (searchBarcodeSales) {
                searchBarcodeSales.addEventListener('input', (e) => {
                    this.searchProductByBarcode(e.target.value, 'sales');
                });
            }
            
            console.log('تم ربط أحداث الباركود بنجاح');
        }, 1000);
    }
    // ============================================================================
    // دالة ربط الأحداث - END
    // ============================================================================
    
    // ============================================================================
    // دالة توليد باركود عشوائي - START
    // ============================================================================
    generateRandomBarcode() {
        // بداية ببادئة المتجر
        let barcode = this.barcodePrefix;
        
        // إضافة أرقام عشوائية
        const remainingLength = this.barcodeLength - barcode.length - 1; // -1 للرقم الاختباري
        for (let i = 0; i < remainingLength; i++) {
            barcode += Math.floor(Math.random() * 10);
        }
        
        // حساب الرقم الاختباري (رقم التحقق)
        barcode += this.calculateCheckDigit(barcode);
        
        // التحقق من عدم تكرار الباركود
        let attempts = 0;
        while (this.isBarcodeExists(barcode) && attempts < 10) {
            // تغيير الرقم الأخير
            barcode = barcode.slice(0, -1) + Math.floor(Math.random() * 10);
            barcode = barcode.slice(0, -1) + this.calculateCheckDigit(barcode.slice(0, -1));
            attempts++;
        }
        
        return barcode;
    }
    // ============================================================================
    // دالة توليد باركود عشوائي - END
    // ============================================================================
    
    // ============================================================================
    // دالة توليد باركود من اسم المنتج - START
    // ============================================================================
    generateBarcodeFromName(productName) {
        if (!productName || productName.trim() === '') {
            return this.generateRandomBarcode();
        }
        
        // تحويل اسم المنتج إلى أرقام
        let numericCode = '';
        const name = productName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
        
        // أخذ أول 4 أحرف فقط للثبات
        const shortName = name.substring(0, Math.min(name.length, 4));
        
        for (let i = 0; i < shortName.length; i++) {
            const charCode = shortName.charCodeAt(i);
            // تحويل الحرف إلى رقمين (01-26 للأحرف)
            if (charCode >= 97 && charCode <= 122) { // a-z
                const num = (charCode - 96).toString().padStart(2, '0');
                numericCode += num;
            } else if (charCode >= 48 && charCode <= 57) { // 0-9
                numericCode += String.fromCharCode(charCode);
            }
        }
        
        // ملء الباقي بأرقام عشوائية
        const neededLength = 8 - numericCode.length;
        for (let i = 0; i < neededLength; i++) {
            numericCode += Math.floor(Math.random() * 10);
        }
        
        let barcode = this.barcodePrefix + numericCode.substring(0, 8);
        
        // حساب الرقم الاختباري وإضافته
        const checkDigit = this.calculateCheckDigit(barcode);
        barcode += checkDigit;
        
        // التحقق من الطول والعدم تكرار
        if (barcode.length !== this.barcodeLength) {
            barcode = this.generateRandomBarcode();
        }
        
        // التحقق من عدم تكرار الباركود
        if (this.isBarcodeExists(barcode)) {
            barcode = this.generateRandomBarcode();
        }
        
        return barcode;
    }
    // ============================================================================
    // دالة توليد باركود من اسم المنتج - END
    // ============================================================================
    
    // ============================================================================
    // دالة حساب الرقم الاختباري - START
    // ============================================================================
    calculateCheckDigit(barcodeWithoutCheck) {
        let sum = 0;
        
        // جمع الأرقام في المواضع الفردية (من اليمين، مع اعتبار أقصى اليمين رقم 1)
        for (let i = barcodeWithoutCheck.length - 1, weight = 1; i >= 0; i--, weight = 3 - weight) {
            sum += parseInt(barcodeWithoutCheck.charAt(i), 10) * weight;
        }
        
        // الحصول على الرقم الاختباري
        const checkDigit = (10 - (sum % 10)) % 10;
        return checkDigit.toString();
    }
    // ============================================================================
    // دالة حساب الرقم الاختباري - END
    // ============================================================================
    
    // ============================================================================
    // دالة التحقق من صحة الباركود - START
    // ============================================================================
    validateBarcode(barcode) {
        if (!barcode || barcode.length !== this.barcodeLength) {
            return false;
        }
        
        // التحقق من أن جميع الأحرف أرقام
        if (!/^\d+$/.test(barcode)) {
            return false;
        }
        
        const checkDigit = barcode.charAt(barcode.length - 1);
        const barcodeWithoutCheck = barcode.substring(0, barcode.length - 1);
        const calculatedCheck = this.calculateCheckDigit(barcodeWithoutCheck);
        
        return checkDigit === calculatedCheck;
    }
    // ============================================================================
    // دالة التحقق من صحة الباركود - END
    // ============================================================================
    
    // ============================================================================
    // دالة التحقق من وجود الباركود - START
    // ============================================================================
    isBarcodeExists(barcode) {
        if (!System.data.inventory) return false;
        return System.data.inventory.some(item => item.barcode === barcode);
    }
    // ============================================================================
    // دالة التحقق من وجود الباركود - END
    // ============================================================================
    
    // ============================================================================
    // دالة تحديث حقول الباركود في نموذج المخزون - START
    // ============================================================================
    updateInventoryBarcodeFields() {
        console.log('تحديث حقول الباركود...');
        
        // إضافة حقول الباركود إذا لم تكن موجودة في المخزون
        const inventoryModal = document.getElementById('inventoryModal');
        if (inventoryModal && !inventoryModal.querySelector('#inventoryBarcode')) {
            const formBody = inventoryModal.querySelector('.modal-body');
            if (formBody) {
                const existingBarcodeField = formBody.querySelector('.form-group:has(#inventoryBarcode)');
                if (!existingBarcodeField) {
                    const barcodeField = `
                        <div class="form-group">
                            <label for="inventoryBarcode">باركود المنتج</label>
                            <div class="barcode-input-group">
                                <input type="text" id="inventoryBarcode" placeholder="باركود المنتج" 
                                       maxlength="${this.barcodeLength}" style="font-family: monospace;">
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
                    
                    // إعادة ربط الأحداث للحقول الجديدة
                    this.bindEvents();
                }
            }
        }
        
        // إضافة حقل البحث بالباركود في صفحة المخزون
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer && !searchContainer.querySelector('#searchBarcode')) {
            const barcodeSearchHTML = `
                <div class="search-box" style="margin-top: 10px;">
                    <i class="fas fa-barcode"></i>
                    <input type="text" id="searchBarcode" placeholder="بحث بالباركود..." 
                           style="font-family: monospace;" maxlength="${this.barcodeLength}">
                    <button class="btn btn-sm btn-info" onclick="window.barcodeSystem.openBarcodeScanner()">
                        <i class="fas fa-camera"></i> مسح
                    </button>
                </div>
            `;
            searchContainer.insertAdjacentHTML('beforeend', barcodeSearchHTML);
        }
    }
    // ============================================================================
    // دالة تحديث حقول الباركود في نموذج المخزون - END
    // ============================================================================
    
    // ============================================================================
    // دالة توليد باركود لنموذج المخزون - START
    // ============================================================================
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
            
            // التركيز على الحقل التالي
            const quantityInput = document.getElementById('inventoryQuantity');
            if (quantityInput) {
                quantityInput.focus();
            }
        } else {
            Utils.showAlert('لم يتم العثور على حقل الباركود', 'error');
        }
    }
    // ============================================================================
    // دالة توليد باركود لنموذج المخزون - END
    // ============================================================================
    
    // ============================================================================
    // دالة اقتراح باركود من اسم المنتج - START
    // ============================================================================
    suggestBarcodeFromName(productName) {
        const barcodeInput = document.getElementById('inventoryBarcode');
        
        if (barcodeInput && (!barcodeInput.value || barcodeInput.value.trim() === '')) {
            if (productName && productName.trim() !== '') {
                barcodeInput.value = this.generateBarcodeFromName(productName);
                Utils.showAlert('تم اقتراح باركود بناءً على اسم المنتج', 'info');
            }
        }
    }
    // ============================================================================
    // دالة اقتراح باركود من اسم المنتج - END
    // ============================================================================
    
    // ============================================================================
// دالة فتح ماسح الباركود - START
// ============================================================================
openBarcodeScanner() {
    if (this.scannerActive) {
        Utils.showAlert('الماسح يعمل بالفعل', 'info');
        return;
    }
    
    // التحقق من دعم الكاميرا
    const hasCameraSupport = this.checkCameraSupport();
    
    const dialogHTML = `
        <div class="barcode-scanner-dialog">
            <h3><i class="fas fa-camera"></i> مسح الباركود</h3>
            
            <div class="scanner-options">
                ${hasCameraSupport ? `
                    <div class="option">
                        <button class="btn btn-primary" onclick="window.barcodeSystem.scanWithCamera()">
                            <i class="fas fa-camera"></i> استخدام الكاميرا الحقيقية
                        </button>
                        <small>سيطلب إذن الوصول للكاميرا</small>
                    </div>
                ` : `
                    <div class="option">
                        <div class="alert alert-warning" style="padding: 10px; margin: 5px 0;">
                            <i class="fas fa-exclamation-triangle"></i>
                            الكاميرا غير مدعومة. يرجى استخدام HTTPS أو متصفح حديث.
                        </div>
                    </div>
                `}
                
                <div class="option">
                    <button class="btn btn-secondary" onclick="window.barcodeSystem.manualBarcodeEntry()">
                        <i class="fas fa-keyboard"></i> إدخال يدوي
                    </button>
                    <small>أدخل الرقم يدوياً</small>
                </div>
                
                <div class="option">
                    <div class="form-group">
                        <label>أو أدخل الباركود هنا:</label>
                        <div class="input-group">
                            <input type="text" id="manualBarcodeInput" 
                                   placeholder="أدخل ${this.barcodeLength} رقم للباركود" 
                                   maxlength="${this.barcodeLength}" 
                                   style="font-family: monospace;">
                            <button class="btn btn-success" onclick="window.barcodeSystem.processManualBarcode()">
                                <i class="fas fa-check"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div id="cameraPreview" style="display: none;">
                <!-- سيتم تعبئة هذا بالقسم عن طريق JavaScript -->
            </div>
            
            <div class="scanner-results" id="scannerResults" style="display: none;">
                <h4>نتيجة المسح:</h4>
                <div id="scanResultContent"></div>
            </div>
            
            <div class="dialog-buttons">
                <button class="btn btn-secondary" onclick="window.barcodeSystem.closeScanner()">
                    إغلاق
                </button>
            </div>
        </div>
    `;
    
    this.showDialog('مسح الباركود', dialogHTML);
    this.scannerActive = true;
}
// ============================================================================
// دالة فتح ماسح الباركود - END
// ============================================================================
    
    // ============================================================================
// دالة إغلاق الماسح - START
// ============================================================================
closeScanner() {
    this.scannerActive = false;
    
    // إيقاف جميع عمليات المسح
    this.stopAllScanning();
    
    // إزالة جميع النوافذ المنبثقة
    const dialogs = document.querySelectorAll('.dialog-overlay');
    dialogs.forEach(dialog => dialog.remove());
}
// ============================================================================
// دالة إغلاق الماسح - END
// ============================================================================
    // ============================================================================
    // دالة بدء المسح بالكاميرا - START
    // ============================================================================
    // ============================================================================
// دالة بدء المسح بالكاميرا الحقيقية - START
// ============================================================================
async scanWithCamera() {
    try {
        const cameraPreview = document.getElementById('cameraPreview');
        const scannerResults = document.getElementById('scannerResults');
        const scanResultContent = document.getElementById('scanResultContent');
        
        if (cameraPreview) {
            // محاولة الوصول للكاميرا الحقيقية
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                // إخفاء عناصر المحاكاة
                cameraPreview.innerHTML = '';
                
                // إنشاء فيديو للكاميرا الحقيقية
                const video = document.createElement('video');
                video.id = 'cameraStream';
                video.style.cssText = `
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 10px;
                `;
                video.setAttribute('autoplay', '');
                video.setAttribute('playsinline', '');
                
                // إنشاء منطقة المسح
                const scanArea = document.createElement('div');
                scanArea.className = 'scan-area-real';
                scanArea.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 250px;
                    height: 100px;
                    border: 3px solid #27ae60;
                    border-radius: 10px;
                    box-shadow: 0 0 20px rgba(39, 174, 96, 0.5);
                    z-index: 10;
                    pointer-events: none;
                    animation: scanPulse 2s infinite;
                `;
                
                // إنشاء تعليمات
                const instructions = document.createElement('div');
                instructions.style.cssText = `
                    position: absolute;
                    bottom: -50px;
                    left: 0;
                    width: 100%;
                    text-align: center;
                    color: white;
                    font-size: 14px;
                    background: rgba(0, 0, 0, 0.7);
                    padding: 8px;
                    border-radius: 5px;
                `;
                instructions.innerHTML = `
                    <p style="margin: 0;">وجه الكاميرا نحو الباركود للحصول على مسح تلقائي</p>
                    <p style="margin: 5px 0 0 0; font-size: 12px;">أو استخدم الإدخال اليدوي أدناه</p>
                `;
                
                // إضافة الأنيميشن
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes scanPulse {
                        0% { box-shadow: 0 0 20px rgba(39, 174, 96, 0.5); }
                        50% { box-shadow: 0 0 40px rgba(39, 174, 96, 0.8); }
                        100% { box-shadow: 0 0 20px rgba(39, 174, 96, 0.5); }
                    }
                `;
                document.head.appendChild(style);
                
                // إضافة عنصر الحاوية
                const videoContainer = document.createElement('div');
                videoContainer.style.cssText = `
                    position: relative;
                    width: 100%;
                    height: 300px;
                    background: #000;
                    border-radius: 10px;
                    overflow: hidden;
                    margin: 0 auto;
                `;
                
                videoContainer.appendChild(video);
                videoContainer.appendChild(scanArea);
                videoContainer.appendChild(instructions);
                cameraPreview.appendChild(videoContainer);
                
                // بدء الكاميرا
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        facingMode: 'environment', // كاميرا الخلفية
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    },
                    audio: false 
                });
                
                video.srcObject = stream;
                cameraPreview.style.display = 'block';
                
                // بدء المسح التلقائي
                this.startAutoScan(video, stream);
                
                // زر إيقاف الكاميرا
                const stopButton = document.createElement('button');
                stopButton.innerHTML = '<i class="fas fa-stop-circle"></i> إيقاف الكاميرا';
                stopButton.style.cssText = `
                    margin-top: 15px;
                    padding: 10px 20px;
                    background: #e74c3c;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                `;
                stopButton.onclick = () => {
                    this.stopCamera(stream);
                    cameraPreview.style.display = 'none';
                };
                
                cameraPreview.appendChild(stopButton);
                
                Utils.showAlert('تم تشغيل الكاميرا بنجاح', 'success');
                
            } else {
                // إذا لم تكن الكاميرا متوفرة، استخدم المحاكاة
                Utils.showAlert('الكاميرا غير متوفرة. جاري استخدام المحاكاة...', 'warning');
                cameraPreview.style.display = 'block';
                setTimeout(() => {
                    this.simulateBarcodeScan();
                }, 3000);
            }
        }
        
    } catch (error) {
        console.error('خطأ في الوصول للكاميرا:', error);
        
        // عرض رسالة الخطأ
        const cameraPreview = document.getElementById('cameraPreview');
        if (cameraPreview) {
            cameraPreview.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #e74c3c;">
                    <i class="fas fa-exclamation-triangle fa-3x" style="margin-bottom: 15px;"></i>
                    <h4>تعذر الوصول للكاميرا</h4>
                    <p style="color: #666; margin: 10px 0;">${error.message || 'خطأ غير معروف'}</p>
                    <p style="color: #666; margin: 10px 0;">يرجى التأكد من:</p>
                    <ul style="text-align: right; margin: 10px 0; padding-right: 20px;">
                        <li>منح الإذن للوصول للكاميرا</li>
                        <li>أن الموقع يستخدم HTTPS (مطلوب للكاميرا)</li>
                        <li>أن المتصفح يدعم الكاميرا</li>
                    </ul>
                    <button class="btn btn-secondary" onclick="window.barcodeSystem.manualBarcodeEntry()" 
                            style="margin-top: 15px;">
                        <i class="fas fa-keyboard"></i> الإدخال اليدوي
                    </button>
                </div>
            `;
            cameraPreview.style.display = 'block';
        }
        
        Utils.showAlert('تعذر الوصول للكاميرا. استخدم الإدخال اليدوي.', 'error');
    }
}
// ============================================================================
// دالة بدء المسح بالكاميرا الحقيقية - END
// ============================================================================

// ============================================================================
// دالة بدء المسح التلقائي - START
// ============================================================================
startAutoScan(videoElement, stream) {
    // هذا الجزء لقراءة الباركود تلقائياً
    // في التطبيق الحقيقي، يمكنك استخدام مكتبة مثل:
    // QuaggaJS أو ZXing (zebra crossing) لقراءة الباركود
    
    console.log('بدء المسح التلقائي...');
    
    // محاكاة المسح التلقائي بعد 5 ثوانٍ (لأغراض العرض)
    // في التطبيق الحقيقي، سيكون هذا قراءة حقيقية للباركود
    this.autoScanTimeout = setTimeout(() => {
        this.simulateRealBarcodeScan(videoElement, stream);
    }, 5000);
    
    // محاولة قراءة الباركود كل 3 ثوانٍ
    this.scanInterval = setInterval(() => {
        // يمكنك إضافة منطق قراءة الباركود الحقيقي هنا
        // باستخدام canvas لالتقاط الإطارات ومعالجتها
        this.tryCaptureBarcode(videoElement);
    }, 3000);
}
// ============================================================================
// دالة بدء المسح التلقائي - END
// ============================================================================

// ============================================================================
// دالة محاولة التقاط الباركود - START
// ============================================================================
tryCaptureBarcode(videoElement) {
    // إنشاء canvas لالتقاط الصورة من الفيديو
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    if (canvas.width > 0 && canvas.height > 0) {
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        // هنا يمكنك إضافة منطق قراءة الباركود
        // باستخدام مكتبات مثل jsQR أو QuaggaJS
        
        // لأغراض العرض، سنستخدم محاكاة
        const shouldDetectBarcode = Math.random() > 0.7; // 30% فرصة للكشف
        
        if (shouldDetectBarcode) {
            // محاكاة اكتشاف الباركود
            const simulatedBarcode = this.generateRandomBarcode();
            this.handleDetectedBarcode(simulatedBarcode);
        }
    }
}
// ============================================================================
// دالة محاولة التقاط الباركود - END
// ============================================================================

// ============================================================================
// دالة معالجة الباركود المكتشف - START
// ============================================================================
handleDetectedBarcode(barcode) {
    console.log('تم اكتشاف باركود:', barcode);
    
    // إيقاف الكاميرا
    this.stopAllScanning();
    
    // عرض النتيجة
    const scannerResults = document.getElementById('scannerResults');
    const scanResultContent = document.getElementById('scanResultContent');
    
    if (scannerResults) scannerResults.style.display = 'block';
    
    scanResultContent.innerHTML = `
        <div class="scan-success">
            <h5><i class="fas fa-check-circle text-success"></i> تم اكتشاف الباركود تلقائياً</h5>
            <p><strong>الباركود:</strong> <code style="font-size: 18px;">${barcode}</code></p>
            
            <div class="scan-actions" style="margin-top: 20px;">
                <button class="btn btn-primary" onclick="window.barcodeSystem.useScannedBarcode('${barcode}')">
                    <i class="fas fa-check"></i> استخدام هذا الباركود
                </button>
                <button class="btn btn-secondary" onclick="window.barcodeSystem.rescanBarcode()">
                    <i class="fas fa-redo"></i> إعادة المسح
                </button>
            </div>
        </div>
    `;
    
    // التمرير إلى النتائج
    scannerResults.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // إغلاق الكاميرا بعد استخدام الباركود
    const useBarcodeBtn = document.querySelector('[onclick*="useScannedBarcode"]');
    if (useBarcodeBtn) {
        const originalClick = useBarcodeBtn.onclick;
        useBarcodeBtn.onclick = function() {
            if (originalClick) originalClick();
            window.barcodeSystem.stopAllScanning();
        };
    }
}
// ============================================================================
// دالة معالجة الباركود المكتشف - END
// ============================================================================

// ============================================================================
// دالة محاكاة المسح الحقيقي - START
// ============================================================================
simulateRealBarcodeScan(videoElement, stream) {
    // توليد باركود عشوائي لمحاكاة الاكتشاف
    const simulatedBarcode = this.generateRandomBarcode();
    
    // إيقاف الكاميرا
    this.stopCamera(stream);
    
    // عرض النتيجة
    this.handleDetectedBarcode(simulatedBarcode);
}
// ============================================================================
// دالة محاكاة المسح الحقيقي - END
// ============================================================================

// ============================================================================
// دالة إيقاف الكاميرا - START
// ============================================================================
stopCamera(stream) {
    if (stream) {
        stream.getTracks().forEach(track => {
            track.stop();
        });
    }
    
    // إيقاف جميع المهلات والفترات الزمنية
    this.stopAllScanning();
}
// ============================================================================
// دالة إيقاف الكاميرا - END
// ============================================================================

// ============================================================================
// دالة إيقاف جميع عمليات المسح - START
// ============================================================================
stopAllScanning() {
    if (this.autoScanTimeout) {
        clearTimeout(this.autoScanTimeout);
        this.autoScanTimeout = null;
    }
    
    if (this.scanInterval) {
        clearInterval(this.scanInterval);
        this.scanInterval = null;
    }
    
    // إيقاف الفيديو إذا كان يعمل
    const video = document.getElementById('cameraStream');
    if (video && video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
}
// ============================================================================
// دالة إيقاف جميع عمليات المسح - END
// ============================================================================
    // ============================================================================
    // دالة بدء المسح بالكاميرا - END
    // ============================================================================
    
    // ============================================================================
    // دالة محاكاة مسح باركود - START
    // ============================================================================
    simulateBarcodeScan() {
        // توليد باركود عشوائي لمحاكاة المسح
        const simulatedBarcode = this.generateRandomBarcode();
        
        // عرض النتيجة
        const scannerResults = document.getElementById('scannerResults');
        const scanResultContent = document.getElementById('scanResultContent');
        
        if (scannerResults) scannerResults.style.display = 'block';
        
        scanResultContent.innerHTML = `
            <div class="scan-success">
                <h5><i class="fas fa-check-circle text-success"></i> تم مسح الباركود بنجاح</h5>
                <p><strong>الباركود:</strong> <code style="font-size: 18px;">${simulatedBarcode}</code></p>
                <p style="color: #666;"><em>هذه محاكاة للمسح. في التطبيق الفعلي، سيتم قراءة الباركود الحقيقي.</em></p>
                
                <div class="scan-actions" style="margin-top: 20px;">
                    <button class="btn btn-primary" onclick="window.barcodeSystem.useScannedBarcode('${simulatedBarcode}')">
                        <i class="fas fa-check"></i> استخدام هذا الباركود
                    </button>
                    <button class="btn btn-secondary" onclick="window.barcodeSystem.rescanBarcode()">
                        <i class="fas fa-redo"></i> إعادة المسح
                    </button>
                </div>
            </div>
        `;
    }
    // ============================================================================
    // دالة محاكاة مسح باركود - END
    // ============================================================================
    
    // ============================================================================
    // دالة استخدام الباركود الممسوح - START
    // ============================================================================
    useScannedBarcode(barcode) {
        // الحصول على سياق الماسح
        const context = this.getScannerContext();
        
        if (context === 'inventory') {
            // استخدام في حقل المخزون
            const barcodeInput = document.getElementById('inventoryBarcode');
            if (barcodeInput) {
                barcodeInput.value = barcode;
                this.closeScanner();
                Utils.showAlert(`تم تعبئة الباركود: ${barcode}`, 'success');
            }
        } else if (context === 'search') {
            // استخدام في البحث
            const searchInput = document.getElementById('searchBarcode');
            if (searchInput) {
                searchInput.value = barcode;
                this.searchProductByBarcode(barcode, 'inventory');
                this.closeScanner();
            }
        } else if (context === 'quick_sale') {
            // استخدام في البيع السريع
            const quickBarcodeInput = document.getElementById('quickBarcode');
            if (quickBarcodeInput) {
                quickBarcodeInput.value = barcode;
                this.closeScanner();
                
                // معالجة الباركود تلقائياً بعد تأخير بسيط
                setTimeout(() => {
                    if (window.quickSaleSystem) {
                        window.quickSaleSystem.processBarcode();
                    }
                }, 300);
                
                Utils.showAlert(`تم تعبئة الباركود في البيع السريع: ${barcode}`, 'success');
            }
        } else {
            // استخدام عام
            this.searchAndProcessBarcode(barcode);
        }
    }
    // ============================================================================
    // دالة استخدام الباركود الممسوح - END
    // ============================================================================
    
    // ============================================================================
// دالة إعادة المسح - START
// ============================================================================
rescanBarcode() {
    const scannerResults = document.getElementById('scannerResults');
    const cameraPreview = document.getElementById('cameraPreview');
    
    if (scannerResults) scannerResults.style.display = 'none';
    if (cameraPreview) {
        cameraPreview.style.display = 'block';
        cameraPreview.innerHTML = ''; // مسح المحتوى القديم
    }
    
    // إعادة تشغيل الكاميرا
    setTimeout(() => {
        this.scanWithCamera();
    }, 500);
}
// ============================================================================
// دالة إعادة المسح - END
// ============================================================================
    
    // ============================================================================
    // دالة الحصول على سياق الماسح - START
    // ============================================================================
    getScannerContext() {
        // التحقق من أي نافذة مفتوحة
        if (document.getElementById('inventoryModal')?.style.display === 'block' || 
            document.querySelector('#inventoryModal.active')) {
            return 'inventory';
        } else if (document.getElementById('searchBarcode')?.closest('.search-container') && 
                   document.activeElement === document.getElementById('searchBarcode')) {
            return 'search';
        } else if (document.getElementById('quickBarcode') && 
                   (document.activeElement === document.getElementById('quickBarcode') || 
                    document.getElementById('sales')?.classList.contains('active'))) {
            // إذا كان حقل البيع السريع موجوداً وكان قسم المبيعات نشطاً
            return 'quick_sale';
        } else if (document.querySelector('.barcode-scanner-dialog')) {
            // إذا كان الماسح مفتوحاً من زر مسح في البيع السريع
            const scanBtn = document.querySelector('#scanQuickBarcode');
            if (scanBtn && scanBtn.offsetParent !== null) {
                return 'quick_sale';
            }
        }
        return 'general';
    }
    // ============================================================================
    // دالة الحصول على سياق الماسح - END
    // ============================================================================
    
    // ============================================================================
    // دالة الإدخال اليدوي للباركود - START
    // ============================================================================
    manualBarcodeEntry() {
        const manualInput = document.getElementById('manualBarcodeInput');
        if (manualInput) {
            manualInput.focus();
            Utils.showAlert('أدخل رقم الباركود يدوياً', 'info');
        }
    }
    // ============================================================================
    // دالة الإدخال اليدوي للباركود - END
    // ============================================================================
    
    // ============================================================================
    // دالة معالجة الباركود المدخل يدوياً - START
    // ============================================================================
    processManualBarcode() {
        const manualInput = document.getElementById('manualBarcodeInput');
        if (!manualInput || !manualInput.value.trim()) {
            Utils.showAlert('يرجى إدخال رقم الباركود', 'error');
            return;
        }
        
        const barcode = manualInput.value.trim();
        
        // تحديد السياق بناءً على من فتح الماسح
        const context = this.getScannerContext();
        
        if (context === 'quick_sale') {
            // استخدام في البيع السريع
            this.useScannedBarcode(barcode);
        } else {
            // استخدام عام
            this.searchAndProcessBarcode(barcode);
        }
    }
    // ============================================================================
    // دالة معالجة الباركود المدخل يدوياً - END
    // ============================================================================
    
    // ============================================================================
    // دالة البحث ومعالجة الباركود - START
    // ============================================================================
    searchAndProcessBarcode(barcode) {
        // التحقق من صحة الباركود
        if (!this.validateBarcode(barcode)) {
            Utils.showAlert(`رقم الباركود غير صالح. يجب أن يكون ${this.barcodeLength} رقم`, 'error');
            return;
        }
        
        // البحث عن المنتج بالباركود
        const product = System.data.inventory?.find(item => item.barcode === barcode);
        
        const resultsDiv = document.getElementById('scannerResults');
        const scanResultContent = document.getElementById('scanResultContent');
        
        if (resultsDiv) resultsDiv.style.display = 'block';
        
        if (product) {
            // المنتج موجود
            scanResultContent.innerHTML = `
                <div class="scan-success">
                    <h5><i class="fas fa-check-circle text-success"></i> تم العثور على المنتج</h5>
                    <p><strong>الاسم:</strong> ${product.name}</p>
                    <p><strong>الفئة:</strong> ${product.category}</p>
                    <p><strong>السعر:</strong> ${Utils.formatCurrency(product.price)}</p>
                    <p><strong>المتبقي:</strong> ${product.quantity} وحدة</p>
                    
                    <div class="scan-actions">
                        <button class="btn btn-primary" onclick="window.barcodeSystem.addToSale('${barcode}')">
                            <i class="fas fa-shopping-cart"></i> إضافة للبيع
                        </button>
                        <button class="btn btn-secondary" onclick="window.barcodeSystem.editProduct(${product.id})">
                            <i class="fas fa-edit"></i> تعديل المنتج
                        </button>
                        <button class="btn btn-info" onclick="window.barcodeSystem.useScannedBarcode('${barcode}')">
                            <i class="fas fa-check"></i> استخدام الباركود
                        </button>
                    </div>
                </div>
            `;
        } else {
            // المنتج غير موجود
            scanResultContent.innerHTML = `
                <div class="scan-not-found">
                    <h5><i class="fas fa-exclamation-triangle text-warning"></i> المنتج غير موجود</h5>
                    <p>باركود جديد: <strong><code style="font-size: 16px;">${barcode}</code></strong></p>
                    <p class="text-muted">هذا الباركود غير مسجل في النظام</p>
                    
                    <div class="scan-actions">
                        <button class="btn btn-success" onclick="window.barcodeSystem.createNewProduct('${barcode}')">
                            <i class="fas fa-plus"></i> إنشاء منتج جديد
                        </button>
                        <button class="btn btn-primary" onclick="window.barcodeSystem.useScannedBarcode('${barcode}')">
                            <i class="fas fa-check"></i> استخدام الباركود
                        </button>
                    </div>
                </div>
            `;
        }
        
        // تسجيل في السجل
        this.logBarcodeScan(barcode, product ? 'موجود' : 'غير موجود');
    }
    // ============================================================================
    // دالة البحث ومعالجة الباركود - END
    // ============================================================================
    
    // ============================================================================
    // دالة إضافة المنتج للبيع - START
    // ============================================================================
    addToSale(barcode) {
        const product = System.data.inventory?.find(item => item.barcode === barcode);
        if (!product) return;
        
        // إغلاق نافذة الماسح
        this.closeScanner();
        
        // فتح نافذة المبيعات
        ModalManager.open('saleModal');
        
        // تعبئة بيانات المنتج بعد تأخير بسيط
        setTimeout(() => {
            const saleProductSelect = document.getElementById('saleProduct');
            if (saleProductSelect) {
                saleProductSelect.value = product.name;
                if (window.SalesManager) {
                    window.SalesManager.updateProductPrice();
                }
            }
            
            Utils.showAlert(`تم إضافة ${product.name} للبيع`, 'success');
        }, 300);
    }
    // ============================================================================
    // دالة إضافة المنتج للبيع - END
    // ============================================================================
    
    // ============================================================================
    // دالة إنشاء منتج جديد من الباركود - START
    // ============================================================================
    createNewProduct(barcode) {
        // إغلاق نافذة الماسح
        this.closeScanner();
        
        // فتح نافذة المخزون
        ModalManager.open('inventoryModal');
        
        // تعبئة الباركود والتركيز على اسم المنتج
        setTimeout(() => {
            const barcodeInput = document.getElementById('inventoryBarcode');
            if (barcodeInput) {
                barcodeInput.value = barcode;
            }
            
            const nameInput = document.getElementById('inventoryName');
            if (nameInput) {
                nameInput.focus();
                nameInput.placeholder = 'أدخل اسم المنتج لهذا الباركود';
            }
            
            Utils.showAlert('أكمل بيانات المنتج الجديد', 'info');
        }, 500);
    }
    // ============================================================================
    // دالة إنشاء منتج جديد من الباركود - END
    // ============================================================================
    
    // ============================================================================
    // دالة استخدام الباركود في نموذج المخزون - START
    // ============================================================================
    useBarcodeInInventory(barcode) {
        const barcodeInput = document.getElementById('inventoryBarcode');
        if (barcodeInput) {
            barcodeInput.value = barcode;
        }
        
        Utils.showAlert('تم تعبئة حقل الباركود', 'success');
    }
    // ============================================================================
    // دالة استخدام الباركود في نموذج المخزون - END
    // ============================================================================
    
    // ============================================================================
    // دالة تعديل المنتج - START
    // ============================================================================
    editProduct(productId) {
        // البحث عن المنتج
        const product = System.data.inventory?.find(item => item.id === productId);
        if (!product) {
            Utils.showAlert('المنتج غير موجود', 'error');
            return;
        }
        
        // إغلاق نافذة الماسح
        this.closeScanner();
        
        // فتح نافذة المخزون وتعبئة البيانات
        ModalManager.open('inventoryModal');
        
        setTimeout(() => {
            // تعبئة بيانات المنتج
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
            
            // تغيير زر الحفظ ليصبح تعديل
            const saveBtn = document.getElementById('saveInventory');
            if (saveBtn) {
                saveBtn.dataset.editId = productId;
                saveBtn.textContent = 'تحديث المنتج';
                saveBtn.onclick = () => this.updateProduct(productId);
            }
            
            Utils.showAlert('يمكنك تعديل بيانات المنتج', 'info');
        }, 500);
    }
    // ============================================================================
    // دالة تعديل المنتج - END
    // ============================================================================
    
    // ============================================================================
    // دالة تحديث المنتج - START
    // ============================================================================
    updateProduct(productId) {
        // هذا مثال بسيط، في التطبيق الحقيقي تحتاج لمنطق كامل للتحديث
        Utils.showAlert('ميزة التعديل تحت التطوير', 'info');
    }
    // ============================================================================
    // دالة تحديث المنتج - END
    // ============================================================================
    
    // ============================================================================
    // دالة تسجيل مسح الباركود - START
    // ============================================================================
    logBarcodeScan(barcode, status) {
        const product = System.data.inventory?.find(item => item.barcode === barcode);
        
        const logEntry = {
            barcode: barcode,
            status: status,
            timestamp: new Date().toISOString(),
            product: product?.name || 'غير معروف',
            productId: product?.id || null
        };
        
        this.barcodeHistory.unshift(logEntry);
        
        // حفظ آخر 100 عملية فقط
        if (this.barcodeHistory.length > 100) {
            this.barcodeHistory.splice(100);
        }
        
        this.saveBarcodeHistory();
    }
    // ============================================================================
    // دالة تسجيل مسح الباركود - END
    // ============================================================================
    
    // ============================================================================
    // دالة البحث عن المنتج بالباركود - START
    // ============================================================================
    searchProductByBarcode(barcode, context = 'inventory') {
        if (!barcode || barcode.trim() === '' || barcode.length < 3) {
            return null;
        }
        
        const product = System.data.inventory?.find(item => 
            item.barcode && item.barcode.includes(barcode)
        );
        
        if (product && context === 'sales') {
            // تحديث واجهة المبيعات
            this.highlightProductInSales(product.id);
        } else if (product && context === 'inventory') {
            // تحديث واجهة المخزون
            this.highlightProductInInventory(product.id);
        }
        
        return product;
    }
    // ============================================================================
    // دالة البحث عن المنتج بالباركود - END
    // ============================================================================
    
    // ============================================================================
    // دالة تمييز المنتج في قائمة المخزون - START
    // ============================================================================
    highlightProductInInventory(productId) {
        const rows = document.querySelectorAll('#inventoryTableBody tr');
        rows.forEach(row => {
            if (row.dataset.productId === productId.toString()) {
                row.classList.add('highlight');
                setTimeout(() => row.classList.remove('highlight'), 3000);
                
                // التمرير إلى الصف
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }
    // ============================================================================
    // دالة تمييز المنتج في قائمة المخزون - END
    // ============================================================================
    
    // ============================================================================
    // دالة تمييز المنتج في قائمة المبيعات - START
    // ============================================================================
    highlightProductInSales(productId) {
        const rows = document.querySelectorAll('#salesTableBody tr');
        rows.forEach(row => {
            if (row.dataset.productId === productId.toString()) {
                row.classList.add('highlight');
                setTimeout(() => row.classList.remove('highlight'), 3000);
            }
        });
    }
    // ============================================================================
    // دالة تمييز المنتج في قائمة المبيعات - END
    // ============================================================================
    
    // ============================================================================
    // دالة توليد وإدارة الباركود للمنتجات المفقودة - START
    // ============================================================================
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
        
        // تحديث العرض
        if (window.InventoryManager) {
            window.InventoryManager.displayInventory();
        }
        
        Utils.showAlert(`تم توليد باركود لـ ${generatedCount} منتج`, 'success');
    }
    // ============================================================================
    // دالة توليد وإدارة الباركود للمنتجات المفقودة - END
    // ============================================================================
    
    // ============================================================================
    // دالة عرض سجل مسح الباركود - START
    // ============================================================================
    showBarcodeHistory() {
        const dialogHTML = `
            <div class="barcode-history-dialog">
                <h3><i class="fas fa-history"></i> سجل مسح الباركود</h3>
                
                ${this.barcodeHistory.length === 0 ? `
                    <p class="no-data">لا توجد سجلات مسح</p>
                ` : `
                    <div class="history-list">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f8f9fa;">
                                    <th style="padding: 10px; border-bottom: 2px solid #ddd;">التاريخ</th>
                                    <th style="padding: 10px; border-bottom: 2px solid #ddd;">الباركود</th>
                                    <th style="padding: 10px; border-bottom: 2px solid #ddd;">المنتج</th>
                                    <th style="padding: 10px; border-bottom: 2px solid #ddd;">الحالة</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.barcodeHistory.map(log => `
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 10px;">${new Date(log.timestamp).toLocaleString('ar-SA')}</td>
                                        <td style="padding: 10px; font-family: monospace;"><code>${log.barcode}</code></td>
                                        <td style="padding: 10px;">${log.product}</td>
                                        <td style="padding: 10px;">
                                            <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; 
                                                  ${log.status === 'موجود' ? 'background: #d4edda; color: #155724;' : 'background: #fff3cd; color: #856404;'}">
                                                ${log.status}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
                
                <div class="dialog-buttons" style="margin-top: 20px; text-align: left;">
                    <button class="btn btn-primary" onclick="window.barcodeSystem.exportBarcodeHistory()">
                        <i class="fas fa-download"></i> تصدير السجل
                    </button>
                    <button class="btn btn-secondary" onclick="window.barcodeSystem.closeScanner()">
                        إغلاق
                    </button>
                </div>
            </div>
        `;
        
        this.showDialog('سجل الباركود', dialogHTML);
    }
    // ============================================================================
    // دالة عرض سجل مسح الباركود - END
    // ============================================================================
    
    // ============================================================================
    // دالة تصدير سجل الباركود - START
    // ============================================================================
    exportBarcodeHistory() {
        const data = {
            exportDate: new Date().toISOString(),
            history: this.barcodeHistory,
            summary: {
                totalScans: this.barcodeHistory.length,
                found: this.barcodeHistory.filter(log => log.status === 'موجود').length,
                notFound: this.barcodeHistory.filter(log => log.status === 'غير موجود').length
            }
        };
        
        const jsonData = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `سجل_باركود_${Utils.getToday()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        Utils.showAlert('تم تصدير سجل الباركود', 'success');
    }
    // ============================================================================
    // دالة تصدير سجل الباركود - END
    // ============================================================================
    
    // ============================================================================
    // دالة إنشاء تقرير الباركود - START
    // ============================================================================
    generateBarcodeReport() {
        if (!System.data.inventory || System.data.inventory.length === 0) {
            Utils.showAlert('لا توجد منتجات في المخزون', 'info');
            return;
        }
        
        const productsWithBarcode = System.data.inventory.filter(item => item.barcode);
        const productsWithoutBarcode = System.data.inventory.filter(item => !item.barcode);
        
        const dialogHTML = `
            <div class="barcode-report-dialog">
                <h3><i class="fas fa-file-alt"></i> تقرير الباركود</h3>
                
                <div class="report-summary">
                    <div class="summary-cards" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0;">
                        <div class="card" style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                            <h4 style="margin: 0 0 10px 0; font-size: 14px;">إجمالي المنتجات</h4>
                            <div class="card-value" style="font-size: 24px; font-weight: bold;">${System.data.inventory.length}</div>
                        </div>
                        <div class="card" style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                            <h4 style="margin: 0 0 10px 0; font-size: 14px;">بها باركود</h4>
                            <div class="card-value" style="font-size: 24px; font-weight: bold; color: #28a745;">${productsWithBarcode.length}</div>
                        </div>
                        <div class="card" style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                            <h4 style="margin: 0 0 10px 0; font-size: 14px;">بدون باركود</h4>
                            <div class="card-value" style="font-size: 24px; font-weight: bold; color: #dc3545;">${productsWithoutBarcode.length}</div>
                        </div>
                        <div class="card" style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                            <h4 style="margin: 0 0 10px 0; font-size: 14px;">نسبة التغطية</h4>
                            <div class="card-value" style="font-size: 24px; font-weight: bold;">
                                ${System.data.inventory.length > 0 ? 
                                    ((productsWithBarcode.length / System.data.inventory.length) * 100).toFixed(1) + '%' : '0%'}
                            </div>
                        </div>
                    </div>
                </div>
                
                ${productsWithoutBarcode.length > 0 ? `
                    <div class="report-section" style="margin: 20px 0;">
                        <h4>المنتجات بدون باركود</h4>
                        <div class="products-list" style="max-height: 200px; overflow-y: auto; margin: 10px 0;">
                            <ul style="list-style: none; padding: 0;">
                                ${productsWithoutBarcode.map(product => `
                                    <li style="padding: 8px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
                                        <span>${product.name} (${product.category})</span>
                                        <span>الكمية: ${product.quantity}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                        <button class="btn btn-primary" onclick="window.barcodeSystem.generateMissingBarcodes()" style="margin-top: 10px;">
                            <i class="fas fa-barcode"></i> توليد باركود للجميع
                        </button>
                    </div>
                ` : ''}
                
                <div class="report-section" style="margin: 20px 0;">
                    <h4>خيارات التقرير</h4>
                    <div class="report-options" style="display: flex; gap: 10px;">
                        <button class="btn btn-success" onclick="window.barcodeSystem.printBarcodeLabels()">
                            <i class="fas fa-print"></i> طباعة ملصقات الباركود
                        </button>
                        <button class="btn btn-primary" onclick="window.barcodeSystem.exportBarcodeList()">
                            <i class="fas fa-file-excel"></i> تصدير قائمة الباركود
                        </button>
                    </div>
                </div>
                
                <div class="dialog-buttons" style="margin-top: 20px; text-align: left;">
                    <button class="btn btn-secondary" onclick="window.barcodeSystem.closeScanner()">
                        إغلاق
                    </button>
                </div>
            </div>
        `;
        
        this.showDialog('تقرير الباركود', dialogHTML);
    }
    // ============================================================================
    // دالة إنشاء تقرير الباركود - END
    // ============================================================================
    
    // ============================================================================
    // دالة طباعة ملصقات الباركود - START
    // ============================================================================
    printBarcodeLabels() {
        const productsWithBarcode = System.data.inventory?.filter(item => item.barcode) || [];
        
        if (productsWithBarcode.length === 0) {
            Utils.showAlert('لا توجد منتجات بها باركود للطباعة', 'error');
            return;
        }
        
        let labelsHTML = `
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>طباعة ملصقات الباركود</title>
                <style>
                    body { 
                        direction: rtl; 
                        text-align: right; 
                        font-family: Arial, sans-serif;
                        margin: 20px;
                    }
                    .barcode-labels {
                        width: 100%;
                    }
                    .label-grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 15px;
                        margin-top: 20px;
                    }
                    .label-item {
                        border: 1px solid #ddd;
                        padding: 15px;
                        text-align: center;
                        border-radius: 5px;
                        page-break-inside: avoid;
                    }
                    .label-name {
                        margin: 0 0 5px 0;
                        font-size: 14px;
                        font-weight: bold;
                    }
                    .label-category {
                        margin: 0 0 5px 0;
                        font-size: 12px;
                        color: #666;
                    }
                    .label-price {
                        margin: 0 0 10px 0;
                        font-size: 16px;
                        font-weight: bold;
                        color: #28a745;
                    }
                    .label-barcode {
                        background: #f8f9fa;
                        padding: 8px;
                        border-radius: 3px;
                        margin-bottom: 8px;
                        font-family: monospace;
                        font-size: 18px;
                        letter-spacing: 2px;
                    }
                    .label-date {
                        color: #999;
                        font-size: 11px;
                    }
                    @media print {
                        body { margin: 10px; }
                        .no-print { display: none !important; }
                        .label-grid {
                            grid-template-columns: repeat(3, 1fr) !important;
                        }
                    }
                </style>
            </head>
            <body>
                <h3 style="text-align: center; margin-bottom: 20px;">ملصقات الباركود</h3>
                <p style="text-align: center; color: #666;">عدد المنتجات: ${productsWithBarcode.length}</p>
                <div class="label-grid">
        `;
        
        productsWithBarcode.forEach(product => {
            labelsHTML += `
                <div class="label-item">
                    <h4 class="label-name">${product.name}</h4>
                    <p class="label-category">${product.category}</p>
                    <p class="label-price">${Utils.formatCurrency(product.price)}</p>
                    <div class="label-barcode">${product.barcode}</div>
                    <small class="label-date">${new Date().toLocaleDateString('ar-SA')}</small>
                </div>
            `;
        });
        
        labelsHTML += `
                </div>
                <div class="no-print" style="margin-top: 30px; text-align: center;">
                    <button onclick="window.print()" style="
                        padding: 12px 24px;
                        background: #007bff;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                        margin: 10px;
                    ">
                        <i class="fas fa-print"></i> طباعة
                    </button>
                    <button onclick="window.close()" style="
                        padding: 12px 24px;
                        background: #6c757d;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                    ">
                        إغلاق
                    </button>
                </div>
            </body>
            </html>
        `;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(labelsHTML);
        printWindow.document.close();
        
        // التركيز على نافذة الطباعة
        printWindow.focus();
    }
    // ============================================================================
    // دالة طباعة ملصقات الباركود - END
    // ============================================================================
    
    // ============================================================================
    // دالة تصدير قائمة الباركود - START
    // ============================================================================
    exportBarcodeList() {
        const barcodeList = System.data.inventory
            ?.filter(item => item.barcode)
            .map(item => ({
                اسم_المنتج: item.name,
                الفئة: item.category,
                الباركود: item.barcode,
                السعر: item.price,
                الكمية: item.quantity,
                القيمة: item.quantity * (item.cost || 0)
            })) || [];
        
        if (barcodeList.length === 0) {
            Utils.showAlert('لا توجد منتجات بها باركود للتصدير', 'error');
            return;
        }
        
        const data = {
            exportDate: new Date().toISOString(),
            totalProducts: barcodeList.length,
            products: barcodeList
        };
        
        const jsonData = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `قائمة_الباركود_${Utils.getToday()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        Utils.showAlert(`تم تصدير ${barcodeList.length} منتج`, 'success');
    }
    // ============================================================================
    // دالة تصدير قائمة الباركود - END
    // ============================================================================
    
    // ============================================================================
    // دالة عرض نافذة حوار - START
    // ============================================================================
    showDialog(title, content) {
        // إغلاق أي نافذة مفتوحة مسبقاً
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
                max-width: 800px;
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
    // ============================================================================
    // دالة عرض نافذة حوار - END
    // ============================================================================
    
    // ============================================================================
    // دالة تهيئة الفئات الافتراضية - START
    // ============================================================================
    initializeDefaultCategories() {
        const categoryInput = document.getElementById('inventoryCategory');
        if (categoryInput && !categoryInput.list) {
            // إضافة datalist للفئات
            const datalist = document.createElement('datalist');
            datalist.id = 'categoriesList';
            
            const defaultCategories = [
                'الكترونيات',
                'ملابس',
                'أحذية',
                'أثاث',
                'أدوات',
                'مواد غذائية',
                'مشروبات',
                'مكتبية',
                'ألعاب',
                'رياضية',
                'منزلية',
                'جمال',
                'صحة',
                'سيارات',
                'كتب',
                'أخرى'
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
    // ============================================================================
    // دالة تهيئة الفئات الافتراضية - END
    // ============================================================================
    
    // ============================================================================
// دالة دعم HTTPS للكاميرا - START
// ============================================================================
checkCameraSupport() {
    // التحقق من أن الصفحة تستخدم HTTPS (مطلوب للكاميرا)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        console.warn('الكاميرا تتطلب HTTPS للعمل بشكل صحيح');
        return false;
    }
    
    // التحقق من دعم المتصفح
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('المتصفح لا يدعم وصول الكاميرا');
        return false;
    }
    
    return true;
}
// ============================================================================
// دالة دعم HTTPS للكاميرا - END
// ============================================================================
    
    
}

// إنشاء نسخة واحدة من النظام
window.barcodeSystem = new BarcodeSystem();