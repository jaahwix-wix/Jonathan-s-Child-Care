import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student, Player } from '../types';

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
  doc.text("Bo District, Sierra Leone • Academic Record & Welfare System", 14, 18);

  doc.setTextColor(226, 232, 240);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("OFFICIAL STUDENT ENROLLMENT & ACADEMIC ROSTER REPORT", 14, 26);

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

  const avgAttendance = Math.round(
    students.reduce((acc, curr) => acc + curr.attendanceRate, 0) / (students.length || 1)
  );
  doc.text(`Average Attendance Rate: ${avgAttendance}%`, 110, 38);
  doc.text(`Status: Verified Administrative Copy`, 110, 43);

  // Table Data
  const tableHead = [['ID', 'Full Name', 'Grade', 'Age', 'Attendance', 'Nutrition', 'Scholarship', 'Primary Sponsor']];
  const tableData = students.map((s) => [
    s.id,
    s.name,
    s.gradeLevel,
    s.age.toString(),
    `${s.attendanceRate}%`,
    s.nutritionStatus,
    s.scholarshipStatus,
    s.sponsorshipStatus.sponsorName || 'JCC Fund',
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
      1: { cellWidth: 38 },
      2: { cellWidth: 18 },
      3: { cellWidth: 12 },
      4: { cellWidth: 20 },
      5: { cellWidth: 24 },
      6: { cellWidth: 24 },
      7: { cellWidth: 30 },
    },
    margin: { left: 14, right: 14 },
  });

  // Footer Sign-off
  const finalY = (doc as any).lastAutoTable?.finalY || 180;
  
  if (finalY + 35 < 280) {
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Administrative Verification Sign-Off:", 14, finalY + 12);

    doc.setLineWidth(0.5);
    doc.setDrawColor(203, 213, 225);
    
    doc.line(14, finalY + 28, 80, finalY + 28);
    doc.text("Mrs. Fatmata Sesay (Head Teacher)", 14, finalY + 33);

    doc.line(110, finalY + 28, 180, finalY + 28);
    doc.text("Dr. Jonathan Kpakima (Director)", 110, finalY + 33);
  }

  doc.save(`JCC_Student_Roster_${dateStr.replace(/ /g, '_')}.pdf`);
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
    p.number.toString(),
    p.name,
    p.position,
    p.age.toString(),
    p.fitnessStatus,
    p.appearances.toString(),
    p.goals.toString(),
    p.assists.toString(),
    p.rating.toString(),
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
    s.sponsorshipStatus.sponsorName || 'JCC Fund',
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
    p.number.toString(),
    p.name,
    p.position,
    p.fitnessStatus,
    p.appearances.toString(),
    p.goals.toString(),
    p.assists.toString(),
    p.rating.toString(),
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
