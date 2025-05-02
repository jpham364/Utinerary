"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Period,
  display12HourValue,
  setDateByType,
} from "./time-picker-utils";

export interface PeriodSelectorProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  onRightFocus?: () => void;
  onLeftFocus?: () => void;
}

export const TimePeriodSelect = React.forwardRef<
  HTMLButtonElement,
  PeriodSelectorProps
>(({ date, setDate, onLeftFocus, onRightFocus }, ref) => {
  const [period, setPeriod] = React.useState<Period>(() => {
    if (!date) return "AM";
    return date.getHours() >= 12 ? "PM" : "AM";
  });

  // 🔁 Update local period if the date changes externally
  React.useEffect(() => {
    if (date) {
      const newPeriod = date.getHours() >= 12 ? "PM" : "AM";
      setPeriod(newPeriod);
    }
  }, [date]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowRight") onRightFocus?.();
    if (e.key === "ArrowLeft") onLeftFocus?.();
  };

  const handleValueChange = (value: Period) => {
    if (value === period) return;

    setPeriod(value);

    if (date) {
      const tempDate = new Date(date);
      const hours = display12HourValue(date.getHours());
      const newDate = setDateByType(
        tempDate,
        hours.toString(),
        "12hours",
        value
      );

      if (newDate.getTime() !== date.getTime()) {
        setDate(newDate);
      }
    }
  };

  return (
    <div className="flex h-10 items-center">
      <Select value={period} onValueChange={handleValueChange}>
        <SelectTrigger
          ref={ref}
          className="w-[70px] focus:bg-accent focus:text-accent-foreground pl-2.5 mt-1"
          onKeyDown={handleKeyDown}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
});

TimePeriodSelect.displayName = "TimePeriodSelect";