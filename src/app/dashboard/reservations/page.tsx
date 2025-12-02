"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, endOfDay, format, startOfDay } from "date-fns";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { ReservationDialog } from "@/components/reservations/reservation-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import type { Court, Reservation, User } from "@/lib/types";

interface ReservationPayload {
  id?: number;
  court: number;
  start_time: string;
  end_time: string;
  type: Reservation["type"];
  player?: number;
}

export default function ReservationsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const today = startOfDay(new Date());
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>(() => {
    const from = today;
    const to = addDays(from, 6);
    return { from, to: endOfDay(to) };
  });
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [players, setPlayers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReservation, setEditingReservation] =
    useState<Reservation | null>(null);
  const [deletingReservation, setDeletingReservation] =
    useState<Reservation | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [{ data: reservationData }, { data: courtsData }] =
          await Promise.all([api.reservations.list(), api.courts.list()]);
        setAllReservations(reservationData);
        setCourts(courtsData);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Não foi possível carregar as reservas.";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    async function loadPlayers() {
      try {
        const { data } = await api.users.list("?role=player");
        setPlayers(data);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Falha ao carregar os jogadores do clube.";
        toast.error(message);
      }
    }
    loadPlayers();
  }, [isAdmin]);

  const visibleReservations = useMemo(() => {
    if (!user || isAdmin) return allReservations;
    return allReservations.filter(
      (reservation) => reservation.player === user.id
    );
  }, [allReservations, isAdmin, user]);

  const filteredReservations = useMemo(() => {
    return visibleReservations.filter((reservation) => {
      const start = new Date(reservation.start_time);
      if (dateRange.from && start < startOfDay(dateRange.from)) {
        return false;
      }
      if (dateRange.to && start > endOfDay(dateRange.to)) {
        return false;
      }
      return true;
    });
  }, [visibleReservations, dateRange]);

  function handleDateChange(key: "from" | "to", picked?: Date) {
    setDateRange((prev) => {
      if (!picked) {
        return { ...prev, [key]: undefined };
      }
      const normalized = startOfDay(picked);
      if (key === "from" && prev.to && normalized > prev.to) {
        return { from: normalized, to: undefined };
      }
      return { ...prev, [key]: normalized };
    });
  }

  async function handleReservationSubmit(reservationData: ReservationPayload) {
    if (reservationData.id) {
      const { data } = await api.reservations.update(
        reservationData.id,
        reservationData
      );
      setAllReservations((prev) =>
        prev.map((item) => (item.id === data.id ? data : item))
      );
      return data;
    }
    const { data } = await api.reservations.create(reservationData);
    setAllReservations((prev) => [data, ...prev]);
    return data;
  }

  async function handleCancelReservation(reservation: Reservation) {
    try {
      await api.reservations.remove(reservation.id);
      setAllReservations((prev) =>
        prev.filter((item) => item.id !== reservation.id)
      );
      toast.success("Reserva cancelada e removida.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível cancelar a reserva.";
      toast.error(message);
    }
  }

  function handleOpenCreate() {
    setEditingReservation(null);
    setIsDialogOpen(true);
  }

  function handleOpenEdit(reservation: Reservation) {
    setEditingReservation(reservation);
    setIsDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <Card className="border-none bg-white/80 shadow-sm">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <CardTitle className="text-2xl">
              {isAdmin ? "Reservas" : "Minhas reservas"}
            </CardTitle>
            <CardDescription>
              {isAdmin
                ? "Gerencie as marcações em todas as quadras do clube."
                : "Filtre por data para encontrar partidas passadas ou futuras."}
            </CardDescription>
          </div>
          <div className="grid gap-3 text-sm md:grid-cols-2">
            <DatePickerField
              label="Data inicial"
              date={dateRange.from}
              onSelect={(date) => handleDateChange("from", date)}
              disabled={(date) =>
                dateRange.to ? date > endOfDay(dateRange.to) : false
              }
            />
            <DatePickerField
              label="Data final"
              date={dateRange.to}
              onSelect={(date) => handleDateChange("to", date)}
              disabled={(date) =>
                dateRange.from ? date < startOfDay(dateRange.from) : false
              }
              align="end"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredReservations.length} reserva(s) encontradas para o
              período selecionado.
            </p>
            <Button onClick={handleOpenCreate}>
              <Plus className="h-4 w-4" />
              Nova reserva
            </Button>
          </div>
          {loading ? (
            <div className="text-center text-sm text-muted-foreground">
              Carregando reservas...
            </div>
          ) : filteredReservations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Horário</TableHead>
                  {isAdmin ? <TableHead>Jogador</TableHead> : null}
                  <TableHead>Quadra</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReservations.map((reservation) => {
                  const start = new Date(reservation.start_time);
                  const end = new Date(reservation.end_time);
                  return (
                    <TableRow key={reservation.id}>
                      <TableCell className="font-semibold">
                        {format(start, "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        {format(start, "HH:mm")} - {format(end, "HH:mm")}
                      </TableCell>
                      {isAdmin ? (
                        <TableCell>{reservation.player_name}</TableCell>
                      ) : null}
                      <TableCell>{reservation.court_name}</TableCell>
                      <TableCell className="text-right">
                        {isAdmin ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(reservation)}
                            className="mr-2"
                          >
                            Editar
                          </Button>
                        ) : null}
                        <Button
                          variant={isAdmin ? "ghost" : "outline"}
                          size="sm"
                          className={isAdmin ? "text-rose-600" : ""}
                          onClick={() => setDeletingReservation(reservation)}
                          disabled={
                            new Date(reservation.start_time) <= new Date()
                          }
                        >
                          Cancelar
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-10 text-center">
              <p className="text-lg font-semibold text-foreground">
                Nenhuma reserva encontrada
              </p>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Ajuste o período acima ou crie uma nova reserva.
              </p>
              <Button className="mt-4" onClick={handleOpenCreate}>
                <Plus className="h-4 w-4" />
                Nova reserva
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {isDialogOpen ? (
        <ReservationDialog
          key={editingReservation ? editingReservation.id : "new"}
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingReservation(null);
            }
          }}
          courts={courts}
          players={players}
          currentPlayerId={user?.id ?? 0}
          isAdmin={Boolean(isAdmin)}
          initialReservation={editingReservation}
          onSubmit={handleReservationSubmit}
          reservations={allReservations}
        />
      ) : null}

      {deletingReservation ? (
        <Dialog
          open={Boolean(deletingReservation)}
          onOpenChange={(open) => {
            if (!open) setDeletingReservation(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancelar reserva</DialogTitle>
              <DialogDescription>
                Essa ação removerá a reserva de{" "}
                {deletingReservation.player_name}. Deseja continuar?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeletingReservation(null)}
              >
                Não cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (deletingReservation) {
                    handleCancelReservation(deletingReservation);
                    setDeletingReservation(null);
                  }
                }}
              >
                Cancelar reserva
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
function DatePickerField({
  label,
  date,
  onSelect,
  disabled,
  align = "start",
}: {
  label: string;
  date?: Date;
  onSelect: (date?: Date) => void;
  disabled?: (date: Date) => boolean;
  align?: "start" | "end";
}) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger
          className={cn(
            buttonVariants({
              variant: "outline",
              className: "w-full justify-start text-left font-normal",
            }),
            !date && "text-muted-foreground"
          )}
        >
          {date ? format(date, "dd/MM/yyyy") : "Selecionar"}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            mode="single"
            selected={date}
            onSelect={onSelect}
            disabled={disabled}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
