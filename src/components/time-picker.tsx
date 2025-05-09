"use client";
 
import * as React from "react";
import { Label } from "@/components/ui/label";
import { TimePickerInput } from "./time-picker-input";
import { TimePeriodSelect } from "./period-select";
import { Period } from "./time-picker-utils";
 
interface TimePickerDemoProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}
 
export function TimePicker12({ date, setDate }: TimePickerDemoProps) {
  const [period] = React.useState<Period>("PM");
 
  const minuteRef = React.useRef<HTMLInputElement>(null);
  const hourRef = React.useRef<HTMLInputElement>(null);
  const secondRef = React.useRef<HTMLInputElement>(null);
  const periodRef = React.useRef<HTMLButtonElement>(null);
 
  return (
    <div className="flex items-end gap-2">
      <div className="grid gap-1 text-center">
        <Label htmlFor="hours" className="text-xs">
          Hours
        </Label>
        <TimePickerInput
          picker="12hours"
          period={period}
          date={date}
          setDate={setDate}
          ref={hourRef}
          onRightFocus={() => minuteRef.current?.focus()}
        />
      </div>
      <div className="grid gap-1 text-center">
        <Label htmlFor="minutes" className="text-xs">
          Minutes
        </Label>
        <TimePickerInput
          picker="minutes"
          id="minutes12"
          date={date}
          setDate={setDate}
          ref={minuteRef}
          onLeftFocus={() => hourRef.current?.focus()}
          onRightFocus={() => secondRef.current?.focus()}
        />
      </div>

      <div className="flex flex-col justify-end text-center">
        <Label htmlFor="period" className="text-xs">
          Period
        </Label>
        <div className="h-10">
          <TimePeriodSelect
            date={date}
            setDate={setDate}
            ref={periodRef}
            onLeftFocus={() => secondRef.current?.focus()}
          />
        </div>
      </div>
    </div>
  );
}