"use client";

import { useEffect } from "react";
import { Loader2, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema, EventFormValues } from "../schema";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { RHFInput } from "../../../../components/fields/rhf-input";
import { DashboardEvent } from "../types";

interface EditEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event: DashboardEvent | null;
  onSave: (data: EventFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function EditEventDialog({
  isOpen,
  onClose,
  event,
  onSave,
  isSubmitting,
}: EditEventDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: "",
      date: new Date(),
    },
  });

  useEffect(() => {
    if (event && isOpen) {
      reset({
        name: event.name,
        date: new Date(event.date),
      });
    }
  }, [event, isOpen, reset]);

  const onSubmit = async (data: EventFormValues) => {
    try {
      await onSave(data);
    } catch {
      // The parent handles error notification
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#10131a] text-white border-[#45484f]/20">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
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
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
