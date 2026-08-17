import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student, Player, FeeInstallment, PaymentTransaction, OrphanRecord } from '../types';

export const exportStudentsPdf = (students: Student[]) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 32, 'F');

  // Title Text
  doc.setTextColor(16, 185, 129); // emerald-500
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text("JONATHAN'S CHILD CARE MINISTRIES", 14, 12);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text("Bo District, Sierra Leone • Nursery, Primary & Secondary Systems", 14, 18);

  doc.setTextColor(226, 232, 240);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("OFFICIAL STUDENT ROSTER & SCHOOL FEES LEDGER REPORT", 14, 26);

  // Metadata Block
  const dateStr = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Report Generated: ${dateStr}`, 14, 38);
  doc.text(`Total Enrolled Students: ${students.length}`, 14, 43);

  const totalCollected = students.reduce((acc, curr) => acc + (curr.totalPaid || 0), 0);
  const totalBalance = students.reduce((acc, curr) => acc + (curr.remainingBalance || 0), 0);

  doc.text(`Total Fees Collected: NLe ${totalCollected.toLocaleString()}`, 110, 38);
  doc.text(`Outstanding Balance: NLe ${totalBalance.toLocaleString()}`, 110, 43);

  // Table Data
  const tableHead = [['ID', 'Full Name', 'Section / Tier', 'Grade', 'Fee Status', 'Total Fee', 'Paid', 'Balance']];
  const tableData = students.map((s) => [
    s.id,
    s.name,
    s.schoolTier || 'Secondary',
    s.gradeLevel,
    s.feeStatus || (s.remainingBalance === 0 ? 'Fully Paid' : 'Partially Paid'),
    `NLe ${s.totalTermFee || 0}`,
    `NLe ${s.totalPaid || 0}`,
    `NLe ${s.remainingBalance || 0}`,
  ]);

  autoTable(doc, {
    startY: 48,
    head: tableHead,
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [16, 185, 129], // emerald-600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [241, 245, 249],
    },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 36 },
      2: { cellWidth: 22 },
      3: { cellWidth: 26 },
      4: { cellWidth: 24 },
      5: { cellWidth: 20 },
      6: { cellWidth: 18 },
      7: { cellWidth: 18 },
    },
    margin: { left: 14, right: 14 },
  });

  // Footer Sign-off
  const finalY = (doc as any).lastAutoTable?.finalY || 180;
  
  if (finalY + 35 < 280) {
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Bursary & Administration Verification Sign-Off:", 14, finalY + 12);

    doc.setLineWidth(0.5);
    doc.setDrawColor(203, 213, 225);
    
    doc.line(14, finalY + 28, 80, finalY + 28);
    doc.text("Mrs. Fatmata Sesay (Head Teacher / Bursar)", 14, finalY + 33);

    doc.line(110, finalY + 28, 180, finalY + 28);
    doc.text("Dr. Jonathan Kpakima (Director)", 110, finalY + 33);
  }

  doc.save(`JCC_Student_Fees_Roster_${dateStr.replace(/ /g, '_')}.pdf`);
};

export const exportFeeReceiptPdf = (
  student: Student,
  transaction?: PaymentTransaction,
  installment?: FeeInstallment
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5', // A5 is standard for formal school payment slips/vouchers
  });

  const receiptNum = transaction?.receiptNumber || installment?.receiptNumber || `REC-${student.id}-${Date.now().toString().slice(-4)}`;
  const dateStr = transaction?.date || new Date().toISOString().split('T')[0];
  const amountPaid = transaction?.amount || installment?.amountPaid || 0;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 148, 26, 'F');

  // Title Text
  doc.setTextColor(16, 185, 129); // emerald-500
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text("JONATHAN'S CHILD CARE MINISTRIES", 10, 8);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text("Bo District, Sierra Leone • Nursery, Primary & Secondary School", 10, 13);

  doc.setTextColor(245, 158, 11); // amber-400
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text("OFFICIAL SCHOOL FEE PAYMENT VOUCHER", 10, 20);

  // Metadata Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(10, 30, 128, 22, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(`Receipt No: ${receiptNum}`, 14, 36);
  doc.text(`Date: ${dateStr}`, 85, 36);

  doc.setFont('helvetica', 'normal');
  doc.text(`Student: ${student.name} (${student.id})`, 14, 42);
  doc.text(`Section: ${student.schoolTier} School (${student.gradeLevel})`, 14, 48);
  doc.text(`Guardian: ${student.guardianName} (${student.guardianPhone})`, 85, 48);

  // Payment Breakdown
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text("PAYMENT TRANSACTION SUMMARY", 10, 58);

  const transHead = [['Description', 'Payment Channel', 'Amount Paid']];
  const transData = [
    [
      transaction?.installmentTitle || installment?.title || 'Installment Payment',
      transaction?.paymentMethod || installment?.paymentMethod || 'Bursary Office / Mobile Money',
      `NLe ${amountPaid.toLocaleString()}`,
    ],
  ];

  autoTable(doc, {
    startY: 61,
    head: transHead,
    body: transData,
    theme: 'plain',
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [15, 23, 42],
    },
    margin: { left: 10, right: 10 },
  });

  // Account Ledger Summary Box
  const nextY = (doc as any).lastAutoTable?.finalY || 80;

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(10, nextY + 4, 128, 24, 2, 2, 'F');

  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Total Term Tuition Fee:`, 14, nextY + 10);
  doc.text(`Cumulative Amount Paid:`, 14, nextY + 16);
  doc.text(`Remaining Balance Due:`, 14, nextY + 22);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`NLe ${student.totalTermFee.toLocaleString()}`, 85, nextY + 10);
  doc.setTextColor(16, 185, 129);
  doc.text(`NLe ${student.totalPaid.toLocaleString()}`, 85, nextY + 16);
  
  if (student.remainingBalance > 0) {
    doc.setTextColor(225, 29, 72); // rose-600
    doc.text(`NLe ${student.remainingBalance.toLocaleString()} (Pending Installment)`, 85, nextY + 22);
  } else {
    doc.setTextColor(16, 185, 129);
    doc.text(`NLe 0 (100% Cleared / Fully Paid)`, 85, nextY + 22);
  }

  // Installment Plan Overview
  if (student.installments && student.installments.length > 0) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text("INSTALLMENT SCHEDULE STATUS", 10, nextY + 34);

    const instHead = [['#', 'Installment Name', 'Due Date', 'Due', 'Paid', 'Status']];
    const instData = student.installments.map((ins) => [
      ins.installmentNumber.toString(),
      ins.title,
      ins.dueDate,
      `NLe ${ins.amountDue}`,
      `NLe ${ins.amountPaid}`,
      ins.status,
    ]);

    autoTable(doc, {
      startY: nextY + 37,
      head: instHead,
      body: instData,
      theme: 'striped',
      headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontSize: 7 },
      bodyStyles: { fontSize: 6.8 },
      margin: { left: 10, right: 10 },
    });
  }

  const finalReceiptY = (doc as any).lastAutoTable?.finalY || 160;

  // Stamp & Verification
  if (finalReceiptY + 25 < 200) {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text("Official Stamp & Verification:", 10, finalReceiptY + 8);

    doc.setLineWidth(0.4);
    doc.setDrawColor(203, 213, 225);
    doc.line(10, finalReceiptY + 20, 60, finalReceiptY + 20);
    doc.text("Bursary Officer Signature", 10, finalReceiptY + 24);

    doc.line(80, finalReceiptY + 20, 130, finalReceiptY + 20);
    doc.text("Official School Seal", 80, finalReceiptY + 24);
  }

  doc.save(`JCC_Receipt_${receiptNum}_${student.name.replace(/ /g, '_')}.pdf`);
};


