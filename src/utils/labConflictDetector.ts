import { EquipmentAllocation, LabEquipment, ConflictCheckResult } from '../types';
import { LAB_TIME_SLOTS } from '../data/mockData';

export interface ConflictCheckParams {
  date: string;
  timeSlot: string;
  equipmentId: string;
  requestedQuantity: number;
  teacherName: string;
  labStation?: string;
  allocations: EquipmentAllocation[];
  equipmentList: LabEquipment[];
  excludeAllocationId?: string;
}

/**
 * Validates whether a proposed lab equipment booking causes a capacity overload,
 * teacher double-booking, or station collision.
 */
export function checkLabEquipmentConflict({
  date,
  timeSlot,
  equipmentId,
  requestedQuantity,
  teacherName,
  labStation,
  allocations,
  equipmentList,
  excludeAllocationId,
}: ConflictCheckParams): ConflictCheckResult {
  const targetEquipment = equipmentList.find((eq) => eq.id === equipmentId);
  const totalQuantity = targetEquipment ? targetEquipment.quantity : 0;

  // Filter existing active allocations at this exact Date and Time Slot
  const slotAllocations = allocations.filter(
    (a) =>
      a.date === date &&
      a.timeSlot === timeSlot &&
      a.status !== 'Completed' &&
      a.id !== excludeAllocationId
  );

  // 1. Check if the Teacher is already booked for another session/station at this time slot
  const teacherConflict = slotAllocations.find((a) => a.teacherName.toLowerCase() === teacherName.toLowerCase());
  if (teacherConflict) {
    const suggestedSlots = LAB_TIME_SLOTS.filter((slot) => {
      const isTeacherFree = !allocations.some(
        (a) => a.date === date && a.timeSlot === slot && a.teacherName.toLowerCase() === teacherName.toLowerCase()
      );
      const equipmentUsedInSlot = allocations
        .filter((a) => a.date === date && a.timeSlot === slot && a.equipmentId === equipmentId && a.status !== 'Completed')
        .reduce((sum, a) => sum + a.quantityAllocated, 0);
      const isEquipmentAvailable = totalQuantity - equipmentUsedInSlot >= requestedQuantity;
      return isTeacherFree && isEquipmentAvailable;
    });

    return {
      hasConflict: true,
      type: 'TEACHER_DOUBLE_BOOKED',
      conflictMessage: `Teacher Schedule Conflict: ${teacherName} is already scheduled for "${teacherConflict.equipmentName}" at ${teacherConflict.labStation || 'Lab Station'} during ${timeSlot}.`,
      conflictingAllocations: [teacherConflict],
      availableQuantity: totalQuantity,
      totalQuantity,
      suggestedAlternativeSlots: suggestedSlots,
    };
  }

  // 2. Check if the Lab Station is already in use by another teacher
  if (labStation) {
    const stationConflict = slotAllocations.find((a) => a.labStation === labStation);
    if (stationConflict) {
      return {
        hasConflict: true,
        type: 'STATION_OCCUPIED',
        conflictMessage: `Station Collision: ${labStation} is currently occupied by ${stationConflict.teacherName} for "${stationConflict.purpose}".`,
        conflictingAllocations: [stationConflict],
        availableQuantity: totalQuantity,
        totalQuantity,
        suggestedAlternativeSlots: LAB_TIME_SLOTS.filter(
          (s) => !allocations.some((a) => a.date === date && a.timeSlot === s && a.labStation === labStation)
        ),
      };
    }
  }

  // 3. Check Equipment Quantity Capacity for this specific equipment at this time slot
  const currentQuantityBooked = slotAllocations
    .filter((a) => a.equipmentId === equipmentId)
    .reduce((sum, a) => sum + a.quantityAllocated, 0);

  const availableQuantity = Math.max(0, totalQuantity - currentQuantityBooked);

  if (requestedQuantity > availableQuantity) {
    const conflictingForEquipment = slotAllocations.filter((a) => a.equipmentId === equipmentId);
    const teacherNames = conflictingForEquipment.map((a) => `${a.teacherName} (${a.quantityAllocated} units)`).join(', ');

    // Calculate alternative time slots where the full requested quantity is free
    const suggestedSlots = LAB_TIME_SLOTS.filter((slot) => {
      if (slot === timeSlot) return false;
      const bookedInSlot = allocations
        .filter((a) => a.date === date && a.timeSlot === slot && a.equipmentId === equipmentId && a.status !== 'Completed')
        .reduce((sum, a) => sum + a.quantityAllocated, 0);
      const isTeacherFree = !allocations.some(
        (a) => a.date === date && a.timeSlot === slot && a.teacherName.toLowerCase() === teacherName.toLowerCase()
      );
      return totalQuantity - bookedInSlot >= requestedQuantity && isTeacherFree;
    });

    return {
      hasConflict: true,
      type: 'EQUIPMENT_CAPACITY_EXCEEDED',
      conflictMessage: `Equipment Shortage / Double-Booking Conflict: Only ${availableQuantity} of ${totalQuantity} "${targetEquipment?.name || equipmentId}" units are available on ${date} (${timeSlot}). Currently reserved by: ${teacherNames}. You requested ${requestedQuantity} units.`,
      conflictingAllocations: conflictingForEquipment,
      availableQuantity,
      totalQuantity,
      suggestedAlternativeSlots: suggestedSlots,
    };
  }

  // No conflict
  return {
    hasConflict: false,
    type: 'NONE',
    conflictMessage: `All clear! ${availableQuantity - requestedQuantity} units will remain free after this allocation.`,
    conflictingAllocations: [],
    availableQuantity,
    totalQuantity,
  };
}

/**
 * Gets real-time availability metrics for an equipment item across all time slots for a given date
 */
export function getEquipmentDailyTimeline(
  equipmentId: string,
  date: string,
  allocations: EquipmentAllocation[],
  totalInventory: number
) {
  return LAB_TIME_SLOTS.map((slot) => {
    const activeAllocations = allocations.filter(
      (a) => a.equipmentId === equipmentId && a.date === date && a.timeSlot === slot && a.status !== 'Completed'
    );
    const bookedUnits = activeAllocations.reduce((sum, a) => sum + a.quantityAllocated, 0);
    const remainingUnits = Math.max(0, totalInventory - bookedUnits);
    const utilizationRate = totalInventory > 0 ? Math.round((bookedUnits / totalInventory) * 100) : 0;

    return {
      timeSlot: slot,
      bookedUnits,
      remainingUnits,
      utilizationRate,
      allocations: activeAllocations,
      isFullyBooked: remainingUnits === 0,
      isPartiallyBooked: bookedUnits > 0 && remainingUnits > 0,
      isAvailable: bookedUnits === 0,
    };
  });
}
