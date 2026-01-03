// ============================================================================
// النسخ الاحتياطي السحابي البديل
// ============================================================================

class CloudBackupManager {
    constructor() {
        this.cloudMethods = {
            'google-drive': {
                name: 'Google Drive',
                icon: 'fab fa-google-drive',
                description: 'حفظ الملف على Google Drive',
                steps: [
                    'حفظ الملف على جهازك',
                    'الدخول إلى Google Drive',
                    'رفع الملف يدوياً'
                ]
            },
            'email': {
                name: 'البريد الإلكتروني',
                icon: 'fas fa-envelope',
                description: 'إرسال النسخة إلى بريدك',
                steps: [
                    'إرسال البيانات إلى بريدك',
                    'فتح البريد وحفظ المرفق',
                    'الوصول من أي جهاز'
                ]
            },
            'copy': {
                name: 'نسخ البيانات',
                icon: 'fas fa-copy',
                description: 'نسخ ولصق في أي خدمة سحابية',
                steps: [
                    'نسخ البيانات إلى الحافظة',
                    'لصقها في Google Docs',
                    'حفظ المستند'
                ]
            }
        };
    }
    
    init() {
        this.bindEvents();
        this.updateCloudStatus();
    }
    
    bindEvents() {
        // زر رفع إلى Google Drive
        document.getElementById('googleDriveBackup')?.addEventListener('click', () => {
            this.showCloudBackupOptions();
        });
        
        // زر استعادة من Google Drive
        document.getElementById('googleDriveRestore')?.addEventListener('click', () => {
            this.showCloudRestoreOptions();
        });
    }
    
