"use client";

import { Filter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function AgendaFilters({
  createdByFilter,
  setCreatedByFilter,
  assignedToFilter,
  setAssignedToFilter,
  clienteFilter,
  setClienteFilter,
  clienteSearchOpen,
  setClienteSearchOpen,
  clienteSearch,
  setClienteSearch,
  filteredClienteOptions,
  tipoFilter,
  setTipoFilter,
  hasActiveFilters,
  onClear,
  createdByOptions,
  assignedToOptions,
}) {
  return (
    <div className="flex flex-wrap gap-2 items-center pb-3 border-b flex-shrink-0">
      <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
        <Filter size={12} />
        Filtros:
        {hasActiveFilters && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold">
            Activos
          </span>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-slate-600">Creado por:</p>
        <Select value={createdByFilter} onValueChange={setCreatedByFilter}>
          <SelectTrigger className="w-32 h-8">
            <SelectValue placeholder="Creado por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {createdByOptions.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <p className="text-xs font-medium text-slate-600">Asignado a:</p>
        <Select value={assignedToFilter} onValueChange={setAssignedToFilter}>
          <SelectTrigger className="w-32 h-8">
            <SelectValue placeholder="Asignado a" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {assignedToOptions.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <p className="text-xs font-medium text-slate-600">Cliente:</p>
        <Popover open={clienteSearchOpen} onOpenChange={setClienteSearchOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-32 h-8 justify-start text-xs">
              <Search size={12} className="mr-1 flex-shrink-0" />
              <span className="truncate">
                {clienteFilter === "all" ? "Cliente" : clienteFilter}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" side="bottom">
            <Command>
              <CommandInput
                placeholder="Buscar cliente..."
                value={clienteSearch}
                onValueChange={setClienteSearch}
                className="text-xs"
              />
              <CommandList>
                {filteredClienteOptions.length === 0 ? (
                  <CommandEmpty>No encontrado</CommandEmpty>
                ) : (
                  <CommandGroup>
                    <CommandItem
                      value="all"
                      onSelect={() => {
                        setClienteFilter("all");
                        setClienteSearch("");
                        setClienteSearchOpen(false);
                      }}
                      className="cursor-pointer text-xs"
                    >
                      Todos
                    </CommandItem>
                    {filteredClienteOptions.map((cliente) => (
                      <CommandItem
                        key={cliente.id}
                        value={cliente.id}
                        onSelect={() => {
                          setClienteFilter(cliente.id);
                          setClienteSearch("");
                          setClienteSearchOpen(false);
                        }}
                        className="cursor-pointer text-xs"
                      >
                        {cliente.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-1 border rounded-lg p-0.5 bg-white">
        <Button size="sm" variant={tipoFilter === "all" ? "default" : "ghost"} onClick={() => setTipoFilter("all")} className="h-6 text-xs">
          Todos
        </Button>
        <Button size="sm" variant={tipoFilter === "op" ? "default" : "ghost"} onClick={() => setTipoFilter("op")} className="h-6 text-xs">
          OP
        </Button>
        <Button size="sm" variant={tipoFilter === "ld" ? "default" : "ghost"} onClick={() => setTipoFilter("ld")} className="h-6 text-xs">
          LD
        </Button>
      </div>

      {hasActiveFilters && (
        <Button size="sm" variant="outline" onClick={onClear} className="gap-1 h-8 text-xs">
          <X size={12} />
          Limpiar
        </Button>
      )}
    </div>
  );
}