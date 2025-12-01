"use client";

import { useEffect, useState } from "react";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import type { Court } from "@/lib/types";

const surfaces: Court["surface"][] = ["saibro", "rápida"];
const statuses: Court["status"][] = ["disponível", "manutenção"];
type CourtForm = Omit<Court, "id">;

const defaultForm: CourtForm = {
  name: "",
  surface: "saibro",
  covered: false,
  lights: false,
  status: "disponível",
  opens_at: "06:00",
  closes_at: "22:00",
};

export default function CourtsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [clubCourts, setClubCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [courtToDelete, setCourtToDelete] = useState<Court | null>(null);
  const [form, setForm] = useState<CourtForm>(defaultForm);
  const timeOptions = Array.from({ length: 24 }, (_, hour) => hour.toString().padStart(2, "0") + ":00");

  useEffect(() => {
    async function loadCourts() {
      try {
        const { data } = await api.courts.list();
        setClubCourts(data);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Não foi possível carregar as quadras.";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
    loadCourts();
  }, []);

  function handleDialogChange(open: boolean) {
    setIsDialogOpen(open);
    if (!open) {
      setEditingCourt(null);
      setForm(defaultForm);
    }
  }

  function handleOpenCreate() {
    setEditingCourt(null);
    setForm(defaultForm);
    setIsDialogOpen(true);
  }

  function handleOpenEdit(court: Court) {
    setEditingCourt(court);
    setForm({
      name: court.name,
      surface: court.surface,
      covered: court.covered,
      lights: court.lights,
      status: court.status,
      opens_at: court.opens_at,
      closes_at: court.closes_at,
    });
    setIsDialogOpen(true);
  }

  async function handleDelete() {
    if (!courtToDelete) return;
    setRemovingId(courtToDelete.id);
    try {
      await api.courts.remove(courtToDelete.id);
      setClubCourts((prev) =>
        prev.filter((court) => court.id !== courtToDelete.id)
      );
      toast.success("Quadra removida com sucesso");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível remover a quadra.";
      toast.error(message);
    } finally {
      setRemovingId(null);
      setCourtToDelete(null);
    }
  }

  async function handleSubmit() {
    if (!form.name.trim()) {
      toast.error("Informe o nome da quadra");
      return;
    }

    setIsSaving(true);
    try {
      if (editingCourt) {
        const { data } = await api.courts.update(editingCourt.id, form);
        setClubCourts((prev) =>
          prev.map((court) => (court.id === data.id ? data : court))
        );
        toast.success("Quadra atualizada");
      } else {
        const { data } = await api.courts.create(form);
        setClubCourts((prev) => [...prev, data]);
        toast.success("Nova quadra adicionada");
      }
      handleDialogChange(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a quadra.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-none bg-white/80 shadow-sm">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-2xl">Quadras do seu clube</CardTitle>
            <CardDescription>
              Confira infraestrutura e escolha onde jogar.
            </CardDescription>
          </div>
          {isAdmin ? (
            <Button className="gap-2" onClick={handleOpenCreate}>
              <Plus className="size-4" />
              Nova quadra
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {loading ? (
            <p className="col-span-2 text-center text-sm text-muted-foreground">
              Carregando quadras...
            </p>
          ) : clubCourts.length > 0 ? (
            clubCourts.map((court) => (
              <CourtCard
                key={court.id}
                court={court}
                isAdmin={isAdmin}
                onEdit={() => handleOpenEdit(court)}
                onDelete={() => setCourtToDelete(court)}
                deleting={removingId === court.id}
              />
            ))
          ) : (
            <div className="col-span-2 rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              Nenhuma quadra cadastrada ainda. Clique em &quot;Nova quadra&quot;
              para começar.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCourt ? `Editar ${editingCourt.name}` : "Nova quadra"}
            </DialogTitle>
            <DialogDescription>
              Configure as quadras disponíveis para o clube. Todos os atletas
              verão as alterações em tempo real.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome da quadra</Label>
              <Input
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Tipo de piso</Label>
                <Select
                  value={form.surface}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      surface: value as Court["surface"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {surfaces.map((surface) => (
                      <SelectItem key={surface} value={surface}>
                        {surface}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      status: value as Court["status"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={form.covered}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({ ...prev, covered: Boolean(checked) }))
                  }
                />
                Coberta
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={form.lights}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({ ...prev, lights: Boolean(checked) }))
                  }
                />
                Iluminação noturna
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <TimeSelector
                label="Abre às"
                value={form.opens_at}
                options={timeOptions}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, opens_at: value }))
                }
              />
              <TimeSelector
                label="Fecha às"
                value={form.closes_at}
                options={timeOptions}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, closes_at: value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving
                ? "Salvando..."
                : editingCourt
                ? "Salvar alterações"
                : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {courtToDelete ? (
        <Dialog
          open={Boolean(courtToDelete)}
          onOpenChange={(open) => {
            if (!open) setCourtToDelete(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remover quadra</DialogTitle>
              <DialogDescription>
                Deseja remover definitivamente a quadra &quot;
                {courtToDelete.name}&quot;?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCourtToDelete(null)}>
                Manter quadra
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={removingId === courtToDelete.id}
              >
                Remover
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}

function CourtCard({
  court,
  isAdmin,
  onEdit,
  onDelete,
  deleting,
}: {
  court: Court;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="rounded-2xl border bg-white/90 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-foreground">{court.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="capitalize" variant="secondary">
            {court.surface}
          </Badge>
          {isAdmin ? (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                aria-label="Editar quadra"
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                aria-label="Remover quadra"
                disabled={deleting}
              >
                <Trash2 className="size-4 text-rose-600" />
              </Button>
            </div>
          ) : null}
        </div>
      </div>
      <div className="mt-4 space-y-1 text-sm text-muted-foreground">
        <p>
          <MapPin className="mr-1 inline size-4 text-primary" /> Estrutura:{" "}
          {court.covered ? "Coberta" : "Aberta"} ·{" "}
          {court.lights ? "Iluminação noturna" : "Sem luz"}
        </p>
        <p>
          Status atual: <StatusBadge status={court.status} />
        </p>
        <p>
          Funcionamento: {formatTime(court.opens_at)} -{" "}
          {formatTime(court.closes_at)}
        </p>
      </div>
    </div>
  );
}

function TimeSelector({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {value}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-0">
          <div className="max-h-60 overflow-y-auto p-2">
            {options.map((option) => (
              <Button
                key={option}
                type="button"
                variant={option === value ? "default" : "ghost"}
                className="mb-1 w-full justify-start"
                onClick={() => onChange(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function StatusBadge({ status }: { status: Court["status"] }) {
  const colors: Record<Court["status"], string> = {
    disponível: "text-emerald-600",
    manutenção: "text-amber-600",
  };
  return (
    <span
      className={`${colors[status] ?? "text-muted-foreground"} font-semibold`}
    >
      {status}
    </span>
  );
}

function formatTime(time: string) {
  const [hours = "00", minutes = "00"] = time.split(":");
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
}
