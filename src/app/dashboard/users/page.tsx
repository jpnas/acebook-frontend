"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { RoleGate } from "@/components/auth/role-gate";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

type PlayerFormState = {
  name: string;
  email: string;
};

export default function UsersPage() {
  const [query, setQuery] = useState("");
  const [players, setPlayers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<PlayerFormState>({ name: "", email: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    async function loadPlayers() {
      try {
        const { data } = await api.users.list("?role=player");
        setPlayers(data);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os jogadores.";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
    loadPlayers();
  }, []);

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return players;
    }
    return players.filter((user) => {
      return (
        user.name.toLowerCase().includes(normalized) ||
        user.email.toLowerCase().includes(normalized)
      );
    });
  }, [players, query]);

  function handleOpenEdit(user: User) {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
    });
    setIsDialogOpen(true);
  }

  function handleDialogChange(open: boolean) {
    setIsDialogOpen(open);
    if (!open) {
      setEditingUser(null);
      setForm({ name: "", email: "" });
    }
  }

  async function handleEditSubmit() {
    if (!editingUser) return;
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    if (!trimmedName) {
      toast.error("Informe o nome do jogador.");
      return;
    }
    if (!trimmedEmail) {
      toast.error("Informe o email do jogador.");
      return;
    }
    const [firstName, ...rest] = trimmedName.split(" ");
    const lastName = rest.join(" ");
    setIsSaving(true);
    try {
      const { data } = await api.users.update(editingUser.id, {
        first_name: firstName,
        last_name: lastName,
        email: trimmedEmail,
      });
      setPlayers((prev) =>
        prev.map((user) => (user.id === data.id ? data : user))
      );
      toast.success("Jogador atualizado com sucesso.");
      handleDialogChange(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o jogador.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!userToDelete) return;
    setRemovingId(userToDelete.id);
    try {
      await api.users.remove(userToDelete.id);
      setPlayers((prev) =>
        prev.filter((item) => item.id !== userToDelete.id)
      );
      toast.success("Jogador removido.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível remover o jogador.";
      toast.error(message);
    } finally {
      setRemovingId(null);
      setUserToDelete(null);
    }
  }

  return (
    <RoleGate
      allow={["admin"]}
      fallback={
        <div className="rounded-3xl border border-dashed bg-white/80 p-10 text-center text-sm text-muted-foreground">
          Apenas administradores podem visualizar esta área.
        </div>
      }
    >
      <div className="space-y-6">
        <Card className="border-none bg-white/80 shadow-sm">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <CardTitle className="text-2xl">Jogadores cadastrados</CardTitle>
              <CardDescription>
                Gerencie os atletas do seu clube e mantenha seus contatos
                atualizados.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <div className="flex items-center gap-2 rounded-full border bg-white px-3 py-1 sm:w-56">
                <Search className="size-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar por nome ou email"
                  className="border-none bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            {loading ? (
              <p className="col-span-2 text-center text-sm text-muted-foreground">
                Carregando jogadores...
              </p>
            ) : filteredUsers.length === 0 ? (
              <div className="col-span-2 rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                Nenhum jogador encontrado para os filtros selecionados.
              </div>
            ) : (
              filteredUsers.map((user) => (
                <PlayerCard
                  key={user.id}
                  user={user}
                  onEdit={() => handleOpenEdit(user)}
                  onDelete={() => setUserToDelete(user)}
                  deleting={removingId === user.id}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {editingUser ? (
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar jogador</DialogTitle>
              <DialogDescription>
                Atualize os dados visíveis para o atleta e para a equipe
                administrativa.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome completo</Label>
                <Input
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, email: event.target.value }))
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
              <Button onClick={handleEditSubmit} disabled={isSaving}>
                {isSaving ? "Salvando..." : "Salvar alterações"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}

      {userToDelete ? (
        <Dialog
          open={Boolean(userToDelete)}
          onOpenChange={(open) => {
            if (!open) setUserToDelete(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remover jogador</DialogTitle>
              <DialogDescription>
                Confirme para remover {userToDelete.name} do clube. Essa ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUserToDelete(null)}>
                Manter jogador
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={removingId === userToDelete.id}
              >
                Remover
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </RoleGate>
  );
}

function PlayerCard({
  user,
  onEdit,
  onDelete,
  deleting,
}: {
  user: User;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="space-y-4 rounded-2xl border bg-white/70 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarFallback>
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Editar ${user.name}`}
            onClick={onEdit}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-rose-600"
            aria-label={`Excluir ${user.name}`}
            onClick={onDelete}
            disabled={deleting}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
