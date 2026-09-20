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

export interface User {
  id: string;
  name: string;
  email?: string;
  balance?: number;
  [key: string]: any; // Allow for additional properties
}

export interface UserComboboxProps {
  users: User[];
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  className?: string;
  renderUserOption?: (user: User) => React.ReactNode;
}

export function UserCombobox({ 
  users, 
  value, 
  onChange, 
  placeholder = "Select user...",
  className,
  renderUserOption
}: UserComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const selectedUser = users.find((user) => user.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedUser ? (
            <div className="text-left overflow-hidden text-ellipsis whitespace-nowrap">
              {selectedUser.name}
              {selectedUser.balance !== undefined && (
                <span className="ml-2 text-xs opacity-70">
                  (Balance: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(selectedUser.balance || 0)})
                </span>
              )}
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search users..." className="h-9" />
          <CommandList>
            <CommandEmpty>No user found.</CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.name}                  onSelect={() => {
                    onChange(user.id === value ? undefined : user.id)
                    setOpen(false)
                  }}
                >
                  {renderUserOption ? (
                    renderUserOption(user)
                  ) : (
                    <div className="flex flex-col">
                      <span>{user.name}</span>
                      {user.email && (
                        <span className="text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      )}
                    </div>
                  )}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === user.id ? "opacity-100" : "opacity-0"
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
