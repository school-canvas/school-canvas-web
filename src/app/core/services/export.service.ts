import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface ExportColumn {
  header: string;
  field: string;
  width?: number;
}

export interface ExportOptions {
  title?: string;
  subtitle?: string;
  filename: string;
  columns: ExportColumn[];
  data: any[];
  orientation?: 'portrait' | 'landscape';
  includeTimestamp?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }

  /**
   * Export data to PDF format
   */
  exportToPDF(options: ExportOptions): void {
    const {
      title = 'Report',
      subtitle,
      filename,
      columns,
      data,
      orientation = 'portrait',
      includeTimestamp = true
    } = options;

    // Create new PDF document
    const doc = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4'
    });

    // Add title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 20);

    let yPosition = 30;

    // Add subtitle if provided
    if (subtitle) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(subtitle, 14, yPosition);
      yPosition += 10;
    }

    // Add timestamp if enabled
    if (includeTimestamp) {
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, yPosition);
      yPosition += 10;
    }

    // Prepare table data
    const headers = columns.map(col => col.header);
    const body = data.map(row => 
      columns.map(col => this.getNestedValue(row, col.field))
    );

    // Add table
    autoTable(doc, {
      head: [headers],
      body: body,
      startY: yPosition,
      theme: 'striped',
      headStyles: {
        fillColor: [63, 81, 181], // Material primary color
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: this.getColumnStyles(columns)
    });

    // Save the PDF
    doc.save(`${filename}.pdf`);
  }

  /**
   * Export data to Excel format
   */
  exportToExcel(options: ExportOptions): void {
    const {
      title,
      filename,
      columns,
      data,
      includeTimestamp = true
    } = options;

    // Prepare worksheet data
    const worksheetData: any[] = [];

    // Add title row if provided
    if (title) {
      worksheetData.push([title]);
      worksheetData.push([]); // Empty row
    }

    // Add timestamp if enabled
    if (includeTimestamp) {
      worksheetData.push([`Generated: ${new Date().toLocaleString()}`]);
      worksheetData.push([]); // Empty row
    }

    // Add headers
    worksheetData.push(columns.map(col => col.header));

    // Add data rows
    data.forEach(row => {
      const rowData = columns.map(col => this.getNestedValue(row, col.field));
      worksheetData.push(rowData);
    });

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    const columnWidths = columns.map(col => ({
      wch: col.width || 15
    }));
    worksheet['!cols'] = columnWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Save the file
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }

  /**
   * Export data to CSV format
   */
  exportToCSV(options: ExportOptions): void {
    const { filename, columns, data } = options;

    // Prepare CSV content
    const headers = columns.map(col => col.header).join(',');
    const rows = data.map(row => 
      columns.map(col => {
        const value = this.getNestedValue(row, col.field);
        // Escape commas and quotes
        return this.escapeCSVValue(value);
      }).join(',')
    );

    const csvContent = [headers, ...rows].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Export chart as image in PDF
   */
  exportChartToPDF(
    chartCanvas: HTMLCanvasElement,
    title: string,
    filename: string
  ): void {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Add title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 20);

    // Add timestamp
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

    // Add chart image
    const imgData = chartCanvas.toDataURL('image/png');
    const imgWidth = 270;
    const imgHeight = 150;
    doc.addImage(imgData, 'PNG', 14, 40, imgWidth, imgHeight);

    // Save the PDF
    doc.save(`${filename}.pdf`);
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => 
      current?.[prop], obj
    ) ?? '';
  }

  /**
   * Escape CSV value to handle commas and quotes
   */
  private escapeCSVValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    const stringValue = String(value);
    
    // If value contains comma, quote, or newline, wrap in quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
  }

  /**
   * Get column styles for PDF table
   */
  private getColumnStyles(columns: ExportColumn[]): { [key: number]: any } {
    const styles: { [key: number]: any } = {};
    
    columns.forEach((col, index) => {
      if (col.width) {
        styles[index] = { cellWidth: col.width };
      }
    });
    
    return styles;
  }
}
