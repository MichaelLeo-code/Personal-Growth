import { cellService } from "@/service";
import { CellType, HeadlineCell, MinuteEntry } from "@/types";

class MinutesService {
  private entriesByDateMap: Map<number, Record<string, number>> = new Map();

  getHeadlineCell(cellId: number): HeadlineCell | null {
    const cell = cellService.getCellById(cellId);
    if (!cell || cell.type !== CellType.Headline) {
      return null;
    }
    return cell as HeadlineCell;
  }

  addMinuteEntry(cellId: number, minutes: number): MinuteEntry | null {
    console.log('MinutesService: addMinuteEntry called with:', { cellId, minutes });
    const cell = this.getHeadlineCell(cellId);
    console.log('MinutesService: getHeadlineCell returned:', cell);
    
    if (!cell) {
      console.log('MinutesService: Cell not found or not a headline cell, returning null');
      return null;
    }

    const timestamp = new Date();
    const minuteEntry: MinuteEntry = {
      minutes,
      timestamp: {
        year: timestamp.getFullYear(),
        month: timestamp.getMonth() + 1,
        day: timestamp.getDate(),
        hour: timestamp.getHours(),
        minute: timestamp.getMinutes(),
      },
    };

    console.log('MinutesService: Adding minute entry:', minuteEntry);
    cell.minuteEntries = [...(cell.minuteEntries || []), minuteEntry];
    cellService.saveToStorage();
    cellService.notify();
    console.log('MinutesService: Minute entry added successfully, notified subscribers');
    return minuteEntry;
  }

  totalMinutes(cellId: number, dateFrom: Date, dateTo: Date): number | null {
    const cell = this.getHeadlineCell(cellId);
    if (!cell || !cell.minuteEntries) return null;
    return cell.minuteEntries.reduce((total, entry) => total + entry.minutes, 0);
  }

  getStreakStatus(cellId: number, percentageThreshold: number): { streakLengthDays: number, percentage: number } | null {
    const cell = this.getHeadlineCell(cellId);
    if (!cell || !cell.minuteEntries || cell.minuteEntries.length === 0) return null;

    const entriesByDate = this.getEntriesByDate(cellId);
    
    const today = new Date();

    let daysChecked = 0;
    let daysWithEntries = 0;
    let streakLengthDays = 0;
    let average = 0;

    while (average >= percentageThreshold) {
      const currentDate = new Date()
      currentDate.setDate(today.getDate() - daysChecked);
      
      const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
      
      if (entriesByDate[dateKey]) {
        daysWithEntries++;
      }
      
      daysChecked++;
      average = daysWithEntries / daysChecked;

      const oldestDateKey = Object.keys(entriesByDate).reduce((oldest, dateKey) => {
        return dateKey < oldest ? dateKey : oldest;
      }, Object.keys(entriesByDate)[0]);

      if (dateKey < oldestDateKey) {
        streakLengthDays = daysChecked;
        break;
      }
    }

    return { streakLengthDays, percentage: average };
  }

  getMinuteEntries(cellId: number): MinuteEntry[] | null {
    const cell = this.getHeadlineCell(cellId);
    if (!cell) return null;
    return cell.minuteEntries || [];
  }

  getDiligance(cellId: number, dateFrom: Date): number | null {
    const cell = this.getHeadlineCell(cellId);
    if (!cell) return null; // Does it have to be null?

    const entriesByDate = this.getEntriesByDate(cellId);
    const today = new Date();
    const fromDate = new Date(dateFrom);

    const totalDays = today.getDate() - fromDate.getDate();

    let daysWithEntries = 0;
    for (let i = 0; i <= totalDays; i++) {
      const currentDate = new Date(fromDate);
      currentDate.setDate(fromDate.getDate() + i);
      
      const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
      
      if (entriesByDate[dateKey]) {
        daysWithEntries++;
      }
    }

    return daysWithEntries / totalDays;
  }

  getEntriesByDate(cellId: number): Record<string, number> {
    const cell = this.getHeadlineCell(cellId);
    if (!cell) return {};

    const entriesByDate: Record<string, number> = {};
    if (!cell.minuteEntries) return entriesByDate;

    cell.minuteEntries.forEach((entry) => {
      const dateKey = `${entry.timestamp.year}-${entry.timestamp.month}-${entry.timestamp.day}`;
      if (!entriesByDate[dateKey]) {
        entriesByDate[dateKey] = 0;
      }
      entriesByDate[dateKey] += entry.minutes;
    });

    return entriesByDate;
  }

  // private addMinutesByDateRecords(cellId: number) : boolean {
  //   if (this.entriesByDateMap.has(cellId)) return false;

  //   this.entriesByDateMap.set(cellId, this.getEntriesByDate(cellId));
  //   return true;
  // }
}

export const minutesService = new MinutesService()