export const exportPlayersPdf = (players: Player[]) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 32, 'F');

  // Title Text
  doc.setTextColor(245, 158, 11); // amber-500
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text("JCC WOMEN'S FOOTBALL CLUB", 14, 12);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text("Bo District, Sierra Leone • SRFA Regional Championship Operations", 14, 18);

  doc.setTextColor(226, 232, 240);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("OFFICIAL PLAYER ROSTER & FITNESS RECORD REPORT", 14, 26);

  // Metadata Block
  const dateStr = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Report Generated: ${dateStr}`, 14, 38);
  doc.text(`Total Registered Athletes: ${players.length}`, 14, 43);

  const readyPlayers = players.filter((p) => p.fitnessStatus === 'Match Ready').length;
  doc.text(`Match Ready Fitness: ${readyPlayers} Athletes`, 110, 38);
  doc.text(`Affiliation: SRFA & Sierra Leone WPL`, 110, 43);

  // Table Data
  const tableHead = [['#', 'Player Name', 'Position', 'Age', 'Fitness Status', 'Apps', 'Goals', 'Assists', 'Rating']];
  const tableData = players.map((p) => [
    p.jerseyNumber.toString(),
    p.name,
    p.position,
    p.age.toString(),
    p.fitnessStatus,
    p.appearances.toString(),
    p.goals.toString(),
    p.assists.toString(),
    p.overallRating.toString(),
  ]);

  autoTable(doc, {
    startY: 48,
    head: tableHead,
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [217, 119, 6], // amber-600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [254, 243, 199], // amber-50
    },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 42 },
      2: { cellWidth: 26 },
      3: { cellWidth: 12 },
      4: { cellWidth: 28 },
      5: { cellWidth: 14 },
      6: { cellWidth: 14 },
      7: { cellWidth: 14 },
      8: { cellWidth: 16 },
    },
    margin: { left: 14, right: 14 },
  });

  // Footer Sign-off
  const finalY = (doc as any).lastAutoTable?.finalY || 180;

  if (finalY + 35 < 280) {
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Coaching & Technical Staff Sign-Off:", 14, finalY + 12);

    doc.setLineWidth(0.5);
    doc.setDrawColor(203, 213, 225);

    doc.line(14, finalY + 28, 80, finalY + 28);
    doc.text("Coach Mohamed Turay (Head Coach)", 14, finalY + 33);

    doc.line(110, finalY + 28, 180, finalY + 28);
    doc.text("Dr. Jonathan Kpakima (Technical Director)", 110, finalY + 33);
  }

  doc.save(`JCC_FC_Player_Roster_${dateStr.replace(/ /g, '_')}.pdf`);
};

export const exportExecutiveCombinedPdf = (students: Student[], players: Player[]) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const dateStr = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Page 1 Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(16, 185, 129);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text("JONATHAN'S CHILD CARE (JCC) & JCC FC", 14, 13);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text("Bo District, Sierra Leone • Executive Administrative Master Report", 14, 20);

  doc.setTextColor(226, 232, 240);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("MASTER EXECUTIVE RECORDS & ROSTER AUDIT", 14, 29);

  // Executive Summary Box
  doc.setDrawColor(16, 185, 129);
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(14, 40, 182, 26, 3, 3, 'FD');

  doc.setTextColor(22, 101, 52);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text("EXECUTIVE KEY METRICS SUMMARY", 18, 47);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`• Total Active Students: ${students.length} Pupils`, 18, 54);
  doc.text(`• Registered Athletes: ${players.length} JCC FC Squad Members`, 18, 60);

  const avgAttendance = Math.round(
    students.reduce((acc, curr) => acc + curr.attendanceRate, 0) / (students.length || 1)
  );
  doc.text(`• Average Attendance Rate: ${avgAttendance}%`, 105, 54);
  doc.text(`• Match Ready Fitness: ${players.filter((p) => p.fitnessStatus === 'Match Ready').length} Athletes`, 105, 60);

  // Section 1: Students Table
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text("1. ACADEMIC & STUDENT WELFARE ROSTER", 14, 73);

  const studentHead = [['ID', 'Name', 'Grade', 'Attendance', 'Nutrition', 'Scholarship', 'Sponsor']];
  const studentData = students.map((s) => [
    s.id,
    s.name,
    s.gradeLevel,
    `${s.attendanceRate}%`,
    s.nutritionStatus,
    s.scholarshipStatus,
    s.scholarshipStatus === 'Full Sponsor' ? 'Diaspora Trust' : s.scholarshipStatus === 'Partial Sponsor' ? 'JCC Bo Fund' : 'Self-Funded',
  ]);

  autoTable(doc, {
    startY: 77,
    head: studentHead,
    body: studentData,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129], fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
    margin: { left: 14, right: 14 },
  });

  let nextY = (doc as any).lastAutoTable?.finalY || 180;

  // Section 2: Football Players Table (Add new page if needed)
  if (nextY + 60 > 270) {
    doc.addPage();
    nextY = 20;
  } else {
    nextY += 10;
  }

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text("2. JCC WOMEN'S FOOTBALL SQUAD ROSTER", 14, nextY);

  const playerHead = [['#', 'Player Name', 'Position', 'Fitness Status', 'Apps', 'Goals', 'Assists', 'Rating']];
  const playerData = players.map((p) => [
    p.jerseyNumber.toString(),
    p.name,
    p.position,
    p.fitnessStatus,
    p.appearances.toString(),
    p.goals.toString(),
    p.assists.toString(),
    p.overallRating.toString(),
  ]);

  autoTable(doc, {
    startY: nextY + 4,
    head: playerHead,
    body: playerData,
    theme: 'striped',
    headStyles: { fillColor: [217, 119, 6], fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
    margin: { left: 14, right: 14 },
  });

  doc.save(`JCC_Master_Administrative_Report_${dateStr.replace(/ /g, '_')}.pdf`);
};

// ==========================================
// ORPHANAGE & CHILD WELFARE EXPORTERS
// ==========================================

export const exportOrphanRosterPdf = (orphans: OrphanRecord[]) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 34, 'F');

  doc.setTextColor(244, 63, 94); // rose-500
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text("JONATHAN'S CHILD CARE ORPHANAGE & WELFARE", 14, 12);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text("Bo District, Sierra Leone • Ministry of Social Welfare Partnership", 14, 19);

  doc.setTextColor(253, 164, 175);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text("CONFIDENTIAL RESIDENTIAL CHILD WELFARE ROSTER & GUARDIAN LOG", 14, 27);

  const dateStr = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${dateStr}`, 14, 40);
  doc.text(`Total Resident & Kinship Children: ${orphans.length}`, 14, 45);
  doc.text(`Child Protection Clearance: MSWGCA Bo Liaison`, 110, 40);
  doc.text(`Confidentiality Tier: Internal Caregivers & Welfare Officers Only`, 110, 45);

  const tableHead = [['Orphan ID', 'Child Name', 'Age', 'Orphan Category', 'Placement / Cottage', 'School Tier', 'Guardian / Kinship']];
  const tableData = orphans.map((o) => [
    o.id,
    o.fullName,
    `${o.age} yrs`,
    o.orphanCategory.replace(' (Both Parents Deceased)', ''),
    o.residentialPlacement.replace('JCC Bo Home ', ''),
    `${o.schoolTier} (${o.gradeLevel})`,
    `${o.guardian.guardianName} (${o.guardian.relation})`,
  ]);

  autoTable(doc, {
    startY: 50,
    head: tableHead,
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [225, 29, 72], // rose-600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 180;
  if (finalY + 30 < 280) {
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Approved by: Mrs. Aminata Conteh (Welfare Director & Child Protection Officer)", 14, finalY + 14);
    doc.text("Counter-signed: Dr. Jonathan Kpakima (Director, JCC Ministries)", 14, finalY + 20);
    doc.text("Official Seal: Jonathan's Child Care Bo Residential Home & Ministry Safeguarding Desk", 14, finalY + 26);
  }

  doc.save(`JCC_Orphan_Welfare_Roster_${dateStr.replace(/ /g, '_')}.pdf`);
};

export const exportOrphanWelfarePdf = (orphan: OrphanRecord) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Top Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(244, 63, 94); // rose-500
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text("JONATHAN'S CHILD CARE MINISTRIES - WELFARE DOSSIER", 14, 13);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text("Child Protection & Residential Welfare Department • Bo District, Sierra Leone", 14, 20);

  doc.setTextColor(253, 164, 175);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text("CONFIDENTIAL INDIVIDUAL CHILD WELFARE & CARE CASE REPORT", 14, 28);

  // Security Stamp
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(244, 63, 94);
  doc.roundedRect(14, 42, 182, 14, 2, 2, 'FD');
  doc.setTextColor(190, 18, 60);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text("RESTRICTED ACCESS • COMPLIANT WITH SIERRA LEONE CHILD RIGHTS ACT & MSWGCA", 18, 48);
  doc.setFont('helvetica', 'normal');
  doc.text(`Ministry Reg Number: ${orphan.ministryRegistrationNumber}  •  Privacy Classification: ${orphan.privacyLevel}`, 18, 53);

  // Section 1: Child Identity & Academic Placement
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text("1. CHILD IDENTITY & RESIDENTIAL PLACEMENT", 14, 64);

  const idData = [
    ['Full Name:', orphan.fullName, 'Orphan ID:', orphan.id],
    ['Gender & Age:', `${orphan.gender} • ${orphan.age} years old`, 'Date of Birth:', orphan.dateOfBirth],
    ['Admission Date:', orphan.admissionDate, 'Orphan Category:', orphan.orphanCategory],
    ['Placement:', orphan.residentialPlacement, 'Cottage / Room:', orphan.cottageOrDorm],
    ['House Parent:', orphan.houseParentName, 'School Level:', `${orphan.schoolTier} School - ${orphan.gradeLevel}`],
  ];

  autoTable(doc, {
    startY: 67,
    body: idData,
    theme: 'plain',
    styles: { fontSize: 8.5, cellPadding: 1.5, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 35, textColor: [71, 85, 105] },
      1: { cellWidth: 55 },
      2: { fontStyle: 'bold', cellWidth: 35, textColor: [71, 85, 105] },
      3: { cellWidth: 55 },
    },
    margin: { left: 14, right: 14 },
  });

  let curY = (doc as any).lastAutoTable?.finalY + 6 || 110;

  // Section 2: Guardian & Kinship Information
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text("2. LEGAL GUARDIAN & KINSHIP INFORMATION", 14, curY);

  const guardianData = [
    ['Guardian Name:', orphan.guardian.guardianName, 'Relation:', orphan.guardian.relation],
    ['Contact Phone:', orphan.guardian.contactNumber, 'Community Town:', orphan.guardian.communityLocation],
    ['Legal Custody Status:', orphan.guardian.legalStatus, 'Last Home Visit:', orphan.guardian.lastHomeVisitDate || 'N/A'],
    ['Caseworker Notes:', { content: orphan.guardian.caseworkerNotes || 'Routine kinship coordination.', colSpan: 3 }],
  ];

  autoTable(doc, {
    startY: curY + 3,
    body: guardianData,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42] },
    styles: { fontSize: 8, cellPadding: 2, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 35, fillColor: [248, 250, 252] },
      1: { cellWidth: 55 },
      2: { fontStyle: 'bold', cellWidth: 35, fillColor: [248, 250, 252] },
      3: { cellWidth: 55 },
    },
    margin: { left: 14, right: 14 },
  });

  curY = (doc as any).lastAutoTable?.finalY + 6 || 155;

  // Section 3: Daily Care, Nutrition & Medical Overview
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text("3. DAILY CARE ROUTINE, NUTRITION & CLINICAL METRICS", 14, curY);

  const careData = [
    ['Dietary Regimen:', { content: orphan.dailyCare.dietaryPlan, colSpan: 3 }],
    ['Morning Medicine/Supplements:', orphan.dailyCare.morningMedicationOrSupplements || 'None', 'Emotional Care:', orphan.dailyCare.emotionalCounselingStatus],
    ['Clothing & Uniform Kit:', orphan.dailyCare.clothingAndUniformStatus, 'Bedding & Hygiene:', orphan.dailyCare.beddingAndHygieneKit],
    ['Blood Group & Allergies:', `${orphan.health.bloodGroup || 'O+'} • Allergies: ${orphan.health.allergies || 'None'}`, 'Clinical Exam Status:', `${orphan.health.healthStatus} (${orphan.health.clinicExaminedBy})`],
    ['Growth Metrics:', `Weight: ${orphan.health.weightKg} kg | Height: ${orphan.health.heightCm} cm | BMI: ${orphan.health.bmi}`, 'Vaccinations:', orphan.health.vaccinationsCompleted.join(', ')],
  ];

  autoTable(doc, {
    startY: curY + 3,
    body: careData,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40, fillColor: [248, 250, 252] },
      1: { cellWidth: 50 },
      2: { fontStyle: 'bold', cellWidth: 40, fillColor: [248, 250, 252] },
      3: { cellWidth: 50 },
    },
    margin: { left: 14, right: 14 },
  });

  curY = (doc as any).lastAutoTable?.finalY + 6 || 210;

  // Section 4: Welfare Caseworker Logs
  if (curY + 35 > 270) {
    doc.addPage();
    curY = 20;
  }

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text("4. RECENT CASEWORKER WELFARE ENTRIES", 14, curY);

  const logHead = [['Date', 'Welfare Officer', 'Category', 'Urgency', 'Observation & Action Plan']];
  const logData = orphan.caseLogs.map((log) => [
    log.date,
    log.officerName,
    log.category,
    log.urgency,
    `${log.notes} ${log.actionTaken ? `\nAction: ${log.actionTaken}` : ''}`,
  ]);

  autoTable(doc, {
    startY: curY + 3,
    head: logHead,
    body: logData,
    theme: 'striped',
    headStyles: { fillColor: [225, 29, 72], fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 35 },
      2: { cellWidth: 30 },
      3: { cellWidth: 25 },
      4: { cellWidth: 68 },
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 240;
  if (finalY + 25 < 280) {
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Prepared by: Mrs. Aminata Conteh (Child Welfare Officer)", 14, finalY + 12);
    doc.text("Director Sign-off: Dr. Jonathan Kpakima (Director, JCC Bo)", 14, finalY + 18);
  }

  doc.save(`JCC_Welfare_Dossier_${orphan.fullName.replace(/ /g, '_')}_${orphan.id}.pdf`);
};

