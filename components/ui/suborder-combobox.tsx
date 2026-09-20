"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SubOrder } from "@/types";

// API response type for suborders
interface ApiSubOrder {
  id: string;
  name: string;
  description: string | null;
  orderId: string;
  createdAt: string;
  updatedAt: string;
  order?: {
    orderNumber: string;
    description: string | null;
  };
  _count?: {
    transactions: number;
  };
}

interface SubOrderComboboxProps {
  subOrders: ApiSubOrder[];
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SubOrderCombobox({
  subOrders,
  value,
  onChange,
  placeholder = "Select suborder...",
  disabled = false,
}: SubOrderComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedSubOrder = subOrders?.find(
    (subOrder) => subOrder.id === value
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedSubOrder ? (
            <div className="flex items-center gap-2 text-left">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">                <span className="font-medium">{selectedSubOrder.name}</span>
                {selectedSubOrder.description && (
                  <span className="text-xs text-muted-foreground">
                    {selectedSubOrder.description}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search suborders..." />
          <CommandList>
            <CommandEmpty>
              {subOrders?.length === 0 
                ? "No suborders available for this order"
                : "No suborders found."
              }
            </CommandEmpty>            <CommandGroup>
              {subOrders?.map((subOrder) => (
                <CommandItem
                  key={subOrder.id}
                  value={`${subOrder.name} ${subOrder.description || ""}`}
                  onSelect={() => {
                    onChange(subOrder.id === value ? undefined : subOrder.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === subOrder.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {subOrder.name}
                        </span>
                      </div>
                      {subOrder.description && (
                        <span className="text-xs text-muted-foreground">
                          {subOrder.description}
                        </span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
