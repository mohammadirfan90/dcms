import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

export const generateInvoicePDF = (bill: any, patientName: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header - Clinic Info
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // blue-600
    doc.text("ANTIGRAVITY DENTAL CARE", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("123 Clinic Street, Dhaka, Bangladesh", 14, 28);
    doc.text("Phone: +880 1234 567890 | Email: care@antigravity.com", 14, 33);

    // Divider
    doc.setDrawColor(200);
    doc.line(14, 38, pageWidth - 14, 38);

    // Invoice Info
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("INVOICE", 14, 48);

    doc.setFontSize(10);
    doc.text(`Invoice ID: ${bill.$id.toUpperCase()}`, 14, 55);
    doc.text(`Date: ${format(new Date(bill.createdAt), "PPP")}`, 14, 60);
    doc.text(`Status: ${bill.status.toUpperCase()}`, 14, 65);

    // Patient Info
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", pageWidth - 70, 48);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(patientName, pageWidth - 70, 53);
    doc.text(`Patient ID: ${bill.patientId.slice(0, 8)}...`, pageWidth - 70, 58);

    // Bill Items Table
    const tableData = bill.items.map((item: any) => [
        item.description,
        `৳${item.amount.toLocaleString()}`
    ]);

    autoTable(doc, {
        startY: 75,
        head: [["Description", "Amount"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [37, 99, 235], textColor: 255 },
        columnStyles: {
            1: { halign: "right", cellWidth: 40 }
        }
    });

    // Totals Section
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const totalsX = pageWidth - 60;

    doc.setFontSize(10);
    doc.text("Subtotal:", totalsX, finalY);
    doc.text(`৳${(bill.total + (bill.discount || 0)).toLocaleString()}`, pageWidth - 14, finalY, { align: "right" });

    if (bill.discount > 0) {
        doc.text("Discount:", totalsX, finalY + 6);
        doc.setTextColor(220, 38, 38); // red-600
        doc.text(`-৳${bill.discount.toLocaleString()}`, pageWidth - 14, finalY + 6, { align: "right" });
        doc.setTextColor(0);
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Total Amount:", totalsX, finalY + 14);
    doc.text(`৳${bill.total.toLocaleString()}`, pageWidth - 14, finalY + 14, { align: "right" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(22, 163, 74); // green-600
    doc.text("Paid Amount:", totalsX, finalY + 20);
    doc.text(`৳${bill.paid.toLocaleString()}`, pageWidth - 14, finalY + 20, { align: "right" });

    doc.setTextColor(220, 38, 38); // red-600
    doc.setFont("helvetica", "bold");
    doc.text("Remaining Due:", totalsX, finalY + 26);
    doc.text(`৳${bill.due.toLocaleString()}`, pageWidth - 14, finalY + 26, { align: "right" });

    // Payment History Table (if any)
    if (bill.payments && bill.payments.length > 0) {
        doc.setTextColor(0);
        doc.setFontSize(12);
        doc.text("Payment History", 14, finalY + 40);

        const paymentData = bill.payments.map((p: any) => [
            format(new Date(p.created_at), "MMM dd, yyyy HH:mm"),
            p.payment_method.toUpperCase(),
            `৳${p.amount.toLocaleString()}`
        ]);

        autoTable(doc, {
            startY: finalY + 45,
            head: [["Date", "Method", "Amount"]],
            body: paymentData,
            theme: "striped",
            headStyles: { fillColor: [100, 116, 139], textColor: 255 },
            columnStyles: {
                2: { halign: "right", cellWidth: 40 }
            }
        });
    }

    // Footer
    const footerY = doc.internal.pageSize.height - 20;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Thank you for choosing Antigravity Dental Care. This is a computer-generated invoice.", pageWidth / 2, footerY, { align: "center" });

    // Save PDF
    doc.save(`Invoice_${bill.$id.slice(0, 8)}_${patientName.replace(/\s+/g, "_")}.pdf`);
};

export const generatePrescriptionPDF = (prescription: any, settings: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Header - Clinic Info (Blue Theme)
    doc.setFontSize(24);
    doc.setTextColor(30, 58, 138); // blue-900
    doc.setFont("helvetica", "bold");
    doc.text(settings.name.toUpperCase(), 14, 22);

    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235); // blue-600
    doc.setFont("helvetica", "italic");
    doc.text(settings.subtitle || "", 14, 28);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text([
        settings.address,
        `Phone: ${settings.phone}`,
        `Hours: ${settings.visitingHours}`
    ], 14, 38);

    // Doctor Info (Right Aligned)
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text(prescription.doctor.name, pageWidth - 14, 22, { align: "right" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(prescription.doctor.degrees || "", pageWidth - 14, 27, { align: "right" });
    doc.setTextColor(37, 99, 235);
    doc.text(prescription.doctor.speciality || "", pageWidth - 14, 32, { align: "right" });
    doc.setTextColor(150);
    doc.setFontSize(8);
    doc.text(`Reg: ${prescription.doctor.registrationNumber || "N/A"}`, pageWidth - 14, 36, { align: "right" });

    // Divider
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(1);
    doc.line(14, 52, pageWidth - 14, 52);

    // Patient Info Bar
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(14, 58, pageWidth - 28, 15, "F");
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.rect(14, 58, pageWidth - 28, 15, "S");

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text("PATIENT NAME", 18, 63);
    doc.text("AGE / SEX", 80, 63);
    doc.text("DATE", pageWidth - 45, 63);

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text(prescription.patient.name, 18, 69);
    doc.text(`${prescription.ageAtVisit}Y / ${prescription.sexAtVisit.toUpperCase()}`, 80, 69);
    doc.text(format(new Date(prescription.visitDate), "dd MMM yyyy"), pageWidth - 45, 69);

    // Left Column - Clinical Notes
    const leftColX = 14;
    const leftColWidth = 60;
    const mainColX = 80;
    let currentY = 85;

    doc.setFontSize(8);
    doc.setTextColor(30, 58, 138);
    doc.text("CHIEF COMPLAINT", leftColX, currentY);
    doc.line(leftColX, currentY + 1, leftColX + leftColWidth, currentY + 1);

    doc.setFontSize(9);
    doc.setTextColor(50);
    doc.setFont("helvetica", "normal");
    let complaintLines = doc.splitTextToSize(prescription.chiefComplaint || "None", leftColWidth);
    doc.text(complaintLines, leftColX, currentY + 6);
    currentY += 6 + (complaintLines.length * 5) + 10;

    doc.setFontSize(8);
    doc.setTextColor(30, 58, 138);
    doc.text("DIAGNOSIS", leftColX, currentY);
    doc.line(leftColX, currentY + 1, leftColX + leftColWidth, currentY + 1);

    doc.setFontSize(9);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    let diagnosisLines = doc.splitTextToSize(prescription.diagnosis || "TBD", leftColWidth);
    doc.text(diagnosisLines, leftColX, currentY + 6);

    // Vertical Divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(mainColX - 5, 80, mainColX - 5, pageHeight - 40);

    // Main Column - Rx
    doc.setFontSize(30);
    doc.setTextColor(30, 58, 138);
    doc.setFont("times", "bolditalic");
    doc.text("Rx", mainColX, 90);

    const medData = prescription.medicines.map((m: any, idx: number) => [
        `${idx + 1}. ${m.name}\n   ${m.instruction || ""}`,
        m.dose,
        m.duration
    ]);

    autoTable(doc, {
        startY: 95,
        margin: { left: mainColX },
        head: [["Medicine", "Dose", "Duration"]],
        body: medData,
        theme: "plain",
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fontStyle: "bold", textColor: [30, 58, 138] },
        columnStyles: {
            0: { cellWidth: 70 },
            1: { halign: "center", cellWidth: 30 },
            2: { halign: "right", cellWidth: 20 }
        }
    });

    let finalY = (doc as any).lastAutoTable.finalY + 15;

    // Treatment & Advice
    if (prescription.treatment) {
        doc.setFontSize(10);
        doc.setTextColor(30, 58, 138);
        doc.setFont("helvetica", "bold");
        doc.text("TREATMENT PLAN", mainColX, finalY);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(50);
        let treatmentLines = doc.splitTextToSize(prescription.treatment, pageWidth - mainColX - 14);
        doc.text(treatmentLines, mainColX, finalY + 6);
        finalY += 6 + (treatmentLines.length * 5) + 10;
    }

    if (prescription.advice) {
        doc.setFontSize(10);
        doc.setTextColor(30, 58, 138);
        doc.setFont("helvetica", "bold");
        doc.text("ADVICE", mainColX, finalY);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(50);
        let adviceLines = doc.splitTextToSize(prescription.advice, pageWidth - mainColX - 14);
        doc.text(adviceLines, mainColX, finalY + 6);
    }

    // Footer
    doc.setDrawColor(200);
    doc.line(14, pageHeight - 25, pageWidth - 14, pageHeight - 25);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Standard clinical prescription generated by DCMS. Valid when stamped by registered physician.", pageWidth / 2, pageHeight - 15, { align: "center" });

    // Save
    doc.save(`Prescription_${prescription.patient.name.replace(/\s+/g, "_")}_${format(new Date(prescription.visitDate), "yyyyMMdd")}.pdf`);
};
