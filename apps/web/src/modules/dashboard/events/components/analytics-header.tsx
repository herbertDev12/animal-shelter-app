"use client";

import { useState } from "react";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema, EventFormValues } from "../schema";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { RHFInput } from "../../../../components/fields/rhf-input";

interface AnalyticsHeaderProps {
  onAddEvent: (data: EventFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function AnalyticsHeader({ onAddEvent, isSubmitting }: AnalyticsHeaderProps) {
  const [open, setOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: EventFormValues) => {
    try {
      await onAddEvent(data);
      reset();
      setOpen(false);
    } catch {
      // The parent handles error notification, we just prevent dialog from closing
    }
  };

  return (
    <div className="flex justify-between items-end mb-8">
      <div>
        <h2 className="text-4xl font-extrabold tracking-tight text-[#ecedf6]">
          Checkpoint Analytics
        </h2>
      </div>
      <div className="flex gap-3">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button
                variant="outline"
                className="rounded-xl border-[#45484f]/20 bg-[#10131a] text-[#ecedf6] text-xs font-bold hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-400 transition-colors"
              />
            }
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            Create Event
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-[#10131a] text-white border-[#45484f]/20">
            <DialogHeader>
              <DialogTitle>Create Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
              <RHFInput
                name="name"
                control={control}
                label="Event Name"
                placeholder="Enter event name"
                className="bg-[#0b0e14] border-[#45484f]/20 text-white placeholder:text-[#a9abb3]"
              />

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium leading-none">Event Date</label>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger
                        render={
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal bg-[#0b0e14] border-[#45484f]/20 text-white hover:bg-[#161a21]",
                              !field.value && "text-[#a9abb3]"
                            )}
                          />
                        }
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 bg-[#10131a] border-[#45484f]/20 text-white"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="bg-[#10131a] text-white"
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#cc97ff] text-[#10131a] hover:bg-[#cc97ff]/90 font-bold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Event"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
