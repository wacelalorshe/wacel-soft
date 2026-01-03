// ============================================================================
// معالجات الأحداث العامة
// ============================================================================

class EventHandlers {
    static init() {
        this.initNavigation();
        this.initModalEvents();
        this.initButtonEvents();
        this.initReportEvents();
        this.initBackupEvents();
        this.initAutoCloseModals();
    }
    
    static initNavigation() {
        // التنقل بين الأقسام
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                // إزالة النشاط من جميع الأزرار
                document.querySelectorAll('.nav-btn').forEach(b => {
                    b.classList.remove('active');
                });
                
                // إضافة النشاط للزر الحالي
                this.classList.add('active');
                
                // إخفاء جميع الأقسام
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
    
    static initModalEvents() {
        // فتح وإغلاق النوافذ المنبثقة
        
        // المبيعات
        document.getElementById('addSaleBtn')?.addEventListener('click', () => {
            document.getElementById('saleDate').value = Utils.getToday();
            ModalManager.open('saleModal');
        });
        
        // المشتريات
        document.getElementById('addPurchaseBtn')?.addEventListener('click', () => {
            document.getElementById('purchaseDate').value = Utils.getToday();
            ModalManager.open('purchaseModal');
        });
        
        // المصروفات
        document.getElementById('addExpenseBtn')?.addEventListener('click', () => {
            document.getElementById('expenseDate').value = Utils.getToday();
            ModalManager.open('expenseModal');
        });
        
        // المخزون
        document.getElementById('addInventoryBtn')?.addEventListener('click', () => {
            ModalManager.open('inventoryModal');
        });
        
        // تهيئة أزرار إغلاق النوافذ
        ModalManager.initModalCloseButtons();
    }
    
    static initButtonEvents() {
        // تحديث لوحة التحكم
        document.getElementById('refreshDashboard')?.addEventListener('click', () => {
            if (window.DashboardManager) {
                window.DashboardManager.updateDashboard();
            }
            Utils.showAlert('تم تحديث البيانات', 'success');
        });
        
        // توليد التقارير الأساسية
        document.getElementById('generateReport')?.addEventListener('click', () => {
            if (window.DashboardManager) {
                window.DashboardManager.generateReport();
            }
        });
        
        // طباعة التقرير
        document.getElementById('printReport')?.addEventListener('click', () => {
            window.print();
        });
        
        // تصدير PDF
        document.getElementById('exportPDF')?.addEventListener('click', () => {
            if (window.PDFSystem) {
                window.PDFSystem.printSalesReport('monthly');
            } else {
                Utils.showAlert('ميزة PDF قيد التطوير', 'info');
            }
        });
        
        // تصدير Excel
        document.getElementById('exportExcel')?.addEventListener('click', () => {
            Utils.showAlert('ميزة Excel قيد التطوير', 'info');
        });
        
        // تصدير جميع التقارير
        document.getElementById('exportAllReports')?.addEventListener('click', () => {
            if (window.PDFSystem) {
                window.PDFSystem.exportAllReports();
            }
        });
        
        // تنظيف النسخ القديمة
        document.getElementById('cleanOldBackups')?.addEventListener('click', () => {
            this.cleanOldBackups();
        });
        
        // حذف جميع النسخ
        document.getElementById('deleteAllBackups')?.addEventListener('click', () => {
            this.deleteAllBackups();
        });
    }
    
    static initReportEvents() {
        // تصنيفات التقارير المتقدمة
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                if (window.ReportsManager) {
                    window.ReportsManager.changeReportType(this);
                }
            });
        });
        
        // الفترة الزمنية للتقارير
        document.getElementById('reportPeriod')?.addEventListener('change', function() {
            const customDates = document.getElementById('customDates');
            if (customDates) {
                if (this.value === 'custom') {
                    customDates.style.display = 'block';
                } else {
                    customDates.style.display = 'none';
                }
            }
        });
        
        // توليد التقرير المتقدم
        document.getElementById('generateReportBtn')?.addEventListener('click', () => {
            if (window.ReportsManager) {
                window.ReportsManager.generateReport();
            }
        });
    }
    
    static initBackupEvents() {
        // النسخ التلقائي
        const autoBackupInterval = document.getElementById('autoBackupInterval');
        if (autoBackupInterval) {
            // تعيين القيمة الحالية
            const savedInterval = localStorage.getItem('autoBackupInterval') || 'disabled';
            autoBackupInterval.value = savedInterval;
            
            // حدث التغيير
            autoBackupInterval.addEventListener('change', function() {
                const interval = this.value;
                this.setAutoBackupInterval(interval);
            });
        }
        
        // مشاهدة جميع النسخ
        document.getElementById('viewAllBackupsBtn')?.addEventListener('click', () => {
            this.showAllBackups();
        });
    }
    
    static setAutoBackupInterval(interval) {
        if (interval === 'disabled') {
            localStorage.removeItem('autoBackupInterval');
            localStorage.removeItem('nextAutoBackup');
            Utils.showAlert('تم تعطيل النسخ التلقائي.', 'success');
            return;
        }
        
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
    
    static async cleanOldBackups() {
        const backups = System.data.backups;
        
        if (backups.length === 0) {
            Utils.showAlert('لا توجد نسخ احتياطية لتنظيفها.', 'error');
            return;
        }
        
        const confirmed = await Utils.confirmDialog(
            'تنظيف النسخ القديمة',
            `سيتم حذف جميع النسخ الاحتياطية الأقدم من 30 يوماً.
            <br>عدد النسخ الحالية: ${backups.length}
            <br>
            <div class="alert alert-warning" style="margin-top: 10px;">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>تحذير:</strong> لا يمكن التراجع عن هذا الإجراء.
            </div>`,
            'تنظيف',
            'إلغاء'
        );
        
        if (!confirmed) return;
        
        const now = new Date();
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
        
        const updatedBackups = backups.filter(backup => {
            const backupDate = new Date(backup.date);
            return backupDate > thirtyDaysAgo;
        });
        
        const deletedCount = backups.length - updatedBackups.length;
        
        System.data.backups = updatedBackups;
        System.saveBackups();
        
        // تحديث العرض
        if (window.localBackupManager) {
            window.localBackupManager.updateBackupList();
            window.localBackupManager.updateStatistics();
        }
        
        Utils.showAlert(`تم حذف ${deletedCount} نسخة قديمة.`, 'success');
    }
    
    static async deleteAllBackups() {
        const backups = System.data.backups;
        
        if (backups.length === 0) {
            Utils.showAlert('لا توجد نسخ احتياطية لحذفها.', 'error');
            return;
        }
        
        const confirmed = await Utils.confirmDialog(
            'حذف جميع النسخ الاحتياطية',
            `سيتم حذف <strong>جميع</strong> النسخ الاحتياطية المحلية.
            <br>عدد النسخ التي سيتم حذفها: ${backups.length}
            <br>
            <div class="alert alert-danger" style="margin-top: 10px;">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>تحذير شديد:</strong> هذا الإجراء لا يمكن التراجع عنه وسيؤدي إلى فقدان جميع النسخ الاحتياطية!
            </div>
            <div class="form-group" style="margin-top: 15px;">
                <label>
                    <input type="checkbox" id="confirmDeleteAll">
                    أنا أدرك أن هذا الإجراء لا يمكن التراجع عنه
                </label>
            </div>`,
            'حذف',
            'إلغاء'
        );
        
        if (!confirmed) return;
        
        const confirmCheckbox = document.getElementById('confirmDeleteAll');
        if (!confirmCheckbox || !confirmCheckbox.checked) {
            Utils.showAlert('يجب تأكيد القبول بحذف جميع النسخ.', 'error');
            return;
        }
        
        // حذف جميع النسخ
        System.data.backups = [];
        System.saveBackups();
        
        // تحديث العرض
        if (window.localBackupManager) {
            window.localBackupManager.updateBackupList();
            window.localBackupManager.updateStatistics();
        }
        
        Utils.showAlert('تم حذف جميع النسخ الاحتياطية المحلية.', 'success');
    }
    
    static showAllBackups() {
        const backups = System.data.backups;
        const activities = System.data.backupActivities;
        
        let dialogHTML = `
            <div class="all-backups-view">
                <h3><i class="fas fa-database"></i> جميع النسخ الاحتياطية</h3>
                
                <div class="tabs">
                    <button class="tab-btn active" data-tab="backups">النسخ (${backups.length})</button>
                    <button class="tab-btn" data-tab="activities">النشاطات (${activities.length})</button>
                </div>
                
                <div class="tab-content active" id="backups-tab">
        `;
        
        if (backups.length === 0) {
            dialogHTML += '<p class="no-data">لا توجد نسخ احتياطية محلية</p>';
        } else {
            dialogHTML += `
                <div class="backups-list">
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
                            <button class="btn btn-sm btn-danger" onclick="localBackupManager.deleteBackup('${backup.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            dialogHTML += '</tbody></table></div>';
        }
        
        dialogHTML += `
                </div>
                
                <div class="tab-content" id="activities-tab">
        `;
        
        if (activities.length === 0) {
            dialogHTML += '<p class="no-data">لا توجد سجلات نشاط</p>';
        } else {
            dialogHTML += `
                <div class="activities-list">
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
            
            activities.slice(-20).reverse().forEach(activity => {
                const date = new Date(activity.date);
                dialogHTML += `
                    <tr>
                        <td>${date.toLocaleString('ar-SA')}</td>
                        <td>${activity.action}</td>
                        <td>${activity.details || '-'}</td>
                    </tr>
                `;
            });
            
            dialogHTML += '</tbody></table></div>';
        }
        
        dialogHTML += `
                </div>
                
                <div class="dialog-buttons">
                    <button class="btn btn-primary" onclick="this.closest('.all-backups-view').closest('.dialog-overlay').remove()">
                        إغلاق
                    </button>
                </div>
            </div>
        `;
        
        this.showDialog('جميع النسخ الاحتياطية', dialogHTML);
        
        // إضافة أحداث التبويب
        setTimeout(() => {
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    // إزالة النشاط من جميع الأزرار
                    document.querySelectorAll('.tab-btn').forEach(b => {
                        b.classList.remove('active');
                    });
                    
                    // إضافة النشاط للزر الحالي
                    this.classList.add('active');
                    
                    // إخفاء جميع المحتويات
                    document.querySelectorAll('.tab-content').forEach(content => {
                        content.classList.remove('active');
                    });
                    
                    // إظهار المحتوى المطلوب
                    const tabId = this.getAttribute('data-tab');
                    document.getElementById(tabId + '-tab').classList.add('active');
                });
            });
        }, 100);
    }
    
    static showDialog(title, content) {
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
            z-index: 10000;
            padding: 20px;
        `;
        
        dialog.innerHTML = `
            <div class="dialog" style="
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
                    padding-bottom: 15px;
                    border-bottom: 2px solid #3498db;
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
        
        // إغلاق بالنقر خارج المحتوى
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
            }
        });
    }
    
    static initAutoCloseModals() {
        // إغلاق النوافذ المنبثقة بالنقر خارجها
        window.addEventListener('click', (event) => {
            const modals = ['saleModal', 'purchaseModal', 'expenseModal', 'inventoryModal'];
            
            modals.forEach(modalId => {
                const modal = document.getElementById(modalId);
                if (modal && modal.classList.contains('active') && event.target === modal) {
                    ModalManager.close(modalId);
                }
            });
        });
        
        // إغلاق النوافذ بالزر ESC
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                ModalManager.closeAll();
            }
        });
    }
}