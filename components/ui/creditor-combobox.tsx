"use client"

import * as React from "react"
import { Check, ChevronsUpDown, UserCheck } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// API response type for creditors
interface ApiCreditor {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CreditorComboboxProps {
  creditors: ApiCreditor[];
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function CreditorCombobox({
  creditors,
  value,
  onChange,
  placeholder = "Select creditor...",
  disabled = false,
}: CreditorComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedCreditor = creditors?.find(
    (creditor) => creditor.id === value
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
          {selectedCreditor ? (
            <div className="flex items-center gap-2 text-left">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="font-medium">{selectedCreditor.name}</span>
                {selectedCreditor.description && (
                  <span className="text-xs text-muted-foreground">
                    {selectedCreditor.description}
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
          <CommandInput placeholder="Search creditors..." />
          <CommandList>
            <CommandEmpty>
              {creditors?.length === 0 
                ? "No creditors available"
                : "No creditors found."
              }
            </CommandEmpty>
            <CommandGroup>
              {creditors?.map((creditor) => (
                <CommandItem
                  key={creditor.id}
                  value={`${creditor.name} ${creditor.description || ""}`}
                  onSelect={() => {
                    onChange(creditor.id === value ? undefined : creditor.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === creditor.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {creditor.name}
                        </span>
                      </div>
                      {creditor.description && (
                        <span className="text-xs text-muted-foreground">
                          {creditor.description}
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