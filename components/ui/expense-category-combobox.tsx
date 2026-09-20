"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Tag } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

// API response type for expense categories
interface ApiExpenseCategory {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean | null;
  createdAt: string;
  updatedAt: string;
}

interface ExpenseCategoryComboboxProps {
  expenseCategories: ApiExpenseCategory[];
  expenseCategoryPromoters?: ApiExpenseCategory[];
  value?: string;
  onChange: (value: string | undefined) => void;
  onCategoryTypeChange?: (categoryId: string, isPromoter: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ExpenseCategoryCombobox({
  expenseCategories,
  expenseCategoryPromoters = [],
  value,
  onChange,
  onCategoryTypeChange,
  placeholder = "Select expense category...",
  disabled = false,
}: ExpenseCategoryComboboxProps) {
  const [open, setOpen] = React.useState(false);

  // Find selected category in either regular categories or promoters
  const selectedCategory = expenseCategories?.find(
    (category) => category.id === value
  );
  const selectedPromoter = expenseCategoryPromoters?.find(
    (promoter) => promoter.id === value
  );
  const selectedItem = selectedCategory || selectedPromoter;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >          {selectedItem ? (
            <div className="flex items-center gap-2 text-left">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{selectedItem.name}</span>
                  {selectedPromoter && (
                    <Badge variant="outline" className="text-xs">
                      Promoter
                    </Badge>
                  )}
                </div>
                {selectedItem.description && (
                  <span className="text-xs text-muted-foreground">
                    {selectedItem.description}
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
      <PopoverContent className="w-full p-0" align="start">        <Command>
          <CommandInput placeholder="Search categories..." />
          <CommandList>
            <CommandEmpty>
              {(expenseCategories?.length === 0 && expenseCategoryPromoters?.length === 0)
                ? "No expense categories available"
                : "No categories found."
              }
            </CommandEmpty>
            
            {/* Regular Expense Categories */}
            {expenseCategories && expenseCategories.length > 0 && (
              <CommandGroup heading="Expense Categories">
                {expenseCategories.map((category) => (
                  <CommandItem
                    key={category.id}
                    value={`${category.name} ${category.description || ""}`}
                    onSelect={() => {
                      const newValue = category.id === value ? undefined : category.id;
                      onChange(newValue);
                      if (onCategoryTypeChange && newValue) {
                        onCategoryTypeChange(newValue, false);
                      }
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === category.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {category.name}
                          </span>
                          {category.isActive === false && (
                            <Badge variant="secondary" className="text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        {category.description && (
                          <span className="text-xs text-muted-foreground">
                            {category.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Expense Category Promoters */}
            {expenseCategoryPromoters && expenseCategoryPromoters.length > 0 && (
              <CommandGroup heading="Promoter Categories">
                {expenseCategoryPromoters.map((promoter) => (
                  <CommandItem
                    key={promoter.id}
                    value={`${promoter.name} ${promoter.description || ""} promoter`}
                    onSelect={() => {
                      const newValue = promoter.id === value ? undefined : promoter.id;
                      onChange(newValue);
                      if (onCategoryTypeChange && newValue) {
                        onCategoryTypeChange(newValue, true);
                      }
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === promoter.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {promoter.name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            Promoter
                          </Badge>
                          {promoter.isActive === false && (
                            <Badge variant="secondary" className="text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        {promoter.description && (
                          <span className="text-xs text-muted-foreground">
                            {promoter.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
