// ============================================================================
// إدارة النوافذ المنبثقة
// ============================================================================

class ModalManager {
    static activeModal = null;
    
    static open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            this.activeModal = modalId;
            document.body.style.overflow = 'hidden';
        }
    }
    
    static close(modalId = null) {
        const idToClose = modalId || this.activeModal;
        if (idToClose) {
            const modal = document.getElementById(idToClose);
            if (modal) {
                modal.classList.remove('active');
                if (modalId) {
                    this.activeModal = null;
                }
            }
        }
        
        // إعادة تفعيل التمرير إذا لم تكن هناك نوافذ مفتوحة
        if (!this.activeModal) {
            document.body.style.overflow = 'auto';
        }
    }
    
    static closeAll() {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
        this.activeModal = null;
        document.body.style.overflow = 'auto';
    }
    
    static closeOnOutsideClick(event) {
        const modals = ['saleModal', 'purchaseModal', 'expenseModal', 'inventoryModal'];
        
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal && modal.classList.contains('active') && event.target === modal) {
                this.close(modalId);
            }
        });
    }
    
    static initModalCloseButtons() {
        // إغلاق نافذة المبيعات
        document.getElementById('closeSaleModal')?.addEventListener('click', () => {
            this.close('saleModal');
        });
        
        document.getElementById('cancelSale')?.addEventListener('click', () => {
            this.close('saleModal');
        });
        
        // إغلاق نافذة المشتريات
        document.getElementById('closePurchaseModal')?.addEventListener('click', () => {
            this.close('purchaseModal');
        });
        
        document.getElementById('cancelPurchase')?.addEventListener('click', () => {
            this.close('purchaseModal');
        });
        
        // إغلاق نافذة المصروفات
        document.getElementById('closeExpenseModal')?.addEventListener('click', () => {
            this.close('expenseModal');
        });
        
        document.getElementById('cancelExpense')?.addEventListener('click', () => {
            this.close('expenseModal');
        });
        
        // إغلاق نافذة المخزون
        document.getElementById('closeInventoryModal')?.addEventListener('click', () => {
            this.close('inventoryModal');
        });
        
        document.getElementById('cancelInventory')?.addEventListener('click', () => {
            this.close('inventoryModal');
        });
    }
    
    static initGlobalCloseListeners() {
        // إغلاق بالنقر خارج النافذة
        window.addEventListener('click', (event) => {
            this.closeOnOutsideClick(event);
        });
        
        // إغلاق بالزر ESC
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.activeModal) {
                this.close(this.activeModal);
            }
        });
    }
}