"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const EMPTY_FORM = {
  id: null,
  modelo_id: "",
  marca_id: "",
  kilometraje: "",
  meses: "",
  años: [],
};

const EMPTY_RANGE = {
  start: "",
  end: "",
  opStart: "<=",
  opEnd: "<=",
};

function parseAnios(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map(String).filter(Boolean);
      }
    } catch {
      // sigue normal
    }

    return value
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }

  return [];
}

function rangesFromAnios(anios) {
  const arr = parseAnios(anios);

  if (!arr.length) return [{ ...EMPTY_RANGE }];

  return arr.map((item) => {
    const [start = "", end = ""] = String(item).split("-");
    return {
      start,
      end,
      opStart: "<=",
      opEnd: "<=",
    };
  });
}

const AlgoritmoVisitaDialog = ({
  open,
  onOpenChange,
  mode,
  record,
  marcas = [],
  onSave,
}) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [modelos, setModelos] = useState([]);
  const [isAll, setIsAll] = useState(false);
  const [yearRanges, setYearRanges] = useState([{ ...EMPTY_RANGE }]);
  const [loadingModelos, setLoadingModelos] = useState(false);

  const fetchModelos = async (marcaId) => {
    if (!marcaId) {
      setModelos([]);
      return;
    }

    try {
      setLoadingModelos(true);
      const response = await fetch(`/api/modelos?marca_id=${marcaId}`, {
        cache: "no-store",
      });
      const data = await response.json();
      setModelos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando modelos", error);
      setModelos([]);
    } finally {
      setLoadingModelos(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && record) {
      const parsedAnios = parseAnios(record.años);
      const appliesAll =
        parsedAnios.length === 1 && String(parsedAnios[0]) === "0001-9999";

      const normalized = {
        id: record.id ?? null,
        modelo_id: record.modelo_id ? String(record.modelo_id) : "",
        marca_id: record.marca_id ? String(record.marca_id) : "",
        kilometraje:
          record.kilometraje !== null && record.kilometraje !== undefined
            ? String(record.kilometraje)
            : "",
        meses:
          record.meses !== null && record.meses !== undefined
            ? String(record.meses)
            : "",
        años: parsedAnios,
      };

      setFormData(normalized);
      setIsAll(appliesAll);
      setYearRanges(
        appliesAll ? [{ ...EMPTY_RANGE }] : rangesFromAnios(parsedAnios)
      );

      if (record.marca_id) {
        fetchModelos(record.marca_id);
      } else {
        setModelos([]);
      }
    } else {
      setFormData(EMPTY_FORM);
      setModelos([]);
      setIsAll(false);
      setYearRanges([{ ...EMPTY_RANGE }]);
    }
  }, [open, mode, record]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "marca_id" ? { modelo_id: "" } : {}),
    }));

    if (name === "marca_id") {
      fetchModelos(value);
    }
  };

  const handleSwitchChange = (checked) => {
    setIsAll(!!checked);

    if (!checked && yearRanges.length === 0) {
      setYearRanges([{ ...EMPTY_RANGE }]);
    }
  };

  const handleAddColumn = () => {
    setYearRanges((prev) => [...prev, { ...EMPTY_RANGE }]);
  };

  const handleRemoveColumn = (index) => {
    setYearRanges((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleYearChange = (index, field, value) => {
    setYearRanges((prev) =>
      prev.map((range, i) =>
        i === index ? { ...range, [field]: value } : range
      )
    );
  };

  const handleOperatorStartChange = (index, value) => {
    setYearRanges((prev) =>
      prev.map((range, i) =>
        i === index ? { ...range, opStart: value } : range
      )
    );
  };

  const handleOperatorEndChange = (index, value) => {
    setYearRanges((prev) =>
      prev.map((range, i) =>
        i === index ? { ...range, opEnd: value } : range
      )
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let ranges = [];

    if (isAll) {
      ranges = ["0001-9999"];
    } else {
      ranges = yearRanges.map((range) => {
        const validStart = range.start || "0001";
        const validEnd = range.end || "9999";
        return `${validStart}-${validEnd}`;
      });
    }

    onSave({
      id: formData.id,
      modelo_id: formData.modelo_id,
      marca_id: formData.marca_id,
      kilometraje: formData.kilometraje,
      meses: formData.meses,
      años: ranges,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Editar Registro" : "Nuevo Registro"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <label>Marca</label>
              <Select
                value={formData.marca_id}
                onValueChange={(value) => handleSelectChange("marca_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar marca" />
                </SelectTrigger>
                <SelectContent>
                  {marcas.map((marca) => (
                    <SelectItem key={marca.id} value={String(marca.id)}>
                      {marca.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label>Modelo</label>
              <Select
                value={formData.modelo_id}
                onValueChange={(value) =>
                  handleSelectChange("modelo_id", value)
                }
                disabled={!formData.marca_id || loadingModelos}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingModelos
                        ? "Cargando modelos..."
                        : "Seleccionar modelo"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {modelos.map((modelo) => (
                    <SelectItem key={modelo.id} value={String(modelo.id)}>
                      {modelo.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label>Kilometraje</label>
              <Input
                type="number"
                name="kilometraje"
                value={formData.kilometraje}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>Meses</label>
              <Input
                type="number"
                name="meses"
                value={formData.meses}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>Años</label>

              <div className="space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <label>Aplica todos los rangos:</label>
                  <Switch checked={isAll} onCheckedChange={handleSwitchChange} />
                </div>

                {!isAll && (
                  <>
                    {yearRanges.map((range, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          type="number"
                          value={range.start}
                          onChange={(e) =>
                            handleYearChange(index, "start", e.target.value)
                          }
                          placeholder="Desde"
                          min="0001"
                          max="9999"
                        />

                        <Select
                          value={range.opStart}
                          onValueChange={(value) =>
                            handleOperatorStartChange(index, value)
                          }
                        >
                          <SelectTrigger className="w-[110px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="<=">≤</SelectItem>
                            <SelectItem value="<">menor</SelectItem>
                          </SelectContent>
                        </Select>

                        <Input value="Tu fuente" disabled className="w-[110px]" />

                        <Select
                          value={range.opEnd}
                          onValueChange={(value) =>
                            handleOperatorEndChange(index, value)
                          }
                        >
                          <SelectTrigger className="w-[110px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="<=">≤</SelectItem>
                            <SelectItem value=">">mayor</SelectItem>
                          </SelectContent>
                        </Select>

                        <Input
                          type="number"
                          value={range.end}
                          onChange={(e) =>
                            handleYearChange(index, "end", e.target.value)
                          }
                          placeholder="Hasta"
                          min="0001"
                          max="9999"
                        />

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleRemoveColumn(index)}
                        >
                          (-)
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddColumn}
                        >
                          (+)
                        </Button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">Guardar</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AlgoritmoVisitaDialog;