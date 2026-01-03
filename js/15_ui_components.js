// ============================================================================
// مكونات واجهة المستخدم
// ============================================================================

class UIComponents {
    static initNavigation() {
        // إدارة التنقل بين الأقسام
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                // إزالة النشاط من جميع أزرار التنقل
                document.querySelectorAll('.nav-btn').forEach(b => {
                    b.classList.remove('active');
                });
                
                // إضافة النشاط للزر الحالي
                this.classList.add('active');
                
                // إخفاء جميع أقسام المحتوى
                document.querySelectorAll('.content-section').forEach(section => {
                    section.classList.remove('active');
                });
                
                // إظهار القسم المطلوب
                const sectionId = this.getAttribute('data-section');
                const targetSection = document.getElementById(sectionId);
                if (targetSection) {
                    targetSection.classList.add('active');
                }
            });
        });
    }
    
    static initAutoBackup() {
        const autoBackupInterval = document.getElementById('autoBackupInterval');
        if (!autoBackupInterval) return;
        
        // تعيين القيمة الحالية من localStorage
        const savedInterval = localStorage.getItem('autoBackupInterval') || 'disabled';
        autoBackupInterval.value = savedInterval;
        
        // إضافة حدث التغيير
        autoBackupInterval.addEventListener('change', function() {
            const interval = this.value;
            LocalBackupManager.setAutoBackupInterval(interval);
        });
        
        // التحقق من النسخ التلقائي
        LocalBackupManager.checkAutoBackup();
    }
    
    static initStorageStatus() {
        this.updateStorageStatus();
        
        // تحديث حالة التخزين كل دقيقة
        setInterval(() => {
            this.updateStorageStatus();
        }, 60000);
    }
    
    static updateStorageStatus() {
        // حساب حجم البيانات الحالية
        const salesSize = JSON.stringify(System.data.sales).length;
        const purchasesSize = JSON.stringify(System.data.purchases).length;
        const expensesSize = JSON.stringify(System.data.expenses).length;
        const inventorySize = JSON.stringify(System.data.inventory).length;
        
        const totalSize = salesSize + purchasesSize + expensesSize + inventorySize;
        
        // تحديث واجهة المستخدم
        const dataSizeElement = document.getElementById('dataSize');
        const usedStorageElement = document.getElementById('usedStorage');
        const storageFillElement = document.getElementById('storageFill');
        
        if (dataSizeElement) {
            dataSizeElement.textContent = (totalSize / 1024).toFixed(2) + ' KB';
        }
        
        if (usedStorageElement) {
            usedStorageElement.textContent = (totalSize / 1024).toFixed(2) + ' KB';
        }
        
        if (storageFillElement) {
            // حساب نسبة التخزين (افتراضياً 15GB كحد أقصى)
            const storagePercentage = (totalSize / (15 * 1024 * 1024)) * 100;
            storageFillElement.style.width = Math.min(storagePercentage, 100) + '%';
            
            // تغيير اللون حسب النسبة
            if (storagePercentage > 80) {
                storageFillElement.style.backgroundColor = '#dc3545'; // أحمر
            } else if (storagePercentage > 60) {
                storageFillElement.style.backgroundColor = '#ffc107'; // أصفر
            } else {
                storageFillElement.style.backgroundColor = '#28a745'; // أخضر
            }
        }
    }
    
    static initReportFilters() {
        // إخفاء/إظهار تواريخ الفترة المخصصة
        const reportPeriod = document.getElementById('reportPeriod');
        const customDates = document.getElementById('customDates');
        
        if (reportPeriod && customDates) {
            reportPeriod.addEventListener('change', function() {
                if (this.value === 'custom') {
                    customDates.style.display = 'block';
                } else {
                    customDates.style.display = 'none';
                }
            });
            
            // تعيين الحالة الافتراضية
            if (reportPeriod.value !== 'custom') {
                customDates.style.display = 'none';
            }
        }
    }
    
    static initAllBackupsView() {
        const viewAllBackupsBtn = document.getElementById('viewAllBackupsBtn');
        if (viewAllBackupsBtn) {
            viewAllBackupsBtn.addEventListener('click', () => {
                this.showAllBackupsDialog();
            });
        }
    }
    
    static showAllBackupsDialog() {
        const backups = System.data.backups;
        const activities = System.data.backupActivities;
        
        let dialogHTML = `
            <div class="all-backups-dialog">
                <h3><i class="fas fa-database"></i> جميع النسخ الاحتياطية</h3>
                
                <div class="backups-section">
                    <h4>النسخ الاحتياطية المحلية (${backups.length})</h4>
        `;
        
        if (backups.length === 0) {
            dialogHTML += '<p class="no-data">لا توجد نسخ احتياطية محلية</p>';
        } else {
            dialogHTML += `
                <div class="backups-table">
                    <table>
                        <thead>
                            <tr>
                                <th>الاسم</th>
                                <th>التاريخ</th>
                                <th>النوع</th>
                                <th>الحجم</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            backups.forEach(backup => {
                const date = new Date(backup.date);
                dialogHTML += `
                    <tr>
                        <td>${backup.info.name}</td>
                        <td>${date.toLocaleDateString('ar-SA')}</td>
                        <td>${backup.info.type === 'full' ? 'كاملة' : 'تزايدية'}</td>
                        <td>${(backup.size / 1024).toFixed(2)} KB</td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="localBackupManager.restoreBackup('${backup.id}')">
                                <i class="fas fa-redo"></i>
                            </button>
                            <button class="btn btn-sm btn-success" onclick="localBackupManager.downloadBackup('${backup.id}')">
                                <i class="fas fa-download"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            dialogHTML += '</tbody></table></div>';
        }
        
        dialogHTML += `
                </div>
                
                <hr>
                
                <div class="activities-section">
                    <h4>سجل النشاطات (${activities.length})</h4>
        `;
        
        if (activities.length === 0) {
            dialogHTML += '<p class="no-data">لا توجد سجلات نشاط</p>';
        } else {
            dialogHTML += `
                <div class="activities-table">
                    <table>
                        <thead>
                            <tr>
                                <th>التاريخ</th>
                                <th>النشاط</th>
                                <th>التفاصيل</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            activities.slice(-10).reverse().forEach(activity => {
                const date = new Date(activity.date);
                dialogHTML += `
                    <tr>
                        <td>${date.toLocaleDateString('ar-SA')} ${date.toLocaleTimeString('ar-SA')}</td>
                        <td>${activity.action || 'نشاط غير محدد'}</td>
                        <td>${activity.details || '-'}</td>
                    </tr>
                `;
            });
            
            dialogHTML += '</tbody></table></div>';
        }
        
        dialogHTML += `
                </div>
                
                <div class="dialog-buttons" style="margin-top: 20px;">
                    <button class="btn btn-primary" onclick="this.closest('.all-backups-dialog').closest('.ui-dialog-overlay').remove()">
                        إغلاق
                    </button>
                </div>
            </div>
        `;
        
        this.showUIDialog('جميع النسخ الاحتياطية', dialogHTML);
    }
    
    static showUIDialog(title, content) {
        const dialog = document.createElement('div');
        dialog.className = 'ui-dialog-overlay';
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
            <div class="ui-dialog" style="
                background: white;
                padding: 25px;
                border-radius: 10px;
                max-width: 900px;
                width: 100%;
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
                    <button class="close-ui-dialog" style="
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
        dialog.querySelector('.close-ui-dialog').addEventListener('click', () => {
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

// إضافة LocalBackupManager المفقودة
class LocalBackupManagerExtension {
    static setAutoBackupInterval(interval) {
        if (interval === 'disabled') {
            localStorage.removeItem('autoBackupInterval');
            localStorage.removeItem('nextAutoBackup');
            Utils.showAlert('تم تعطيل النسخ التلقائي.', 'success');
            return;
        }
        
        // حفظ الإعدادات
        localStorage.setItem('autoBackupInterval', interval);
        
        // حساب موعد النسخة التالية
        const now = new Date();
        let nextDate = new Date(now);
        
        switch(interval) {
            case 'daily':
                nextDate.setDate(now.getDate() + 1);
                break;
            case 'weekly':
                nextDate.setDate(now.getDate() + 7);
                break;
            case 'monthly':
                nextDate.setMonth(now.getMonth() + 1);
                break;
        }
        
        localStorage.setItem('nextAutoBackup', nextDate.toISOString());
        
        const intervalTexts = {
            'daily': 'يومي',
            'weekly': 'أسبوعي',
            'monthly': 'شهري'
        };
        
        Utils.showAlert(`تم ضبط النسخ التلقائي على ${intervalTexts[interval] || interval}.`, 'success');
    }
    
    static checkAutoBackup() {
        const interval = localStorage.getItem('autoBackupInterval');
        const nextBackup = localStorage.getItem('nextAutoBackup');
        
        if (!interval || interval === 'disabled' || !nextBackup) {
            return;
        }
        
        const now = new Date();
        const nextDate = new Date(nextBackup);
        
        // إذا حان وقت النسخ التلقائي
        if (now >= nextDate) {
            // إنشاء نسخة تلقائية
            window.localBackupManager.createBackup('incremental', 
                `نسخة_تلقائية_${Utils.getToday()}`, 
                'نسخة احتياطية تلقائية');
            
            // تحديث الموعد التالي
            this.setAutoBackupInterval(interval);
        }
    }
}

// دمج الفئتين
Object.assign(window.localBackupManager.__proto__, LocalBackupManagerExtension);