import { supabase } from './supabaseClient';
import { Report, TestHealthReport } from '../types/reports';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const reportService = {
  async saveReport(testHealthReport: TestHealthReport, reportElement: HTMLElement): Promise<Report | null> {
    try {
      // 1. Capture the report as PDF
      const canvas = await html2canvas(reportElement, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      // 2. Convert PDF to blob
      const pdfBlob = pdf.output('blob');

      // 3. Upload to Supabase Storage
      const fileName = `reports/${testHealthReport.id}_${Date.now()}.pdf`;
      console.log('Uploading PDF to Supabase Storage:', fileName);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('reports')
        .upload(fileName, pdfBlob, {
          contentType: 'application/pdf',
          cacheControl: '3600',
        });
      console.log('Upload result:', uploadData, uploadError);

      if (uploadError) throw uploadError;

      // 4. Save report reference in database
      console.log('Inserting report into DB:', {
        test_health_id: testHealthReport.id,
        pdf_path: fileName,
        medicine: testHealthReport.medicine,
        half_life: testHealthReport.half_life,
        full_life: testHealthReport.full_life,
        user_id: testHealthReport.user_id,
      });
      const { data: report, error: dbError } = await supabase
        .from('reports')
        .insert({
          test_health_id: testHealthReport.id,
          pdf_path: fileName,
          medicine: testHealthReport.medicine,
          half_life: testHealthReport.half_life,
          full_life: testHealthReport.full_life,
          user_id: testHealthReport.user_id,
        })
        .select()
        .single();
      console.log('DB insert result:', report, dbError);

      if (dbError) throw dbError;

      return report;
    } catch (error) {
      console.error('Error saving report:', error);
      return null;
    }
  },

  async getReports(userId: string, isDoctor?: boolean): Promise<Report[]> {
    try {
      const cleanUserId = userId.trim();
      let query = supabase.from('reports').select('*').order('created_at', { ascending: false });
      if (!isDoctor) {
        query = query.eq('user_id', cleanUserId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  },

  async getReportDownloadUrl(pdfPath: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from('reports')
        .createSignedUrl(pdfPath, 3600); // URL valid for 1 hour

      if (error) throw error;
      return data?.signedUrl || null;
    } catch (error) {
      console.error('Error getting download URL:', error);
      return null;
    }
  },

  async deleteReport(reportId: string, pdfPath: string): Promise<boolean> {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('reports')
        .remove([pdfPath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (dbError) throw dbError;

      return true;
    } catch (error) {
      console.error('Error deleting report:', error);
      return false;
    }
  },

  subscribeToReports(userId: string, callback: (reports: Report[]) => void) {
    const cleanUserId = userId.trim();
    const channel = supabase
      .channel('reports-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reports',
          filter: `user_id=eq.${cleanUserId}`,
        },
        async () => {
          // Fetch latest reports and call the callback
          const reports = await reportService.getReports(cleanUserId);
          callback(reports);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }
}; 