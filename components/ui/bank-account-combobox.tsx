"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

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

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  branchName: string;
  isDefault?: boolean;
}

interface BankAccountComboboxProps {
  bankAccounts: BankAccount[];
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function BankAccountCombobox({ 
  bankAccounts, 
  value, 
  onChange, 
  placeholder = "Select bank account...",
  className 
}: BankAccountComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const selectedAccount = bankAccounts.find((account) => account.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedAccount 
            ? `${selectedAccount.bankName} - ${selectedAccount.accountNumber}${selectedAccount.isDefault ? " (Default)" : ""}` 
            : placeholder
          }
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search bank accounts..." className="h-9" />
          <CommandList>
            <CommandEmpty>No bank account found.</CommandEmpty>
            <CommandGroup>
              {bankAccounts.map((account) => (
                <CommandItem
                  key={account.id}
                  value={`${account.bankName} ${account.accountNumber}`}
                  onSelect={() => {
                    onChange(account.id === value ? undefined : account.id)
                    setOpen(false)
                  }}
                >
                  <div className="flex flex-col w-full">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{account.bankName}</span>
                      {account.isDefault && (
                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Account: {account.accountNumber}</span>
                      <span>•</span>
                      <span>Branch: {account.branchName}</span>
                    </div>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4 shrink-0",
                      value === account.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
