import { parseISO, formatISO, startOfYear, endOfYear, eachDayOfInterval, isWeekend, isSaturday, isSunday, addDays, subDays, isSameDay } from 'date-fns';

interface CustomDayOff {
    date: string;
    name: string;
}

interface Holiday {
    date: Date;
    name: string;
}

interface DayInfo {
    date: Date;
    dateStr: string;
    isWeekend: boolean;
    isHoliday: boolean;
    holidayName?: string;
    isCustomDayOff: boolean;
    customDayName?: string;
    isCTO: boolean;
    isPartOfBreak: boolean;
}

interface BreakCandidate {
    type: 'extension' | 'bridge' | 'standalone';
    days: number[];
    ctoDaysUsed: number;
    efficiency: number;
    length: number;
}

interface BreakPeriod {
    start: number;
    end: number;
    days?: number[];
}

interface OptimizedDay {
    date: string;
    isWeekend: boolean;
    isCTO: boolean;
    isPartOfBreak: boolean;
    isHoliday: boolean;
    holidayName?: string;
    isCustomDayOff: boolean;
    customDayName?: string;
}

interface Break {
    startDate: string;
    endDate: string;
    days: OptimizedDay[];
    totalDays: number;
    ctoDays: number;
    holidays: number;
    weekends: number;
    customDaysOff: number;
}

interface OptimizationStats {
    totalCTODays: number;
    totalHolidays: number;
    totalNormalWeekends: number;
    totalExtendedWeekends: number;
    totalCustomDaysOff: number;
    totalDaysOff: number;
}

interface OptimizationResult {
    days: OptimizedDay[];
    breaks: Break[];
    stats: OptimizationStats;
}

interface OptimizationParams {
    numberOfDays: number;
    strategy?: 'balanced' | 'longWeekends' | 'weekLongBreaks' | 'extendedVacations';
    year?: number;
    customDaysOff?: CustomDayOff[];
}

interface ValidationResult {
    isValid: boolean;
    errors: string[];
    fixes?: Array<{
        type: string;
        description: string;
        fix: () => void;
    }>;
}

function validateAndFixBreaks(
    allDates: DayInfo[],
    breaks: Break[],
    stats: OptimizationStats
): ValidationResult {
    const errors: string[] = [];
    const fixes: Array<{ type: string; description: string; fix: () => void }> = [];

    // Validation 1: Check CTO day count matches requested
    const actualCTOCount = allDates.filter(d => d.isCTO).length;
    if (actualCTOCount !== stats.totalCTODays) {
        errors.push(`CTO day count mismatch: expected ${stats.totalCTODays}, got ${actualCTOCount}`);
        fixes.push({
            type: 'CTO_COUNT',
            description: 'Adjust CTO days to match requested count',
            fix: () => adjustCTODayCount(allDates, stats.totalCTODays)
        });
    }

    // Validation 2: Check break continuity
    breaks.forEach((breakPeriod, index) => {
        const breakDays = breakPeriod.days;
        for (let i = 1; i < breakDays.length; i++) {
            const prevDate = parseISO(breakDays[i - 1].date);
            const currDate = parseISO(breakDays[i].date);
            const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
            if (dayDiff !== 1) {
                errors.push(`Break discontinuity found in break ${index + 1}`);
                fixes.push({
                    type: 'BREAK_CONTINUITY',
                    description: 'Split discontinuous break into separate breaks',
                    fix: () => splitDiscontinuousBreak(allDates, breakPeriod)
                });
            }
        }
    });

    // Validation 3: Check weekend pair integrity
    for (let i = 0; i < allDates.length - 1; i++) {
        const day = allDates[i];
        const nextDay = allDates[i + 1];
        if (isSaturday(day.date) && isSunday(nextDay.date)) {
            if (day.isPartOfBreak !== nextDay.isPartOfBreak) {
                errors.push(`Weekend pair integrity violation found at ${day.dateStr}`);
                fixes.push({
                    type: 'WEEKEND_INTEGRITY',
                    description: 'Fix weekend pair break status',
                    fix: () => fixWeekendPairIntegrity(allDates, i)
                });
            }
        }
    }

    // Apply fixes if needed
    if (fixes.length > 0) {
        fixes.forEach(fix => fix.fix());
        return validateAndFixBreaks(allDates, breaks, stats); // Recursive validation after fixes
    }

    return {
        isValid: errors.length === 0,
        errors,
        fixes
    };
}

