// ============================================================================
// نظام الطباعة والتقارير PDF
// ============================================================================

class PDFSystem {
    constructor() {
        this.initializePDFLibrary();
    }
    
    initializePDFLibrary() {
        // تحميل مكتبة jsPDF بشكل ديناميكي إذا لم تكن موجودة
        if (typeof window.jspdf === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = () => {
                console.log('jsPDF loaded successfully');
            };
            document.head.appendChild(script);
        }
        
        // تحميل مكتبة html2canvas
        if (typeof window.html2canvas === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
            script.onload = () => {
                console.log('html2canvas loaded successfully');
            };
            document.head.appendChild(script);
        }
    }
    
    async createPDF(fileName, htmlContent, options = {}) {
        try {
            // التحقق من توفر المكتبات
            if (typeof window.jspdf === 'undefined' || typeof window.html2canvas === 'undefined') {
                Utils.showAlert('جاري تحميل مكتبات PDF. حاول مرة أخرى بعد لحظات.', 'info');
                return false;
            }
            
            const { jsPDF } = window.jspdf;
            
            // إنشاء عنصر مؤقت لعرض المحتوى
            const tempElement = document.createElement('div');
            tempElement.style.position = 'absolute';
            tempElement.style.left = '-9999px';
            tempElement.style.top = '0';
            tempElement.style.width = '800px';
            tempElement.style.padding = '20px';
            tempElement.style.backgroundColor = 'white';
            tempElement.style.direction = 'rtl';
            tempElement.style.textAlign = 'right';
            tempElement.innerHTML = htmlContent;
            document.body.appendChild(tempElement);
            
            // استخدام html2canvas لالتقاط الصورة
            const canvas = await html2canvas(tempElement, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                ...options
            });
            
            // إزالة العنصر المؤقت
            document.body.removeChild(tempElement);
            
            // تحويل Canvas إلى صورة
            const imageData = canvas.toDataURL('image/png');
            
            // إنشاء ملف PDF
            const pdf = new jsPDF({
                orientation: options.orientation || 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            // إضافة الصورة إلى PDF
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 5;
            
            pdf.addImage(imageData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            
            // حفظ الملف
            pdf.save(fileName + '.pdf');
            
            return true;
        } catch (error) {
            console.error('خطأ في إنشاء PDF:', error);
            Utils.showAlert('حدث خطأ أثناء إنشاء ملف PDF: ' + error.message, 'error');
            return false;
        }
    }
    
    async printSalesReport(period = 'اليوم', dates = null) {
        if (!dates) {
            dates = this.getDates(period);
        }
        
        // تصفية المبيعات حسب الفترة
        const filteredSales = System.data.sales.filter(sale => 
            sale.date >= dates.startDate && sale.date <= dates.endDate
        );
        
        // حساب الإحصائيات
        const totalSales = Utils.calculateTotal(filteredSales, 'total');
        const transactionCount = filteredSales.length;
        const averageValue = transactionCount > 0 ? totalSales / transactionCount : 0;
        const highestValue = filteredSales.length > 0 ? Math.max(...filteredSales.map(s => s.total)) : 0;
        
        // إنشاء محتوى HTML للتقرير
        const reportHTML = `
            <div style="font-family: 'Arial', sans-serif; direction: rtl; text-align: right; padding: 20px;">
                <h1 style="color: #2c3e50; text-align: center; margin-bottom: 30px;">
                    <i class="fas fa-chart-line"></i> تقرير المبيعات
                </h1>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <h3 style="color: #3498db; margin-top: 0;">معلومات التقرير</h3>
                    <p><strong>الفترة:</strong> ${dates.startDate} إلى ${dates.endDate}</p>
                    <p><strong>تاريخ التقرير:</strong> ${new Date().toLocaleDateString('ar-SA')}</p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 30px;">
                    <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; border-right: 4px solid #27ae60;">
                        <h4 style="margin: 0 0 10px 0; color: #27ae60;">إجمالي المبيعات</h4>
                        <p style="font-size: 24px; font-weight: bold; margin: 0;">${Utils.formatCurrency(totalSales)}</p>
                    </div>
                    
                    <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; border-right: 4px solid #3498db;">
                        <h4 style="margin: 0 0 10px 0; color: #3498db;">عدد العمليات</h4>
                        <p style="font-size: 24px; font-weight: bold; margin: 0;">${transactionCount}</p>
                    </div>
                    
                    <div style="background: #fff8e1; padding: 15px; border-radius: 8px; border-right: 4px solid #f39c12;">
                        <h4 style="margin: 0 0 10px 0; color: #f39c12;">متوسط القيمة</h4>
                        <p style="font-size: 24px; font-weight: bold; margin: 0;">${Utils.formatCurrency(averageValue)}</p>
                    </div>
                    
                    <div style="background: #ffeaea; padding: 15px; border-radius: 8px; border-right: 4px solid #e74c3c;">
                        <h4 style="margin: 0 0 10px 0; color: #e74c3c;">أعلى مبلغ</h4>
                        <p style="font-size: 24px; font-weight: bold; margin: 0;">${Utils.formatCurrency(highestValue)}</p>
                    </div>
                </div>
                
                <h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
                    تفاصيل عمليات البيع
                </h3>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <thead>
                        <tr style="background: #3498db; color: white;">
                            <th style="padding: 12px; border: 1px solid #ddd;">التاريخ</th>
                            <th style="padding: 12px; border: 1px solid #ddd;">المنتج</th>
                            <th style="padding: 12px; border: 1px solid #ddd;">الكمية</th>
                            <th style="padding: 12px; border: 1px solid #ddd;">السعر</th>
                            <th style="padding: 12px; border: 1px solid #ddd;">الإجمالي</th>
                            <th style="padding: 12px; border: 1px solid #ddd;">العميل</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredSales.map((sale, index) => `
                            <tr style="background: ${index % 2 === 0 ? '#f9f9f9' : 'white'};">
                                <td style="padding: 10px; border: 1px solid #ddd;">${sale.date}</td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${sale.product}</td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${sale.quantity}</td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${Utils.formatCurrency(sale.price)}</td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${Utils.formatCurrency(sale.total)}</td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${sale.customer || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr style="background: #2c3e50; color: white; font-weight: bold;">
                            <td colspan="4" style="padding: 12px; text-align: left;">الإجمالي العام</td>
                            <td colspan="2" style="padding: 12px;">${Utils.formatCurrency(totalSales)}</td>
                        </tr>
                    </tfoot>
                </table>
                
                <div style="margin-top: 40px; padding-top: 20px; border-top: 2px dashed #ddd; text-align: center; color: #7f8c8d;">
                    <p>تم إنشاء هذا التقرير تلقائياً بواسطة نظام محاسبة المتاجر الصغيرة</p>
                    <p>${new Date().toLocaleString('ar-SA')}</p>
                </div>
            </div>
        `;
        
        // إنشاء PDF
        const fileDate = new Date().toISOString().split('T')[0];
        await this.createPDF(
            `تقرير_المبيعات_${fileDate}`,
            reportHTML,
            { orientation: 'landscape' }
        );
    }
    
    getDates(period) {
        const today = new Date();
        let startDate, endDate;
        
        switch(period) {
            case 'daily':
                startDate = today.toISOString().split('T')[0];
                endDate = startDate;
                break;
            case 'weekly':
                endDate = today.toISOString().split('T')[0];
                const weekAgo = new Date(today);
                weekAgo.setDate(today.getDate() - 7);
                startDate = weekAgo.toISOString().split('T')[0];
                break;
            case 'monthly':
                endDate = today.toISOString().split('T')[0];
                const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                startDate = firstDayOfMonth.toISOString().split('T')[0];
                break;
            default:
                startDate = today.toISOString().split('T')[0];
                endDate = startDate;
        }
        
        return { startDate, endDate };
    }
    
    async printInvoice(invoiceId) {
        const sale = System.findSaleById(invoiceId);
        if (!sale) {
            Utils.showAlert('لم يتم العثور على الفاتورة', 'error');
            return;
        }
        
        // إنشاء محتوى الفاتورة
        const invoiceHTML = `
            <div style="font-family: 'Arial', sans-serif; direction: rtl; text-align: right; padding: 20px; max-width: 800px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #3498db;">
                    <div>
                        <h1 style="color: #2c3e50; margin: 0;">فاتورة بيع</h1>
                        <p style="color: #7f8c8d; margin: 5px 0;">رقم الفاتورة: INV-${sale.id.toString().padStart(3, '0')}</p>
                    </div>
                    <div style="text-align: left;">
                        <div style="background: #3498db; color: white; padding: 10px 20px; border-radius: 5px; font-weight: bold;">
                            ${Utils.formatCurrency(sale.total)}
                        </div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                    <div>
                        <h3 style="color: #2c3e50; margin-top: 0;">معلومات المتجر</h3>
                        <p style="margin: 5px 0;"><strong>اسم المتجر:</strong> متجرنا</p>
                        <p style="margin: 5px 0;"><strong>العنوان:</strong> المدينة، الحي، الشارع</p>
                        <p style="margin: 5px 0;"><strong>الهاتف:</strong> 0555555555</p>
                        <p style="margin: 5px 0;"><strong>البريد الإلكتروني:</strong> info@store.com</p>
                    </div>
                    
                    <div>
                        <h3 style="color: #2c3e50; margin-top: 0;">معلومات العميل</h3>
                        <p style="margin: 5px 0;"><strong>اسم العميل:</strong> ${sale.customer || 'عميل'}</p>
                        <p style="margin: 5px 0;"><strong>تاريخ الفاتورة:</strong> ${sale.date}</p>
                        <p style="margin: 5px 0;"><strong>رقم الفاتورة:</strong> ${sale.id}</p>
                    </div>
                </div>
                
                <h3 style="color: #2c3e50; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 20px;">
                    تفاصيل المنتجات
                </h3>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                    <thead>
                        <tr style="background: #f8f9fa;">
                            <th style="padding: 12px; border: 1px solid #ddd; text-align: right;">المنتج</th>
                            <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">الكمية</th>
                            <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">السعر</th>
                            <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd;">${sale.product}</td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${sale.quantity}</td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: left;">${Utils.formatCurrency(sale.price)}</td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: left;">${Utils.formatCurrency(sale.total)}</td>
                        </tr>
                    </tbody>
                </table>
                
                <div style="display: flex; justify-content: flex-end;">
                    <div style="width: 300px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>الإجمالي:</strong></td>
                                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: left;">${Utils.formatCurrency(sale.total)}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>الضريبة (15%):</strong></td>
                                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: left;">${Utils.formatCurrency(sale.total * 0.15)}</td>
                            </tr>
                            <tr style="background: #f8f9fa; font-weight: bold;">
                                <td style="padding: 12px;"><strong>الإجمالي النهائي:</strong></td>
                                <td style="padding: 12px; text-align: left;">${Utils.formatCurrency(sale.total * 1.15)}</td>
                            </tr>
                        </table>
                    </div>
                </div>
                
                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px dashed #ddd;">
                    <p><strong>ملاحظات:</strong> ${sale.notes || 'لا توجد ملاحظات'}</p>
                </div>
                
                <div style="margin-top: 50px; text-align: center; color: #7f8c8d; font-size: 14px;">
                    <p>شكراً لتعاملكم معنا</p>
                    <p>للاستفسارات: 0555555555 | info@store.com</p>
                    <p>${new Date().toLocaleString('ar-SA')}</p>
                </div>
            </div>
        `;
        
        // إنشاء PDF
        await this.createPDF(
            `فاتورة_${sale.id}_${sale.date}`,
            invoiceHTML
        );
    }
    
    async exportAllReports() {
        const confirmed = await Utils.confirmDialog(
            'تصدير جميع التقارير',
            'سيتم تصدير جميع التقارير كملفات PDF. هل تريد المتابعة؟',
            'تصدير',
            'إلغاء'
        );
        
        if (!confirmed) return;
        
        const fileDate = new Date().toISOString().split('T')[0];
        
        try {
            // تصدير تقرير المبيعات
            await this.printSalesReport('monthly');
            
            // يمكن إضافة المزيد من التقارير هنا
            
            Utils.showAlert('تم تصدير جميع التقارير بنجاح!', 'success');
        } catch (error) {
            console.error('خطأ في تصدير التقارير:', error);
            Utils.showAlert('حدث خطأ أثناء تصدير التقارير', 'error');
        }
    }
}

// تصدير للاستخدام في الملفات الأخرى
window.PDFSystem = new PDFSystem();