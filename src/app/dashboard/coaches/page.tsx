"use client";

import { useEffect, useState } from "react";
import { Pencil, Phone, Plus, Trash2 } from "lucide-react";
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
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import type { Coach } from "@/lib/types";

const defaultForm: Omit<Coach, "id"> = {
  name: "",
  phone: "",
};

export default function CoachesPage() {
  return <CoachesManager />;
}

function CoachesManager() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [coachToDelete, setCoachToDelete] = useState<Coach | null>(null);
  const [form, setForm] = useState<Omit<Coach, "id">>(defaultForm);

  useEffect(() => {
    async function loadCoaches() {
      try {
        const { data } = await api.coaches.list();
        setCoaches(data);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os coaches.";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
    loadCoaches();
  }, []);

  function handleDialogChange(open: boolean) {
    setIsDialogOpen(open);
    if (!open) {
      setEditingCoach(null);
      setForm(defaultForm);
    }
  }

  function handleOpenCreate() {
    if (!isAdmin) return;
    setEditingCoach(null);
    setForm(defaultForm);
    setIsDialogOpen(true);
  }

  function handleOpenEdit(coach: Coach) {
    if (!isAdmin) return;
    setEditingCoach(coach);
    setForm({
      name: coach.name,
      phone: coach.phone,
    });
    setIsDialogOpen(true);
  }

  async function handleDelete() {
    if (!isAdmin || !coachToDelete) return;
    setRemovingId(coachToDelete.id);
    try {
      await api.coaches.remove(coachToDelete.id);
      setCoaches((prev) =>
        prev.filter((coach) => coach.id !== coachToDelete.id)
      );
      toast.success("Coach removido com sucesso.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível remover o coach.";
      toast.error(message);
    } finally {
      setRemovingId(null);
      setCoachToDelete(null);
    }
  }

  async function handleSubmit() {
    if (!isAdmin) return;
    if (!form.name.trim()) {
      toast.error("Informe o nome do coach.");
      return;
    }
    if (!form.phone.trim()) {
      toast.error("Informe o telefone do coach.");
      return;
    }
    setIsSaving(true);
    try {
      if (editingCoach) {
        const { data } = await api.coaches.update(editingCoach.id, form);
        setCoaches((prev) =>
          prev.map((coach) => (coach.id === data.id ? data : coach))
        );
        toast.success("Coach atualizado.");
      } else {
        const { data } = await api.coaches.create(form);
        setCoaches((prev) => [...prev, data]);
        toast.success("Coach cadastrado com sucesso.");
      }
      handleDialogChange(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o coach.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <Card className="border-none bg-white/80 shadow-sm">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-2xl">Instrutores do clube</CardTitle>
            <CardDescription>
              {isAdmin
                ? "Cadastre instrutores para aparecerem no painel dos atletas."
                : "Consulte aqui os instrutores disponíveis no seu clube."}
            </CardDescription>
          </div>
          {isAdmin ? (
            <Button className="gap-2" onClick={handleOpenCreate}>
              <Plus className="size-4" />
              Novo instrutor
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {loading ? (
            <p className="col-span-2 text-center text-sm text-muted-foreground">
              Carregando instrutores...
            </p>
          ) : coaches.length > 0 ? (
            coaches.map((coach) => (
              <CoachCard
                key={coach.id}
                coach={coach}
                canEdit={isAdmin}
                onEdit={isAdmin ? () => handleOpenEdit(coach) : undefined}
                onDelete={isAdmin ? () => setCoachToDelete(coach) : undefined}
                deleting={isAdmin && removingId === coach.id}
              />
            ))
          ) : (
            <div className="col-span-2 rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              {isAdmin
                ? 'Nenhum instrutor cadastrado ainda. Clique em "Novo instrutor" para começar.'
                : "Nenhum instrutor disponível no momento."}
            </div>
          )}
        </CardContent>
      </Card>

      {isAdmin ? (
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCoach
                  ? `Editar ${editingCoach.name}`
                  : "Novo instrutor"}
              </DialogTitle>
              <DialogDescription>
                Preencha as informações que ficarão visíveis para os atletas do
                clube.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  value={form.phone}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, phone: event.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => handleDialogChange(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={isSaving}>
                {isSaving ? "Salvando..." : "Confirmar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
      {isAdmin && coachToDelete ? (
        <Dialog
          open={Boolean(coachToDelete)}
          onOpenChange={(open) => {
            if (!open) setCoachToDelete(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remover instrutor</DialogTitle>
              <DialogDescription>
                Confirme para remover {coachToDelete.name} da lista de
                instrutores.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCoachToDelete(null)}>
                Manter instrutor
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={removingId === coachToDelete.id}
              >
                Remover
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}

function CoachCard({
  coach,
  canEdit,
  onEdit,
  onDelete,
  deleting,
}: {
  coach: Coach;
  canEdit: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  deleting: boolean;
}) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border bg-white/70 p-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">{coach.name}</p>
          {canEdit ? (
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={onEdit}>
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-rose-600"
                onClick={onDelete}
                disabled={deleting}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ) : null}
        </div>
        <Badge variant="secondary" className="w-fit capitalize">
          Instrutor
        </Badge>
      </div>
      <div className="mt-4 space-y-1 text-xs text-muted-foreground">
        {coach.phone ? (
          <p className="flex items-center gap-1">
            <Phone className="size-3" /> {coach.phone}
          </p>
        ) : null}
      </div>
    </div>
  );
}