function adjustCTODayCount(allDates: DayInfo[], targetCount: number): void {
    const currentCount = allDates.filter(d => d.isCTO).length;
    
    if (currentCount > targetCount) {
        // Remove excess CTO days, prioritizing removal from shorter breaks
        const ctoDays = allDates
            .map((day, index) => ({ day, index }))
            .filter(({ day }) => day.isCTO)
            .sort((a, b) => {
                const aBreakLength = getBreakLength(allDates, a.index);
                const bBreakLength = getBreakLength(allDates, b.index);
                return aBreakLength - bBreakLength;
            });

        for (let i = 0; i < currentCount - targetCount; i++) {
            const { index } = ctoDays[i];
            allDates[index].isCTO = false;
            updateBreakStatus(allDates, index);
        }
    } else if (currentCount < targetCount) {
        // Add missing CTO days, prioritizing positions that extend existing breaks
        const candidates = findOptimalCTOPositions(allDates);
        const daysToAdd = Math.min(candidates.length, targetCount - currentCount);
        
        for (let i = 0; i < daysToAdd; i++) {
            const index = candidates[i];
            allDates[index].isCTO = true;
            allDates[index].isPartOfBreak = true;
            updateBreakStatus(allDates, index);
        }
    }
}

function getBreakLength(allDates: DayInfo[], index: number): number {
    let length = 1;
    let start = index;
    let end = index;

    // Look backwards
    while (start > 0 && allDates[start - 1].isPartOfBreak) {
        start--;
        length++;
    }

    // Look forwards
    while (end < allDates.length - 1 && allDates[end + 1].isPartOfBreak) {
        end++;
        length++;
    }

    return length;
}

function updateBreakStatus(allDates: DayInfo[], index: number): void {
    const day = allDates[index];
    if (!day.isCTO && !day.isHoliday && !day.isCustomDayOff && !day.isWeekend) {
        day.isPartOfBreak = false;
        
        // Check if this breaks a continuous break
        let start = index;
        let end = index;
        
        // Find break boundaries
        while (start > 0 && allDates[start - 1].isPartOfBreak) start--;
        while (end < allDates.length - 1 && allDates[end + 1].isPartOfBreak) end++;
        
        // If this day was in the middle, we need to check both sides
        if (start < index && end > index) {
            validateBreakContinuity(allDates, start, index - 1);
            validateBreakContinuity(allDates, index + 1, end);
        }
    }
}

function validateBreakContinuity(allDates: DayInfo[], start: number, end: number): void {
    for (let i = start; i <= end; i++) {
        const day = allDates[i];
        if (!day.isCTO && !day.isHoliday && !day.isCustomDayOff && !day.isWeekend) {
            day.isPartOfBreak = false;
        }
    }
}

function findOptimalCTOPositions(allDates: DayInfo[]): number[] {
    const candidates: Array<{ index: number; score: number }> = [];
    
    for (let i = 0; i < allDates.length; i++) {
        const day = allDates[i];
        if (!day.isCTO && !day.isHoliday && !day.isCustomDayOff && !day.isWeekend) {
            const score = calculatePositionScore(allDates, i);
            if (score > 0) {
                candidates.push({ index: i, score });
            }
        }
    }
    
    return candidates
        .sort((a, b) => b.score - a.score)
        .map(c => c.index);
}

function calculatePositionScore(allDates: DayInfo[], index: number): number {
    let score = 1;
    
    // Check adjacent days
    const prevDay = index > 0 ? allDates[index - 1] : null;
    const nextDay = index < allDates.length - 1 ? allDates[index + 1] : null;
    
    // Bonus for connecting to existing breaks
    if (prevDay?.isPartOfBreak) score += 2;
    if (nextDay?.isPartOfBreak) score += 2;
    
    // Bonus for Monday/Friday positions
    const dayOfWeek = new Date(allDates[index].date).getDay();
    if (dayOfWeek === 1 || dayOfWeek === 5) score += 1;
    
    // Penalty for creating isolated CTO days
    if ((!prevDay?.isPartOfBreak && !nextDay?.isPartOfBreak)) score -= 1;
    
    return score;
}