    showCloudBackupOptions() {
        // جمع البيانات للنسخة الاحتياطية
        const allData = {
            exportDate: new Date().toISOString(),
            sales: System.data.sales,
            purchases: System.data.purchases,
            expenses: System.data.expenses,
            inventory: System.data.inventory
        };
        
        const jsonData = JSON.stringify(allData, null, 2);
        
        const dialogHTML = `
            <div class="cloud-backup-options">
                <h3><i class="fas fa-cloud-upload-alt"></i> حفظ على السحابة</h3>
                
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    <strong>اختر طريقة الحفظ المناسبة لك:</strong>
                </div>
                
                <div class="cloud-methods">
                    ${Object.entries(this.cloudMethods).map(([methodId, method]) => `
                        <div class="cloud-method-card">
                            <div class="cloud-method-icon">
                                <i class="${method.icon}"></i>
                            </div>
                            <div class="cloud-method-content">
                                <h5>${method.name}</h5>
                                <p>${method.description}</p>
                                <div class="cloud-method-steps">
                                    <ol>
                                        ${method.steps.map(step => `<li>${step}</li>`).join('')}
                                    </ol>
                                </div>
                                <button class="btn btn-primary" onclick="cloudBackupManager.useMethod('${methodId}')">
                                    <i class="fas fa-arrow-right"></i> استخدام هذه الطريقة
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="data-preview">
                    <h5>معاينة البيانات:</h5>
                    <div class="preview-box">
                        <pre>${jsonData.substring(0, 300)}...</pre>
                        <small>إجمالي الحجم: ${(jsonData.length / 1024).toFixed(2)} KB</small>
                    </div>
                </div>
            </div>
        `;
        
        this.showDialog('النسخ الاحتياطي السحابي', dialogHTML);
    }
    
    useMethod(methodId) {
        switch(methodId) {
            case 'google-drive':
                this.downloadForGoogleDrive();
                break;
            case 'email':
                this.sendByEmail();
                break;
            case 'copy':
                this.copyFullData();
                break;
        }
    }
    
    downloadForGoogleDrive() {
        // إنشاء نسخة احتياطية
        const allData = {
            exportDate: new Date().toISOString(),
            sales: System.data.sales,
            purchases: System.data.purchases,
            expenses: System.data.expenses,
            inventory: System.data.inventory
        };
        
        const jsonData = JSON.stringify(allData, null, 2);
        
        // تحميل الملف
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `نسخة_احتياطية_Google_Drive_${Utils.getToday()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        // عرض تعليمات
        setTimeout(() => {
            this.showGoogleDriveInstructions(a.download);
        }, 500);
    }
    
    showGoogleDriveInstructions(fileName) {
        const instructionsHTML = `
            <div class="instructions-dialog">
                <h3><i class="fab fa-google-drive"></i> كيف تحفظ على Google Drive؟</h3>
                
                <div class="steps">
                    <div class="step">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h5>الملف تم تحميله</h5>
                            <p>تم تحميل الملف: <strong>${fileName}</strong></p>
                            <p>اذهب إلى مجلد التنزيلات على جهازك</p>
                        </div>
                    </div>
                    
                    <div class="step">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <h5>افتح Google Drive</h5>
                            <p>اذهب إلى <a href="https://drive.google.com" target="_blank">drive.google.com</a></p>
                            <p>سجّل الدخول بحساب Google الخاص بك</p>
                        </div>
                    </div>
                    
                    <div class="step">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <h5>ارفع الملف</h5>
                            <p>انقر على <strong>"جديد" → "تحميل ملف"</strong></p>
                            <p>اختر الملف الذي تم تحميله</p>
                            <p>انتظر اكتمال الرفع</p>
                        </div>
                    </div>
                </div>
                
                <div class="alert alert-success">
                    <i class="fas fa-check-circle"></i>
                    <strong>تم!</strong> النسخة الآن آمنة على Google Drive.
                </div>
                
                <div class="dialog-buttons">
                    <button class="btn btn-primary" onclick="this.closest('.instructions-dialog').closest('.cloud-dialog-overlay').remove()">
                        فهمت
                    </button>
                </div>
            </div>
        `;
        
        this.showDialog('تعليمات Google Drive', instructionsHTML);
    }
    
    sendByEmail() {
        try {
            const allData = {
                exportDate: new Date().toISOString(),
                sales: System.data.sales,
                purchases: System.data.purchases,
                expenses: System.data.expenses,
                inventory: System.data.inventory
            };
            
            const jsonData = JSON.stringify(allData, null, 2);
            const today = new Date().toLocaleDateString('ar-SA');
            
            // إنشاء رابط mailto
            const subject = encodeURIComponent(`نسخة احتياطية - نظام المحاسبة - ${today}`);
            const body = encodeURIComponent(`
نسخة احتياطية من نظام المحاسبة

التاريخ: ${today}
الوقت: ${new Date().toLocaleTimeString('ar-SA')}

عدد السجلات:
- المبيعات: ${allData.sales.length}
- المشتريات: ${allData.purchases.length}
- المصروفات: ${allData.expenses.length}
- المنتجات: ${allData.inventory.length}

يمكنك نسخ محتوى JSON المرفق واستعادته في أي وقت.

مع التقدير،
نظام محاسبة المتاجر الصغيرة
            `);
            
            const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
            
            // عرض خيارات البريد
            const emailHTML = `
                <div class="email-backup-dialog">
                    <h3><i class="fas fa-envelope"></i> إرسال النسخة الاحتياطية</h3>
                    
                    <div class="alert alert-success">
                        <i class="fas fa-check-circle"></i>
                        <strong>جاهز للإرسال!</strong> اختر طريقة الإرسال:
                    </div>
                    
                    <div class="email-options">
                        <div class="email-option">
                            <h5><i class="fas fa-paper-plane"></i> طريقة مباشرة</h5>
                            <p>سيتم فتح بريدك الإلكتروني تلقائياً</p>
                            <a href="${mailtoLink}" class="btn btn-primary btn-block">
                                <i class="fas fa-external-link-alt"></i> فتح البريد الإلكتروني
                            </a>
                        </div>
                        
                        <div class="email-option">
                            <h5><i class="fas fa-copy"></i> طريقة النسخ</h5>
                            <p>انسخ البيانات وأرسلها يدوياً</p>
                            <button class="btn btn-success btn-block" onclick="cloudBackupManager.copyFullData()">
                                <i class="fas fa-copy"></i> نسخ البيانات
                            </button>
                            <small class="text-muted">ثم الصقها في أي بريد إلكتروني</small>
                        </div>
                    </div>
                    
                    <div class="email-preview">
                        <h5>بيانات الإرسال:</h5>
                        <div class="preview-box">
                            <textarea readonly class="form-control" rows="4">
موضوع: نسخة احتياطية - نظام المحاسبة - ${today}

تحتوي هذه الرسالة على نسخة احتياطية من جميع بيانات النظام.
                            </textarea>
                        </div>
                    </div>
                    
                    <div class="dialog-buttons">
                        <button class="btn btn-secondary" onclick="this.closest('.email-backup-dialog').closest('.cloud-dialog-overlay').remove()">
                            إغلاق
                        </button>
                    </div>
                </div>
            `;
            
            this.showDialog('إرسال بالبريد الإلكتروني', emailHTML);
            
        } catch (error) {
            console.error('خطأ في إرسال البريد:', error);
            Utils.showAlert('تعذر إنشاء رابط البريد', 'error');
        }
    }
    
    copyFullData() {
        try {
            const allData = {
                exportDate: new Date().toISOString(),
                sales: System.data.sales,
                purchases: System.data.purchases,
                expenses: System.data.expenses,
                inventory: System.data.inventory
            };
            
            const jsonData = JSON.stringify(allData, null, 2);
            
            // نسخ إلى الحافظة
            navigator.clipboard.writeText(jsonData).then(() => {
                const successHTML = `
                    <div class="copy-success-dialog">
                        <h3><i class="fas fa-check-circle text-success"></i> تم النسخ بنجاح!</h3>
                        
                        <div class="alert alert-success">
                            <p>تم نسخ جميع البيانات إلى الحافظة</p>
                            <p>يمكنك الآن:</p>
                            <ol>
                                <li>فتح <a href="https://docs.google.com" target="_blank">Google Docs</a></li>
                                <li>إنشاء مستند جديد</li>
                                <li>الصق المحتوى (Ctrl+V)</li>
                                <li>حفظ المستند</li>
                            </ol>
                            <p><strong>أو:</strong> الصق في أي بريد إلكتروني أو تطبيق تخزين سحابي</p>
                        </div>
                        
                        <div class="dialog-buttons">
                            <button class="btn btn-primary" onclick="this.closest('.copy-success-dialog').closest('.cloud-dialog-overlay').remove()">
                                فهمت
                            </button>
                        </div>
                    </div>
                `;
                
                this.showDialog('تم النسخ بنجاح', successHTML);
                
            }).catch(err => {
                // طريقة بديلة للمتصفحات القديمة
                const textarea = document.createElement('textarea');
                textarea.value = jsonData;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                
                Utils.showAlert('تم نسخ البيانات إلى الحافظة', 'success');
            });
            
        } catch (error) {
            console.error('خطأ في النسخ:', error);
            Utils.showAlert('تعذر نسخ البيانات', 'error');
        }
    }
    
    showCloudRestoreOptions() {
        const dialogHTML = `
            <div class="cloud-restore-options">
                <h3><i class="fas fa-cloud-download-alt"></i> استعادة من السحابة</h3>
                
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    <strong>اختر طريقة الاستعادة المناسبة لك:</strong>
                </div>
                
                <div class="restore-methods">
                    <div class="restore-method">
                        <h5><i class="fas fa-file-upload"></i> رفع ملف النسخة</h5>
                        <p>اختر ملف النسخة الاحتياطية من جهازك</p>
                        <div class="file-upload-area">
                            <input type="file" id="cloudRestoreFile" accept=".json" style="display: none;">
                            <label for="cloudRestoreFile" class="btn btn-primary">
                                <i class="fas fa-upload"></i> اختر ملف
                            </label>
                            <small class="text-muted">يجب أن يكون الملف بصيغة JSON</small>
                        </div>
                    </div>
                    
                    <div class="restore-method">
                        <h5><i class="fas fa-paste"></i> لصق البيانات</h5>
                        <p>الصق محتوى النسخة الاحتياطية مباشرة</p>
                        <button class="btn btn-success" onclick="cloudBackupManager.showPasteDataDialog()">
                            <i class="fas fa-paste"></i> لصق البيانات
                        </button>
                    </div>
                </div>
                
                <div class="dialog-buttons">
                    <button class="btn btn-secondary" onclick="this.closest('.cloud-restore-options').closest('.cloud-dialog-overlay').remove()">
                        إغلاق
                    </button>
                </div>
            </div>
        `;
        
        this.showDialog('استعادة من السحابة', dialogHTML);
        
        // إضافة حدث لرفع الملف
        const fileInput = document.getElementById('cloudRestoreFile');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFileUpload(e.target.files[0]);
                }
            });
        }
    }
    
    handleFileUpload(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                this.confirmCloudRestore(data);
            } catch (error) {
                Utils.showAlert('الملف ليس بصيغة JSON صحيحة', 'error');
            }
        };
        
        reader.onerror = () => {
            Utils.showAlert('تعذر قراءة الملف', 'error');
        };
        
        reader.readAsText(file);
    }
    
    showPasteDataDialog() {
        const dialogHTML = `
            <div class="paste-data-dialog">
                <h3><i class="fas fa-paste"></i> لصق البيانات</h3>
                
                <p>الصق محتوى النسخة الاحتياطية في المربع أدناه:</p>
                
                <textarea id="pasteDataText" class="form-control" rows="10" 
                          placeholder="الصق محتوى JSON هنا..."></textarea>
                
                <div class="form-group" style="margin-top: 15px;">
                    <label>
                        <input type="checkbox" id="mergeCloudData" checked>
                        دمج البيانات مع البيانات الحالية (بدون حذف)
                    </label>
                </div>
                
                <div class="dialog-buttons">
                    <button class="btn btn-secondary" onclick="this.closest('.paste-data-dialog').closest('.cloud-dialog-overlay').remove()">
                        إلغاء
                    </button>
                    <button class="btn btn-primary" id="confirmPasteData">
                        استيراد
                    </button>
                </div>
            </div>
        `;
        
        this.showDialog('لصق البيانات', dialogHTML, () => {
            const pasteText = document.getElementById('pasteDataText').value;
            const mergeData = document.getElementById('mergeCloudData').checked;
            
            if (!pasteText.trim()) {
                Utils.showAlert('يرجى لصق محتوى النسخة الاحتياطية', 'error');
                return;
            }
            
            try {
                const data = JSON.parse(pasteText);
                this.confirmCloudRestore(data, mergeData);
            } catch (error) {
                Utils.showAlert('النص ليس بصيغة JSON صحيحة', 'error');
            }
        });
    }
    
    async confirmCloudRestore(data, merge = false) {
        const confirmed = await Utils.confirmDialog(
            'تأكيد استيراد البيانات',
            `هل تريد استيراد البيانات من السحابة؟
            ${data.sales ? `\n• المبيعات: ${data.sales.length} عملية` : ''}
            ${data.purchases ? `\n• المشتريات: ${data.purchases.length} عملية` : ''}
            ${data.expenses ? `\n• المصروفات: ${data.expenses.length} عملية` : ''}
            ${data.inventory ? `\n• المنتجات: ${data.inventory.length} منتج` : ''}
            
            سيتم ${merge ? 'دمج' : 'استبدال'} البيانات الحالية.`,
            'استيراد',
            'إلغاء'
        );
        
        if (!confirmed) return;
        
        // إنشاء نسخة احتياطية قبل الاستيراد
        await window.localBackupManager.createBackup('full', 
            `نسخة_قبل_الاستيراد_السحابي_${Utils.getToday()}`, 
            'نسخة احتياطية قبل استيراد بيانات من السحابة');
        
        // استيراد البيانات
        window.localBackupManager.importData(data, merge);
    }
    
    updateCloudStatus() {
        const statusElement = document.getElementById('googleAuthStatus');
        if (!statusElement) return;
        
        statusElement.className = 'auth-status cloud-connected';
        statusElement.innerHTML = `
            <span class="status-dot" style="background-color: #34a853;"></span>
            <span>متاح للاستخدام</span>
        `;
    }
    
    showDialog(title, content, confirmCallback = null) {
        const dialog = document.createElement('div');
        dialog.className = 'cloud-dialog-overlay';
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
            <div class="cloud-dialog" style="
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
                    border-bottom: 2px solid #3498db;
                ">
                    <h3 style="margin: 0; color: #2c3e50;">
                        <i class="fas fa-cloud"></i> ${title}
                    </h3>
                    <button class="close-cloud-dialog" style="
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
        dialog.querySelector('.close-cloud-dialog').addEventListener('click', () => {
            dialog.remove();
        });
        
        // إغلاق بالنقر خارج المحتوى
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
            }
        });
        
        // إضافة حدث للموافقة إذا كان موجوداً
        if (confirmCallback) {
            const confirmButton = dialog.querySelector('#confirmPasteData');
            if (confirmButton) {
                confirmButton.addEventListener('click', () => {
                    confirmCallback();
                    dialog.remove();
                });
            }
        }
    }
}

// إنشاء نسخة واحدة من المدير
window.cloudBackupManager = new CloudBackupManager();