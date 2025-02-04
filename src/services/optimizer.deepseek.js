const { parseISO, formatISO, startOfYear, endOfYear, eachDayOfInterval, isWeekend, isSaturday, isSunday, addDays, subDays, isSameDay } = require('date-fns');

function optimizeCTODays({ numberOfDays, strategy = 'balanced', year = new Date().getFullYear(), customDaysOff = [] }) {
    // Preprocess all dates for the year
    const startDate = startOfYear(new Date(year, 0));
    const endDate = endOfYear(new Date(year, 0));
    const allDates = eachDayOfInterval({ start: startDate, end: endDate }).map(d => ({
        date: d,
        dateStr: formatISO(d, { representation: 'date' }),
        isWeekend: isWeekend(d),
        isHoliday: false,
        holidayName: undefined,
        isCustomDayOff: false,
        customDayName: undefined,
        isCTO: false,
        isPartOfBreak: false,
    }));

    // Mark holidays
    const HOLIDAYS = [
        { date: `${year}-01-01`, name: "New Year's Day" },
        { date: `${year}-02-17`, name: 'Family Day' },
        { date: `${year}-04-18`, name: 'Good Friday' },
        { date: `${year}-05-19`, name: 'Victoria Day' },
        { date: `${year}-07-01`, name: 'Canada Day' },
        { date: `${year}-09-01`, name: 'Labour Day' },
        { date: `${year}-10-13`, name: 'Thanksgiving Day' },
        { date: `${year}-11-11`, name: 'Remembrance Day' },
        { date: `${year}-12-25`, name: 'Christmas Day' },
        { date: `${year}-12-26`, name: 'Boxing Day' }
    ].map(h => ({ ...h, date: parseISO(h.date) }));

    allDates.forEach(day => {
        const holiday = HOLIDAYS.find(h => isSameDay(h.date, day.date));
        if (holiday) {
            day.isHoliday = true;
            day.holidayName = holiday.name;
        }
    });

    // Mark custom days off
    const customDates = customDaysOff.map(d => ({ ...d, date: parseISO(d.date) }));
    allDates.forEach(day => {
        const customDay = customDates.find(c => isSameDay(c.date, day.date));
        if (customDay) {
            day.isCustomDayOff = true;
            day.customDayName = customDay.name;
        }
    });

    // Generate existing off blocks (consecutive days that are weekend, holiday, or custom day off)
    const offBlocks = [];
    let currentBlock = null;
    allDates.forEach((day, index) => {
        if (day.isWeekend || day.isHoliday || day.isCustomDayOff) {
            if (!currentBlock) {
                currentBlock = { start: index, end: index, days: [index] };
            } else {
                currentBlock.end = index;
                currentBlock.days.push(index);
            }
        } else {
            if (currentBlock) {
                offBlocks.push(currentBlock);
                currentBlock = null;
            }
        }
    });
    if (currentBlock) offBlocks.push(currentBlock);

    // Generate candidate breaks
    const candidates = [];

    // Extension candidates: extend existing off blocks with a single CTO day
    offBlocks.forEach(block => {
        // Extend before
        if (block.start > 0) {
            const prevDay = block.start - 1;
            if (!allDates[prevDay].isWeekend && !allDates[prevDay].isHoliday && !allDates[prevDay].isCustomDayOff) {
                const ctoDays = 1;
                const totalDays = (block.end - prevDay + 1);
                candidates.push({
                    type: 'extension',
                    days: Array.from({ length: totalDays }, (_, i) => prevDay + i),
                    ctoDaysUsed: ctoDays,
                    efficiency: totalDays / ctoDays,
                    length: totalDays,
                });
            }
        }
        // Extend after
        if (block.end < allDates.length - 1) {
            const nextDay = block.end + 1;
            if (!allDates[nextDay].isWeekend && !allDates[nextDay].isHoliday && !allDates[nextDay].isCustomDayOff) {
                const ctoDays = 1;
                const totalDays = (nextDay - block.start + 1);
                candidates.push({
                    type: 'extension',
                    days: Array.from({ length: totalDays }, (_, i) => block.start + i),
                    ctoDaysUsed: ctoDays,
                    efficiency: totalDays / ctoDays,
                    length: totalDays,
                });
            }
        }
    });

    // Bridge candidates: connect two off blocks with CTO days
    for (let i = 0; i < offBlocks.length - 1; i++) {
        const currentBlock = offBlocks[i];
        const nextBlock = offBlocks[i + 1];
        const gapStart = currentBlock.end + 1;
        const gapEnd = nextBlock.start - 1;
        if (gapStart > gapEnd) continue;

        // Check if all days in gap are workdays
        let isAllWorkdays = true;
        for (let j = gapStart; j <= gapEnd; j++) {
            if (allDates[j].isWeekend || allDates[j].isHoliday || allDates[j].isCustomDayOff) {
                isAllWorkdays = false;
                break;
            }
        }
        if (!isAllWorkdays) continue;

        const ctoDaysUsed = gapEnd - gapStart + 1;
        const totalDays = (currentBlock.end - currentBlock.start + 1) + ctoDaysUsed + (nextBlock.end - nextBlock.start + 1);
        candidates.push({
            type: 'bridge',
            days: [...currentBlock.days, ...Array.from({ length: ctoDaysUsed }, (_, i) => gapStart + i), ...nextBlock.days],
            ctoDaysUsed,
            efficiency: totalDays / ctoDaysUsed,
            length: totalDays,
        });
    }

    // Sort candidates based on strategy and efficiency
    candidates.sort((a, b) => {
        let aPriority = a.efficiency;
        let bPriority = b.efficiency;

        // Adjust priority based on strategy and break length
        const getStrategyMultiplier = (length) => {
            switch (strategy) {
                case 'longWeekends':
                    return (length >= 3 && length <= 4) ? 2 : 1;
                case 'weekLongBreaks':
                    return (length >= 5 && length <= 9) ? 2 : 1;
                case 'extendedVacations':
                    return (length >= 10) ? 2 : 1;
                case 'balanced':
                    return 1;
                default:
                    return 1;
            }
        };

        aPriority *= getStrategyMultiplier(a.length);
        bPriority *= getStrategyMultiplier(b.length);

        return bPriority - aPriority;
    });

    // Select candidates, ensuring no overlap and using exactly numberOfDays
    const selectedBreaks = [];
    let remainingCTO = numberOfDays;
    const usedDays = new Set();

    for (const candidate of candidates) {
        if (remainingCTO <= 0) break;
        if (candidate.ctoDaysUsed > remainingCTO) continue;

        // Check if candidate days are available
        let canTake = true;
        for (const day of candidate.days) {
            if (usedDays.has(day)) {
                canTake = false;
                break;
            }
        }
        if (!canTake) continue;

        // Mark days as used
        candidate.days.forEach(day => usedDays.add(day));
        selectedBreaks.push(candidate);
        remainingCTO -= candidate.ctoDaysUsed;
    }

    // Allocate remaining CTO days as standalone
    if (remainingCTO > 0) {
        for (let i = 0; i < allDates.length && remainingCTO > 0; i++) {
            if (!usedDays.has(i) && !allDates[i].isWeekend && !allDates[i].isHoliday && !allDates[i].isCustomDayOff) {
                selectedBreaks.push({
                    type: 'standalone',
                    days: [i],
                    ctoDaysUsed: 1,
                    efficiency: 1,
                    length: 1,
                });
                usedDays.add(i);
                remainingCTO--;
            }
        }
    }

    // Mark CTO days and part of breaks
    selectedBreaks.forEach(break_ => {
        break_.days.forEach(day => {
            if (!allDates[day].isWeekend && !allDates[day].isHoliday && !allDates[day].isCustomDayOff) {
                allDates[day].isCTO = true;
            }
            allDates[day].isPartOfBreak = true;
        });
    });

    // Generate breaks output
    const breaks = [];
    let currentBreak = null;
    allDates.forEach((day, index) => {
        if (day.isPartOfBreak) {
            if (!currentBreak) {
                currentBreak = { start: index, end: index };
            } else {
                currentBreak.end = index;
            }
        } else {
            if (currentBreak) {
                breaks.push(currentBreak);
                currentBreak = null;
            }
        }
    });
    if (currentBreak) breaks.push(currentBreak);

    const formattedBreaks = breaks.map(br => {
        const daysInBreak = allDates.slice(br.start, br.end + 1);
        const ctoDays = daysInBreak.filter(d => d.isCTO).length;
        const holidays = daysInBreak.filter(d => d.isHoliday).length;
        const weekends = daysInBreak.filter(d => d.isWeekend).length;
        const customDaysOff = daysInBreak.filter(d => d.isCustomDayOff).length;
        return {
            startDate: allDates[br.start].dateStr,
            endDate: allDates[br.end].dateStr,
            days: daysInBreak.map(d => ({
                date: d.dateStr,
                isWeekend: d.isWeekend,
                isCTO: d.isCTO,
                isPartOfBreak: true,
                isHoliday: d.isHoliday,
                holidayName: d.holidayName,
                isCustomDayOff: d.isCustomDayOff,
                customDayName: d.customDayName,
            })),
            totalDays: daysInBreak.length,
            ctoDays,
            holidays,
            weekends,
            customDaysOff,
        };
    });

    // Calculate stats
    const totalHolidays = allDates.filter(d => d.isHoliday).length;
    const totalCustomDaysOff = customDaysOff.length;
    const totalDaysOff = allDates.filter(d => d.isPartOfBreak).length;

    // Weekend classification
    let totalNormalWeekends = 0;
    let totalExtendedWeekends = 0;
    for (let i = 0; i < allDates.length; i++) {
        if (isSaturday(allDates[i].date)) {
            const sundayIndex = i + 1;
            if (sundayIndex < allDates.length && isSunday(allDates[sundayIndex].date)) {
                // Check if this weekend is part of a break that includes non-weekend days
                let isExtended = false;
                if (i > 0 && allDates[i - 1].isPartOfBreak) isExtended = true;
                if (sundayIndex + 1 < allDates.length && allDates[sundayIndex + 1].isPartOfBreak) isExtended = true;
                if (allDates[i].isPartOfBreak && (allDates[i].isCTO || allDates[i].isHoliday || allDates[i].isCustomDayOff)) isExtended = true;
                if (allDates[sundayIndex].isPartOfBreak && (allDates[sundayIndex].isCTO || allDates[sundayIndex].isHoliday || allDates[sundayIndex].isCustomDayOff)) isExtended = true;

                if (isExtended) {
                    totalExtendedWeekends++;
                } else {
                    totalNormalWeekends++;
                }
                i++; // Skip Sunday
            }
        }
    }

    // Prepare output
    return {
        days: allDates.map(d => ({
            date: d.dateStr,
            isWeekend: d.isWeekend,
            isCTO: d.isCTO,
            isPartOfBreak: d.isPartOfBreak,
            isHoliday: d.isHoliday,
            holidayName: d.holidayName,
            isCustomDayOff: d.isCustomDayOff,
            customDayName: d.customDayName,
        })),
        breaks: formattedBreaks,
        stats: {
            totalCTODays: numberOfDays,
            totalHolidays,
            totalNormalWeekends,
            totalExtendedWeekends,
            totalCustomDaysOff,
            totalDaysOff,
        },
    };
}

module.exports = { optimizeCTODays };