function splitDiscontinuousBreak(allDates: DayInfo[], breakPeriod: Break): void {
    const breakDays = breakPeriod.days;
    let currentBreakStart = 0;
    
    for (let i = 1; i < breakDays.length; i++) {
        const prevDate = parseISO(breakDays[i - 1].date);
        const currDate = parseISO(breakDays[i].date);
        const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (dayDiff > 1) {
            // End current break
            const currentBreakDays = breakDays.slice(currentBreakStart, i);
            updateBreakDays(allDates, currentBreakDays);
            
            // Start new break
            currentBreakStart = i;
        }
    }
    
    // Handle last break segment
    if (currentBreakStart < breakDays.length) {
        const lastBreakDays = breakDays.slice(currentBreakStart);
        updateBreakDays(allDates, lastBreakDays);
    }
}

function updateBreakDays(allDates: DayInfo[], breakDays: OptimizedDay[]): void {
    breakDays.forEach(breakDay => {
        const date = parseISO(breakDay.date);
        const dayIndex = allDates.findIndex(d => isSameDay(d.date, date));
        if (dayIndex !== -1) {
            allDates[dayIndex].isPartOfBreak = true;
        }
    });
}

function fixWeekendPairIntegrity(allDates: DayInfo[], saturdayIndex: number): void {
    const saturday = allDates[saturdayIndex];
    const sunday = allDates[saturdayIndex + 1];
    
    // If either day is part of a break, make both part of the break
    if (saturday.isPartOfBreak || sunday.isPartOfBreak) {
        saturday.isPartOfBreak = true;
        sunday.isPartOfBreak = true;
    } else {
        saturday.isPartOfBreak = false;
        sunday.isPartOfBreak = false;
    }
}

