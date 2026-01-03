// ============================================================================
// النسخ الاحتياطي المحلي
// ============================================================================

class LocalBackupManager {
    constructor() {
        this.maxBackups = 20;
        this.maxBackupHistory = 50;
    }
    
    init() {
        this.bindEvents();
        this.updateBackupList();
        this.updateStatistics();
    }
    
    bindEvents() {
        // زر إنشاء نسخة احتياطية
        document.getElementById('createBackupBtn')?.addEventListener('click', () => {
            this.showCreateBackupDialog();
        });
        
        // زر تصدير البيانات
        document.getElementById('exportDataBtn')?.addEventListener('click', () => {
            this.exportData();
        });
        
        // زر نسخ للحافظة
        document.getElementById('copyToClipboardBtn')?.addEventListener('click', () => {
            this.copyToClipboard();
        });
        
        // استيراد من الملف
        document.getElementById('backupFile')?.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.importFromFile(e.target.files[0]);
            }
        });
        
        // استيراد من النصوص
        document.getElementById('importFromTextBtn')?.addEventListener('click', () => {
            this.importFromText();
        });
    }
    
    showCreateBackupDialog() {
        const dialogHTML = `
            <div class="backup-dialog-content">
                <h3>إنشاء نسخة احتياطية جديدة</h3>
                <p>اختر نوع النسخة الاحتياطية:</p>
                
                <div class="form-group">
                    <label>
                        <input type="radio" name="backupType" value="full" checked>
                        نسخة كاملة (جميع البيانات)
                    </label>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="radio" name="backupType" value="incremental">
                        نسخة تزايدية (التغييرات فقط)
                    </label>
                </div>
                
                <div class="form-group">
                    <label for="backupName">اسم النسخة الاحتياطية:</label>
                    <input type="text" id="backupName" class="form-control" 
                           value="نسخة_احتياطية_${Utils.getToday()}">
                </div>
                
                <div class="form-group">
                    <label for="backupDescription">وصف النسخة (اختياري):</label>
                    <textarea id="backupDescription" class="form-control" rows="3" 
                              placeholder="وصف مختصر للنسخة الاحتياطية"></textarea>
                </div>
                
                <div class="dialog-buttons">
                    <button class="btn btn-secondary" id="cancelBackup">إلغاء</button>
                    <button class="btn btn-primary" id="confirmBackup">إنشاء</button>
                </div>
            </div>
        `;
        
        this.showDialog('إنشاء نسخة احتياطية', dialogHTML, () => {
            const backupType = document.querySelector('input[name="backupType"]:checked').value;
            const backupName = document.getElementById('backupName').value;
            const backupDescription = document.getElementById('backupDescription').value;
            
            this.createBackup(backupType, backupName, backupDescription);
        });
    }
    
    async createBackup(type, name, description) {
        try {
            // جمع جميع البيانات
            const allData = {
                backupInfo: {
                    name: name,
                    description: description,
                    type: type,
                    createdAt: new Date().toISOString(),
                    systemVersion: CONFIG.APP_VERSION
                },
                systemData: {
                    sales: System.data.sales,
                    purchases: System.data.purchases,
                    expenses: System.data.expenses,
                    inventory: System.data.inventory
                },
                statistics: {
                    salesCount: System.data.sales.length,
                    purchasesCount: System.data.purchases.length,
                    expensesCount: System.data.expenses.length,
                    inventoryCount: System.data.inventory.length
                }
            };
            
            const jsonData = JSON.stringify(allData, null, 2);
            
            // حفظ النسخة المحلية
            this.saveLocalBackup(jsonData, allData.backupInfo);
            
            // تحديث العرض
            this.updateBackupList();
            this.updateStatistics();
            
            Utils.showAlert('تم إنشاء النسخة الاحتياطية بنجاح', 'success');
            
        } catch (error) {
            console.error('خطأ في إنشاء النسخة الاحتياطية:', error);
            Utils.showAlert('حدث خطأ أثناء إنشاء النسخة الاحتياطية', 'error');
        }
    }
    
    saveLocalBackup(data, backupInfo) {
        // الحصول على قائمة النسخ الحالية
        const backups = System.data.backups;
        
        // إنشاء كائن النسخة الجديدة
        const newBackup = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            info: backupInfo,
            size: data.length,
            data: data
        };
        
        // إضافة النسخة الجديدة في البداية
        backups.unshift(newBackup);
        
        // حفظ القائمة المحددة (الحد الأقصى)
        if (backups.length > this.maxBackups) {
            backups.splice(this.maxBackups);
        }
        
        System.saveBackups();
        
        // تسجيل في سجل النشاطات
        this.logBackupActivity('إنشاء نسخة محلية', backupInfo.name);
    }
    
    exportData() {
        try {
            // جمع جميع البيانات
            const allData = {
                exportDate: new Date().toISOString(),
                sales: System.data.sales,
                purchases: System.data.purchases,
                expenses: System.data.expenses,
                inventory: System.data.inventory
            };
            
            const jsonData = JSON.stringify(allData, null, 2);
            
            // إنشاء ملف للتحميل
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // إنشاء رابط تحميل
            const a = document.createElement('a');
            a.href = url;
            a.download = `نسخة_احتياطية_${Utils.getToday()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // تحرير الذاكرة
            URL.revokeObjectURL(url);
            
            // تسجيل النسخة المحلية
            this.saveLocalBackup(jsonData, {
                name: `تصدير يدوي - ${Utils.getToday()}`,
                type: 'full',
                createdAt: new Date().toISOString()
            });
            
            Utils.showAlert('تم تصدير البيانات بنجاح', 'success');
            
        } catch (error) {
            console.error('خطأ في تصدير البيانات:', error);
            Utils.showAlert('حدث خطأ أثناء تصدير البيانات', 'error');
        }
    }
    
    copyToClipboard() {
        try {
            // جمع جميع البيانات
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
                Utils.showAlert('تم نسخ البيانات إلى الحافظة', 'success');
            }).catch(err => {
                // طريقة بديلة للمتصفحات القديمة
                const textArea = document.createElement('textarea');
                textArea.value = jsonData;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                Utils.showAlert('تم نسخ البيانات إلى الحافظة', 'success');
            });
            
        } catch (error) {
            console.error('خطأ في نسخ البيانات:', error);
            Utils.showAlert('حدث خطأ أثناء نسخ البيانات', 'error');
        }
    }
    
    importFromFile(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                this.confirmImport(data);
            } catch (error) {
                Utils.showAlert('الملف ليس بصيغة JSON صحيحة', 'error');
            }
        };
        
        reader.onerror = () => {
            Utils.showAlert('تعذر قراءة الملف', 'error');
        };
        
        reader.readAsText(file);
    }
    
    importFromText() {
        const dialogHTML = `
            <div class="import-dialog-content">
                <h3>استيراد البيانات من النصوص</h3>
                <p>الصق محتوى النسخة الاحتياطية في المربع أدناه:</p>
                
                <textarea id="importText" class="form-control" rows="10" 
                          placeholder="الصق محتوى JSON هنا..."></textarea>
                
                <div class="form-group" style="margin-top: 15px;">
                    <label>
                        <input type="checkbox" id="mergeData" checked>
                        دمج البيانات مع البيانات الحالية (بدون حذف)
                    </label>
                </div>
                
                <div class="dialog-buttons">
                    <button class="btn btn-secondary" id="cancelImport">إلغاء</button>
                    <button class="btn btn-primary" id="confirmImport">استيراد</button>
                </div>
            </div>
        `;
        
        this.showDialog('استيراد البيانات من النصوص', dialogHTML, () => {
            const importText = document.getElementById('importText').value;
            const mergeData = document.getElementById('mergeData').checked;
            
            if (!importText.trim()) {
                Utils.showAlert('يرجى لصق محتوى النسخة الاحتياطية', 'error');
                return;
            }
            
            try {
                const data = JSON.parse(importText);
                this.confirmImport(data, mergeData);
            } catch (error) {
                Utils.showAlert('النص ليس بصيغة JSON صحيحة', 'error');
            }
        });
    }
    
    async confirmImport(data, merge = false) {
        const confirmed = await Utils.confirmDialog(
            'تأكيد استيراد البيانات',
            `هل تريد استيراد البيانات التالية؟
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
        await this.createBackup('full', 
            `نسخة_قبل_الاستيراد_${Utils.getToday()}`, 
            'نسخة احتياطية قبل استيراد بيانات جديدة');
        
        // استيراد البيانات
        this.importData(data, merge);
    }
    
    importData(data, merge) {
        try {
            if (merge) {
                // دمج البيانات
                if (data.sales) {
                    const currentSales = System.data.sales;
                    const mergedSales = [...currentSales, ...data.sales];
                    System.data.sales = mergedSales;
                }
                
                if (data.purchases) {
                    const currentPurchases = System.data.purchases;
                    const mergedPurchases = [...currentPurchases, ...data.purchases];
                    System.data.purchases = mergedPurchases;
                }
                
                if (data.expenses) {
                    const currentExpenses = System.data.expenses;
                    const mergedExpenses = [...currentExpenses, ...data.expenses];
                    System.data.expenses = mergedExpenses;
                }
                
                if (data.inventory) {
                    const currentInventory = System.data.inventory;
                    const mergedInventory = [...currentInventory, ...data.inventory];
                    System.data.inventory = mergedInventory;
                }
            } else {
                // استبدال البيانات
                if (data.sales) System.data.sales = data.sales;
                if (data.purchases) System.data.purchases = data.purchases;
                if (data.expenses) System.data.expenses = data.expenses;
                if (data.inventory) System.data.inventory = data.inventory;
            }
            
            // حفظ البيانات
            System.saveAllData();
            
            // تسجيل النشاط
            this.logBackupActivity('استيراد البيانات', merge ? 'دمج مع البيانات الحالية' : 'استبدال البيانات');
            
            Utils.showAlert('تم استيراد البيانات بنجاح. سيتم إعادة تحميل الصفحة.', 'success');
            
            // إعادة تحميل الصفحة بعد تأخير
            setTimeout(() => {
                location.reload();
            }, 2000);
            
        } catch (error) {
            console.error('خطأ في استيراد البيانات:', error);
            Utils.showAlert('حدث خطأ أثناء استيراد البيانات', 'error');
        }
    }
    
    updateBackupList() {
        const backupList = document.getElementById('localBackupList');
        if (!backupList) return;
        
        const backups = System.data.backups;
        
        if (backups.length === 0) {
            backupList.innerHTML = `
                <div class="no-backups">
                    <i class="fas fa-database fa-2x"></i>
                    <p>لا توجد نسخ احتياطية محلية</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        
        backups.slice(0, 5).forEach((backup) => {
            const date = new Date(backup.date);
            const formattedDate = date.toLocaleDateString('ar-SA') + ' ' + date.toLocaleTimeString('ar-SA');
            const size = (backup.size / 1024).toFixed(2) + ' KB';
            
            html += `
                <div class="backup-item">
                    <div class="backup-info">
                        <div class="backup-name">${backup.info.name}</div>
                        <div class="backup-meta">
                            ${formattedDate} | ${size} | ${backup.info.type === 'full' ? 'كاملة' : 'تزايدية'}
                        </div>
                        <div class="backup-description">${backup.info.description || 'لا يوجد وصف'}</div>
                    </div>
                    <div class="backup-actions">
                        <button class="btn btn-sm btn-primary" onclick="localBackupManager.restoreBackup('${backup.id}')">
                            <i class="fas fa-redo"></i>
                        </button>
                        <button class="btn btn-sm btn-success" onclick="localBackupManager.downloadBackup('${backup.id}')">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="localBackupManager.deleteBackup('${backup.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        backupList.innerHTML = html;
    }
    
    async restoreBackup(backupId) {
        const backup = System.data.backups.find(b => b.id === backupId);
        if (!backup) {
            Utils.showAlert('لم يتم العثور على النسخة', 'error');
            return;
        }
        
        const confirmed = await Utils.confirmDialog(
            'استعادة نسخة احتياطية',
            `هل تريد استعادة النسخة الاحتياطية التالية؟
            <br><strong>الاسم:</strong> ${backup.info.name}
            <br><strong>التاريخ:</strong> ${new Date(backup.date).toLocaleString('ar-SA')}
            <br><strong>النوع:</strong> ${backup.info.type === 'full' ? 'كاملة' : 'تزايدية'}
            <br><strong>الحجم:</strong> ${(backup.size / 1024).toFixed(2)} KB
            
            <div class="alert alert-warning" style="margin-top: 10px;">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>تحذير:</strong> سيتم استبدال جميع البيانات الحالية.
            </div>`,
            'استعادة',
            'إلغاء'
        );
        
        if (!confirmed) return;
        
        try {
            const data = JSON.parse(backup.data);
            
            if (data.systemData) {
                // استعادة البيانات من نسخة احتياطية كاملة
                System.data.sales = data.systemData.sales || [];
                System.data.purchases = data.systemData.purchases || [];
                System.data.expenses = data.systemData.expenses || [];
                System.data.inventory = data.systemData.inventory || [];
                
                System.saveAllData();
                
                // تسجيل النشاط
                this.logBackupActivity('استعادة نسخة احتياطية', backup.info.name);
                
                Utils.showAlert('تم الاستعادة بنجاح. سيتم إعادة تحميل الصفحة.', 'success');
                
                setTimeout(() => {
                    location.reload();
                }, 2000);
            } else {
                Utils.showAlert('بيانات النسخة الاحتياطية غير صالحة', 'error');
            }
            
        } catch (error) {
            console.error('خطأ في استعادة النسخة:', error);
            Utils.showAlert('تعذر تحميل النسخة الاحتياطية', 'error');
        }
    }
    
    downloadBackup(backupId) {
        const backup = System.data.backups.find(b => b.id === backupId);
        if (!backup) {
            Utils.showAlert('لم يتم العثور على النسخة', 'error');
            return;
        }
        
        try {
            // إنشاء ملف للتحميل
            const blob = new Blob([backup.data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // إنشاء رابط تحميل
            const a = document.createElement('a');
            a.href = url;
            a.download = `نسخة_احتياطية_${backup.id}_${Utils.getToday()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // تحرير الذاكرة
            URL.revokeObjectURL(url);
            
            Utils.showAlert('تم التحميل بنجاح', 'success');
            
        } catch (error) {
            console.error('خطأ في تحميل النسخة:', error);
            Utils.showAlert('تعذر تحميل النسخة الاحتياطية', 'error');
        }
    }
    
    async deleteBackup(backupId) {
        const backup = System.data.backups.find(b => b.id === backupId);
        if (!backup) {
            Utils.showAlert('لم يتم العثور على النسخة', 'error');
            return;
        }
        
        const confirmed = await Utils.confirmDialog(
            'حذف نسخة احتياطية',
            `هل تريد حذف النسخة الاحتياطية التالية؟
            <br><strong>الاسم:</strong> ${backup.info.name}
            <br><strong>التاريخ:</strong> ${new Date(backup.date).toLocaleDateString('ar-SA')}
            <br><br>لا يمكن التراجع عن هذا الإجراء.`,
            'حذف',
            'إلغاء'
        );
        
        if (!confirmed) return;
        
        // تصفية النسخة المحذوفة
        System.data.backups = System.data.backups.filter(b => b.id !== backupId);
        System.saveBackups();
        
        // تحديث العرض
        this.updateBackupList();
        this.updateStatistics();
        
        // تسجيل النشاط
        this.logBackupActivity('حذف نسخة احتياطية', backup.info.name);
        
        Utils.showAlert('تم حذف النسخة الاحتياطية', 'success');
    }
    
    updateStatistics() {
        const backups = System.data.backups;
        
        // تحديث عدد النسخ
        const countElement = document.getElementById('localBackupCount');
        if (countElement) {
            countElement.textContent = backups.length;
        }
        
        // حساب إجمالي الحجم
        const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
        const sizeElement = document.getElementById('totalBackupSize');
        if (sizeElement) {
            sizeElement.textContent = (totalSize / 1024).toFixed(2) + ' KB';
        }
        
        // تحديث التواريخ
        if (backups.length > 0) {
            const firstBackup = new Date(backups[backups.length - 1].date);
            const lastBackup = new Date(backups[0].date);
            
            const firstDateElement = document.getElementById('firstBackupDate');
            const lastDateElement = document.getElementById('lastBackupDate');
            const lastSuccessfulElement = document.getElementById('lastSuccessfulBackup');
            
            if (firstDateElement) firstDateElement.textContent = firstBackup.toLocaleDateString('ar-SA');
            if (lastDateElement) lastDateElement.textContent = lastBackup.toLocaleDateString('ar-SA');
            if (lastSuccessfulElement) lastSuccessfulElement.textContent = lastBackup.toLocaleString('ar-SA');
        } else {
            const firstDateElement = document.getElementById('firstBackupDate');
            const lastDateElement = document.getElementById('lastBackupDate');
            const lastSuccessfulElement = document.getElementById('lastSuccessfulBackup');
            
            if (firstDateElement) firstDateElement.textContent = 'لا توجد';
            if (lastDateElement) lastDateElement.textContent = 'لا توجد';
            if (lastSuccessfulElement) lastSuccessfulElement.textContent = 'لا توجد';
        }
    }
    
    logBackupActivity(action, details) {
        const activity = {
            date: new Date().toISOString(),
            action: action,
            details: details
        };
        
        System.data.backupActivities.unshift(activity);
        
        // حفظ آخر 100 نشاط فقط
        if (System.data.backupActivities.length > 100) {
            System.data.backupActivities.splice(100);
        }
        
        localStorage.setItem(STORAGE_KEYS.BACKUP_ACTIVITIES, JSON.stringify(System.data.backupActivities));
    }
    
    showDialog(title, content, confirmCallback) {
        const dialog = document.createElement('div');
        dialog.className = 'backup-dialog-overlay';
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
        `;
        
        dialog.innerHTML = `
            <div class="backup-dialog" style="
                background: white;
                padding: 25px;
                border-radius: 10px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            ">
                <div class="dialog-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                ">
                    <h3 style="margin: 0;">${title}</h3>
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
        
        dialog.querySelector('#cancelBackup, #cancelImport')?.addEventListener('click', () => {
            dialog.remove();
        });
        
        dialog.querySelector('#confirmBackup, #confirmImport')?.addEventListener('click', () => {
            if (confirmCallback) confirmCallback();
            dialog.remove();
        });
        
        // إغلاق بالنقر خارج المحتوى
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
            }
        });
    }
}

// إنشاء نسخة واحدة من المدير
window.localBackupManager = new LocalBackupManager();