import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  datesWithData?: Date[];
}

export function DatePicker({ date, onDateChange, placeholder = "Select Date", datesWithData = [] }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between text-left font-normal h-12 bg-input",
            !date && "text-muted-foreground"
          )}
        >
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
          <CalendarIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          initialFocus
          className="pointer-events-auto"
          datesWithData={datesWithData}
        />
      </PopoverContent>
    </Popover>
  )
}