// ============================================================================
// الأدوات المساعدة العامة
// ============================================================================

class Utils {
    static getToday() {
        return new Date().toISOString().split('T')[0];
    }
    
    static getCurrentYear() {
        return new Date().getFullYear();
    }
    
    static formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    static formatDateTime(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    static formatCurrency(amount) {
        return parseFloat(amount).toFixed(2) + ' ' + CONFIG.DEFAULT_CURRENCY;
    }
    
    static calculateTotal(items, key = 'total') {
        if (!items || items.length === 0) return 0;
        return items.reduce((sum, item) => sum + (parseFloat(item[key]) || 0), 0);
    }
    
    static validateRequired(fields) {
        for (const field of fields) {
            if (!field || field.toString().trim() === '') {
                return false;
            }
        }
        return true;
    }
    
    static showAlert(message, type = 'info', duration = 3000) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `custom-alert alert-${type}`;
        alertDiv.innerHTML = `
            <div class="alert-content">
                <span class="alert-icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
                <span class="alert-message">${message}</span>
            </div>
        `;
        
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
            color: white;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            font-family: inherit;
        `;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.parentNode.removeChild(alertDiv);
                }
            }, 300);
        }, duration);
        
        // إضافة الأنيميشن إذا لم تكن موجودة
        if (!document.querySelector('#alert-animations')) {
            const style = document.createElement('style');
            style.id = 'alert-animations';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    static confirmDialog(title, message, confirmText = 'تأكيد', cancelText = 'إلغاء') {
        return new Promise((resolve) => {
            const dialog = document.createElement('div');
            dialog.className = 'confirm-dialog';
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
                <div class="dialog-content" style="
                    background: white;
                    padding: 25px;
                    border-radius: 10px;
                    max-width: 500px;
                    width: 90%;
                    text-align: center;
                ">
                    <h3 style="margin-top: 0; color: #333;">${title}</h3>
                    <p style="color: #666; line-height: 1.6;">${message}</p>
                    <div style="margin-top: 25px;">
                        <button class="btn-cancel" style="
                            padding: 10px 25px;
                            background: #6c757d;
                            color: white;
                            border: none;
                            border-radius: 5px;
                            cursor: pointer;
                            margin-left: 10px;
                        ">${cancelText}</button>
                        <button class="btn-confirm" style="
                            padding: 10px 25px;
                            background: #007bff;
                            color: white;
                            border: none;
                            border-radius: 5px;
                            cursor: pointer;
                        ">${confirmText}</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(dialog);
            
            dialog.querySelector('.btn-confirm').addEventListener('click', () => {
                dialog.remove();
                resolve(true);
            });
            
            dialog.querySelector('.btn-cancel').addEventListener('click', () => {
                dialog.remove();
                resolve(false);
            });
            
            dialog.addEventListener('click', (e) => {
                if (e.target === dialog) {
                    dialog.remove();
                    resolve(false);
                }
            });
        });
    }
    
    static generateId(dataArray) {
        if (!dataArray || dataArray.length === 0) return 1;
        return Math.max(...dataArray.map(item => item.id || 0)) + 1;
    }
}