function optimizeCTODays({ 
    numberOfDays, 
    strategy = 'balanced', 
    year = new Date().getFullYear(), 
    customDaysOff = [] 
}: OptimizationParams): OptimizationResult {
    // Preprocess all dates for the year
    const startDate = startOfYear(new Date(year, 0));
    const endDate = endOfYear(new Date(year, 0));
    const allDates: DayInfo[] = eachDayOfInterval({ start: startDate, end: endDate }).map(d => ({
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
    const HOLIDAYS: Holiday[] = [
        { date: parseISO(`${year}-01-01`), name: "New Year's Day" },
        { date: parseISO(`${year}-02-17`), name: 'Family Day' },
        { date: parseISO(`${year}-04-18`), name: 'Good Friday' },
        { date: parseISO(`${year}-05-19`), name: 'Victoria Day' },
        { date: parseISO(`${year}-07-01`), name: 'Canada Day' },
        { date: parseISO(`${year}-09-01`), name: 'Labour Day' },
        { date: parseISO(`${year}-10-13`), name: 'Thanksgiving Day' },
        { date: parseISO(`${year}-11-11`), name: 'Remembrance Day' },
        { date: parseISO(`${year}-12-25`), name: 'Christmas Day' },
        { date: parseISO(`${year}-12-26`), name: 'Boxing Day' }
    ];

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
    const offBlocks: BreakPeriod[] = [];
    let currentBlock: BreakPeriod | null = null;
    allDates.forEach((day, index) => {
        if (day.isWeekend || day.isHoliday || day.isCustomDayOff) {
            if (!currentBlock) {
                currentBlock = { start: index, end: index, days: [index] };
            } else {
                currentBlock.end = index;
                currentBlock.days?.push(index);
            }
        } else {
            if (currentBlock) {
                offBlocks.push(currentBlock);
                currentBlock = null;
            }
        }
    });
    if (currentBlock) offBlocks.push(currentBlock);

    // Generate and select candidates
    const candidates = generateCandidates(allDates, offBlocks);
    const selectedBreaks = selectCandidates(candidates, numberOfDays, strategy, allDates);
    
    // Apply selected breaks
    applySelectedBreaks(allDates, selectedBreaks);
    
    // Calculate breaks and stats
    const breaks = calculateBreaks(allDates);
    const stats = calculateStats(allDates, numberOfDays);
    
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
        breaks,
        stats,
    };
}

function performInitialOptimization(
    allDates: DayInfo[], 
    numberOfDays: number,
    strategy: string
): OptimizationResult {
    const offBlocks = generateOffBlocks(allDates);
    const candidates = generateCandidates(allDates, offBlocks);
    const selectedBreaks = selectCandidates(candidates, numberOfDays, strategy, allDates);
    
    applySelectedBreaks(allDates, selectedBreaks);
    
    const breaks = calculateBreaks(allDates);
    const stats = calculateStats(allDates, numberOfDays);
    
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
        breaks,
        stats,
    };
}

function calculateBreaks(allDates: DayInfo[]): Break[] {
    const breaks: BreakPeriod[] = [];
    let currentBreak: BreakPeriod | null = null;
    
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

    return breaks.map(br => {
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
}

function calculateStats(
    allDates: DayInfo[],
    numberOfDays: number
): OptimizationStats {
    const totalHolidays = allDates.filter(d => d.isHoliday).length;
    const totalCustomDaysOff = allDates.filter(d => d.isCustomDayOff).length;
    const totalDaysOff = allDates.filter(d => d.isPartOfBreak).length;

    // Weekend classification
    let totalNormalWeekends = 0;
    let totalExtendedWeekends = 0;
    
    for (let i = 0; i < allDates.length; i++) {
        if (isSaturday(allDates[i].date)) {
            const sundayIndex = i + 1;
            if (sundayIndex < allDates.length && isSunday(allDates[sundayIndex].date)) {
                let isExtended = false;
                
                // Check surrounding days
                if (i > 0) {
                    const fridayInfo = allDates[i - 1];
                    if (fridayInfo.isPartOfBreak || fridayInfo.isCTO || fridayInfo.isHoliday || fridayInfo.isCustomDayOff) {
                        isExtended = true;
                    }
                }
                
                if (sundayIndex + 1 < allDates.length) {
                    const mondayInfo = allDates[sundayIndex + 1];
                    if (mondayInfo.isPartOfBreak || mondayInfo.isCTO || mondayInfo.isHoliday || mondayInfo.isCustomDayOff) {
                        isExtended = true;
                    }
                }
                
                // Check weekend days themselves
                const saturdayInfo = allDates[i];
                const sundayInfo = allDates[sundayIndex];
                
                if (saturdayInfo.isPartOfBreak && (saturdayInfo.isCTO || saturdayInfo.isHoliday || saturdayInfo.isCustomDayOff)) {
                    isExtended = true;
                }
                if (sundayInfo.isPartOfBreak && (sundayInfo.isCTO || sundayInfo.isHoliday || sundayInfo.isCustomDayOff)) {
                    isExtended = true;
                }

                if (isExtended) {
                    totalExtendedWeekends++;
                } else {
                    totalNormalWeekends++;
                }
                i++; // Skip Sunday
            }
        }
    }

    return {
        totalCTODays: numberOfDays,
        totalHolidays,
        totalNormalWeekends,
        totalExtendedWeekends,
        totalCustomDaysOff,
        totalDaysOff,
    };
}

// Helper functions for performInitialOptimization
function generateCandidates(allDates: DayInfo[], offBlocks: BreakPeriod[]): BreakCandidate[] {
    const candidates: BreakCandidate[] = [];

    // Extension candidates
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

    // Bridge candidates
    for (let i = 0; i < offBlocks.length - 1; i++) {
        const currentBlock = offBlocks[i];
        const nextBlock = offBlocks[i + 1];
        const gapStart = currentBlock.end + 1;
        const gapEnd = nextBlock.start - 1;
        
        if (gapStart > gapEnd) continue;

        let isAllWorkdays = true;
        for (let j = gapStart; j <= gapEnd; j++) {
            if (allDates[j].isWeekend || allDates[j].isHoliday || allDates[j].isCustomDayOff) {
                isAllWorkdays = false;
                break;
            }
        }
        if (!isAllWorkdays) continue;

        const ctoDaysUsed = gapEnd - gapStart + 1;
        const totalDays = (nextBlock.end - currentBlock.start + 1);
        candidates.push({
            type: 'bridge',
            days: [
                ...(currentBlock.days || []),
                ...Array.from({ length: ctoDaysUsed }, (_, i) => gapStart + i),
                ...(nextBlock.days || [])
            ],
            ctoDaysUsed,
            efficiency: totalDays / ctoDaysUsed,
            length: totalDays,
        });
    }

    return candidates;
}

function selectCandidates(
    candidates: BreakCandidate[], 
    numberOfDays: number,
    strategy: string = 'balanced',
    allDates: DayInfo[]
): BreakCandidate[] {
    const selectedBreaks: BreakCandidate[] = [];
    let remainingCTO = numberOfDays;
    const usedDays = new Set<number>();

    // Sort candidates by adjusted score (efficiency * strategy multiplier)
    candidates.sort((a, b) => {
        const aScore = calculateStrategyScore(a, strategy);
        const bScore = calculateStrategyScore(b, strategy);
        return bScore - aScore;
    });

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

    // If we still have remaining CTO days, try to allocate them according to strategy
    if (remainingCTO > 0) {
        const additionalBreaks = allocateRemainingDays(remainingCTO, usedDays, strategy, allDates);
        selectedBreaks.push(...additionalBreaks);
    }

    return selectedBreaks;
}

function calculateStrategyScore(candidate: BreakCandidate, strategy: string): number {
    let score = candidate.efficiency;
    const length = candidate.length;

    // Base multipliers for different break lengths
    const longWeekendMultiplier = (length >= 3 && length <= 4) ? 2.0 : 0.5;
    const weekLongMultiplier = (length >= 5 && length <= 9) ? 2.0 : 0.5;
    const extendedVacationMultiplier = (length >= 10) ? 2.0 : 0.5;

    // Strategy-specific scoring
    switch (strategy) {
        case 'longWeekends':
            score *= longWeekendMultiplier;
            // Extra bonus for optimal long weekend length (4 days)
            if (length === 4) score *= 1.5;
            break;

        case 'weekLongBreaks':
            score *= weekLongMultiplier;
            // Extra bonus for full week breaks (7 days)
            if (length === 7) score *= 1.5;
            break;

        case 'extendedVacations':
            score *= extendedVacationMultiplier;
            // Extra bonus for two-week breaks
            if (length >= 14) score *= 1.5;
            break;

        case 'balanced':
            // Use a weighted combination of all multipliers
            score *= (longWeekendMultiplier + weekLongMultiplier + extendedVacationMultiplier) / 3;
            break;
    }

    // Additional scoring factors
    if (candidate.type === 'bridge') {
        score *= 1.2; // Slight preference for bridge days as they're usually more efficient
    }

    return score;
}

function allocateRemainingDays(
    remainingDays: number,
    usedDays: Set<number>,
    strategy: string,
    allDates: DayInfo[]
): BreakCandidate[] {
    const additionalBreaks: BreakCandidate[] = [];
    let daysToAllocate = remainingDays;

    // Strategy-specific allocation of remaining days
    switch (strategy) {
        case 'longWeekends':
            // Try to create 3-4 day weekends with remaining days
            while (daysToAllocate > 0) {
                const break_ = createLongWeekend(usedDays, allDates);
                if (!break_) break;
                additionalBreaks.push(break_);
                daysToAllocate -= break_.ctoDaysUsed;
            }
            break;

        case 'weekLongBreaks':
            // Try to create 5-day breaks
            while (daysToAllocate >= 5) {
                const break_ = createWeekLongBreak(usedDays, allDates);
                if (!break_) break;
                additionalBreaks.push(break_);
                daysToAllocate -= break_.ctoDaysUsed;
            }
            break;

        case 'extendedVacations':
            // Try to create the longest possible break
            if (daysToAllocate >= 5) {
                const break_ = createExtendedBreak(usedDays, daysToAllocate, allDates);
                if (break_) {
                    additionalBreaks.push(break_);
                    daysToAllocate -= break_.ctoDaysUsed;
                }
            }
            break;

        case 'balanced':
            // Mix of different break lengths
            while (daysToAllocate > 0) {
                let break_: BreakCandidate | null = null;
                if (daysToAllocate >= 5) {
                    break_ = createWeekLongBreak(usedDays, allDates);
                }
                if (!break_ && daysToAllocate >= 2) {
                    break_ = createLongWeekend(usedDays, allDates);
                }
                if (!break_) {
                    break_ = createStandaloneDay(usedDays, allDates);
                }
                if (!break_) break;
                
                additionalBreaks.push(break_);
                daysToAllocate -= break_.ctoDaysUsed;
            }
            break;
    }

    // Allocate any remaining days as standalone days
    while (daysToAllocate > 0) {
        const break_ = createStandaloneDay(usedDays, allDates);
        if (!break_) break;
        additionalBreaks.push(break_);
        daysToAllocate--;
    }

    return additionalBreaks;
}

// Helper functions for remaining day allocation
function createLongWeekend(usedDays: Set<number>, allDates: DayInfo[]): BreakCandidate | null {
    // Look for Friday or Monday positions that would create a long weekend
    const potentialDays: number[] = [];
    
    // Find all available Fridays and Mondays
    for (let i = 0; i < allDates.length - 1; i++) {
        if (usedDays.has(i)) continue;
        
        const date = allDates[i].date;
        const dayOfWeek = date.getDay();
        
        if ((dayOfWeek === 1 || dayOfWeek === 5) && // Monday or Friday
            !allDates[i].isWeekend && 
            !allDates[i].isHoliday && 
            !allDates[i].isCustomDayOff) {
            
            // Check if this would create a long weekend
            if (dayOfWeek === 5) { // Friday
                if (i + 2 < allDates.length && 
                    allDates[i + 1].isWeekend && 
                    allDates[i + 2].isWeekend) {
                    potentialDays.push(i);
                }
            } else { // Monday
                if (i >= 2 && 
                    allDates[i - 1].isWeekend && 
                    allDates[i - 2].isWeekend) {
                    potentialDays.push(i);
                }
            }
        }
    }
    
    if (potentialDays.length === 0) return null;
    
    // Choose the best position (prefer earlier dates)
    const selectedDay = potentialDays[0];
    const dayOfWeek = allDates[selectedDay].date.getDay();
    
    return {
        type: 'extension',
        days: dayOfWeek === 5 ? 
            [selectedDay, selectedDay + 1, selectedDay + 2] : 
            [selectedDay - 2, selectedDay - 1, selectedDay],
        ctoDaysUsed: 1,
        efficiency: 3,
        length: 3,
    };
}

function createWeekLongBreak(usedDays: Set<number>, allDates: DayInfo[]): BreakCandidate | null {
    // Look for a sequence of 5 workdays that could form a week-long break
    for (let i = 0; i < allDates.length - 6; i++) {
        if (usedDays.has(i)) continue;
        
        let isValidSequence = true;
        let sequenceDays: number[] = [];
        let workdayCount = 0;
        let currentIndex = i;
        
        // Try to find 5 consecutive workdays
        while (workdayCount < 5 && currentIndex < allDates.length) {
            const day = allDates[currentIndex];
            
            if (usedDays.has(currentIndex) || 
                day.isWeekend || 
                day.isHoliday || 
                day.isCustomDayOff) {
                isValidSequence = false;
                break;
            }
            
            sequenceDays.push(currentIndex);
            workdayCount++;
            currentIndex++;
            
            // Skip weekends
            while (currentIndex < allDates.length && 
                   (allDates[currentIndex].isWeekend || 
                    allDates[currentIndex].isHoliday || 
                    allDates[currentIndex].isCustomDayOff)) {
                currentIndex++;
            }
        }
        
        if (isValidSequence && workdayCount === 5) {
            // Include surrounding weekends if available
            let startIdx = sequenceDays[0];
            let endIdx = sequenceDays[sequenceDays.length - 1];
            
            // Look for weekend before
            while (startIdx > 0 && allDates[startIdx - 1].isWeekend) {
                startIdx--;
                sequenceDays.unshift(startIdx);
            }
            
            // Look for weekend after
            while (endIdx < allDates.length - 1 && allDates[endIdx + 1].isWeekend) {
                endIdx++;
                sequenceDays.push(endIdx);
            }
            
            return {
                type: 'standalone',
                days: sequenceDays,
                ctoDaysUsed: 5,
                efficiency: sequenceDays.length / 5,
                length: sequenceDays.length,
            };
        }
    }
    
    return null;
}

function createExtendedBreak(usedDays: Set<number>, maxDays: number, allDates: DayInfo[]): BreakCandidate | null {
    // Look for the longest possible sequence of consecutive days
    let bestSequence: number[] | null = null;
    let bestEfficiency = 0;
    
    for (let i = 0; i < allDates.length; i++) {
        if (usedDays.has(i)) continue;
        
        let sequence: number[] = [];
        let ctoDaysUsed = 0;
        let currentIndex = i;
        let totalDays = 0;
        
        // Build sequence until we hit a used day or exceed maxDays
        while (currentIndex < allDates.length && 
               !usedDays.has(currentIndex) && 
               ctoDaysUsed < maxDays) {
            
            const day = allDates[currentIndex];
            sequence.push(currentIndex);
            totalDays++;
            
            if (!day.isWeekend && !day.isHoliday && !day.isCustomDayOff) {
                ctoDaysUsed++;
            }
            
            currentIndex++;
        }
        
        // Check if this is the best sequence so far
        const efficiency = totalDays / ctoDaysUsed;
        if (totalDays >= 10 && efficiency > bestEfficiency && ctoDaysUsed <= maxDays) {
            bestSequence = sequence;
            bestEfficiency = efficiency;
        }
    }
    
    if (!bestSequence) return null;
    
    return {
        type: 'standalone',
        days: bestSequence,
        ctoDaysUsed: maxDays,
        efficiency: bestEfficiency,
        length: bestSequence.length,
    };
}

function createStandaloneDay(usedDays: Set<number>, allDates: DayInfo[]): BreakCandidate | null {
    // Look for the best position for a standalone day
    let bestDay: number | null = null;
    let bestScore = -1;
    
    for (let i = 0; i < allDates.length; i++) {
        if (usedDays.has(i)) continue;
        
        const day = allDates[i];
        if (!day.isWeekend && !day.isHoliday && !day.isCustomDayOff) {
            const dayOfWeek = day.date.getDay();
            let score = 0;
            
            // Score based on position
            if (dayOfWeek === 1 || dayOfWeek === 5) score += 3; // Prefer Mondays and Fridays
            if (dayOfWeek === 2 || dayOfWeek === 4) score += 1; // Tuesday and Thursday next
            
            // Bonus for adjacent weekends/holidays
            if (i > 0 && (allDates[i - 1].isWeekend || allDates[i - 1].isHoliday)) score += 2;
            if (i < allDates.length - 1 && (allDates[i + 1].isWeekend || allDates[i + 1].isHoliday)) score += 2;
            
            if (score > bestScore) {
                bestScore = score;
                bestDay = i;
            }
        }
    }
    
    if (bestDay === null) return null;
    
    return {
        type: 'standalone',
        days: [bestDay],
        ctoDaysUsed: 1,
        efficiency: 1,
        length: 1,
    };
}

// Helper function to generate off blocks (extracted from performInitialOptimization)
function generateOffBlocks(allDates: DayInfo[]): BreakPeriod[] {
    const offBlocks: BreakPeriod[] = [];
    let currentBlock: BreakPeriod | null = null;
    
    allDates.forEach((day, index) => {
        if (day.isWeekend || day.isHoliday || day.isCustomDayOff) {
            if (!currentBlock) {
                currentBlock = { start: index, end: index, days: [index] };
            } else {
                currentBlock.end = index;
                currentBlock.days?.push(index);
            }
        } else {
            if (currentBlock) {
                offBlocks.push(currentBlock);
                currentBlock = null;
            }
        }
    });
    
    if (currentBlock) offBlocks.push(currentBlock);
    return offBlocks;
}

function applySelectedBreaks(allDates: DayInfo[], selectedBreaks: BreakCandidate[]): void {
    selectedBreaks.forEach(break_ => {
        break_.days.forEach(day => {
            if (!allDates[day].isWeekend && !allDates[day].isHoliday && !allDates[day].isCustomDayOff) {
                allDates[day].isCTO = true;
            }
            allDates[day].isPartOfBreak = true;
        });
    });
}

export { optimizeCTODays };
export type { OptimizationParams, OptimizationResult, OptimizedDay, Break, OptimizationStats }; 