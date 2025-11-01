export interface DailyBreakdownItem {
  dateLabel: string;
  dateKey: string;
  category: 'weekend' | 'holiday' | 'company';
  reason: string;
}

export interface DateRangeBreakdown {
  label: string;
  items: DailyBreakdownItem[];
}
