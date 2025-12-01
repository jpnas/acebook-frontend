"use client";

import { useEffect, useMemo, useState } from "react";
import { addHours, format, setHours, setMinutes, startOfDay } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import type { Court, Reservation, User } from "@/lib/types";

const FALLBACK_HOURS = Array.from({ length: 24 }, (_, hour) => hour.toString().padStart(2, "0") + ":00");

type ReservationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courts: Court[];
  players: User[];
  currentPlayerId: number;
  isAdmin: boolean;
  initialReservation?: Reservation | null;
  onSubmit: (payload: {
    id?: number;
    court: number;
    start_time: string;
    end_time: string;
    type: Reservation["type"];
    player?: number;
  }) => Promise<Reservation>;
  reservations: Reservation[];
};

export function ReservationDialog({
  open,
  onOpenChange,
  courts,
  players,
  currentPlayerId,
  isAdmin,
  initialReservation,
  onSubmit,
  reservations,
}: ReservationDialogProps) {
  const today = startOfDay(new Date());
  const isEdit = Boolean(initialReservation);
  const initialDate = initialReservation ? new Date(initialReservation.start_time) : today;
  const initialHour = initialReservation
    ? format(new Date(initialReservation.start_time), "HH:mm")
    : "";
  const initialCourtId = initialReservation ? initialReservation.court.toString() : courts[0]?.id.toString() ?? "";
  const initialPlayerId = initialReservation
    ? initialReservation.player.toString()
    : isAdmin
      ? ""
      : currentPlayerId.toString();

  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [selectedHour, setSelectedHour] = useState<string>(initialHour);
  const [selectedCourtId, setSelectedCourtId] = useState<string>(initialCourtId);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(initialPlayerId);
  const [isSaving, setIsSaving] = useState(false);

  const currentCourt = useMemo(() => {
    return courts.find((court) => court.id === Number(selectedCourtId));
  }, [courts, selectedCourtId]);

  const hourOptions = useMemo(() => {
    if (!currentCourt) {
      return FALLBACK_HOURS;
    }
    const [openHour] = currentCourt.opens_at.split(":").map(Number);
    const [closeHour] = currentCourt.closes_at.split(":").map(Number);
    const start = Number.isFinite(openHour) ? openHour : 0;
    const end = Number.isFinite(closeHour) ? closeHour : 23;
    if (start === end) {
      return FALLBACK_HOURS;
    }
    const normalizedEnd = end > start ? end : end + 24;
    const hours: string[] = [];
    for (let hour = start; hour < normalizedEnd; hour += 1) {
      hours.push((hour % 24).toString().padStart(2, "0") + ":00");
    }
    return hours;
  }, [currentCourt]);

  useEffect(() => {
    if (selectedHour && !hourOptions.includes(selectedHour)) {
      setSelectedHour("");
    }
  }, [hourOptions, selectedHour]);

  const localTakenHours = useMemo(() => {
    if (!selectedDate || !selectedCourtId) return new Set<string>();
    const dayKey = format(selectedDate, "yyyy-MM-dd");
    const taken = new Set<string>();
    reservations.forEach((reservation) => {
      if (reservation.court !== Number(selectedCourtId)) return;
      const reservationDate = new Date(reservation.start_time);
      const reservationDayKey = format(reservationDate, "yyyy-MM-dd");
      if (reservationDayKey !== dayKey) return;
      if (reservation.id === initialReservation?.id) return;
      taken.add(format(reservationDate, "HH:mm"));
    });
    return taken;
  }, [reservations, selectedCourtId, selectedDate, initialReservation]);

  const [remoteUnavailable, setRemoteUnavailable] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!selectedDate || !selectedCourtId) {
      setRemoteUnavailable(new Set());
      return;
    }
    let isMounted = true;
    async function loadAvailability() {
      try {
        const dateKey = format(selectedDate, "yyyy-MM-dd");
        const { data } = await api.reservations.availability(Number(selectedCourtId), dateKey);
        if (!isMounted) return;
        const blocked = new Set<string>((data.occupied ?? []).map((hour) => hour));
        setRemoteUnavailable(blocked);
      } catch (error) {
        console.error("Falha ao carregar disponibilidade de quadra", error);
        if (isMounted) {
          setRemoteUnavailable(new Set());
        }
      }
    }
    loadAvailability();
    return () => {
      isMounted = false;
    };
  }, [selectedDate, selectedCourtId]);

  const unavailableHours = useMemo(() => {
    const combined = new Set<string>();
    localTakenHours.forEach((hour) => combined.add(hour));
    remoteUnavailable.forEach((hour) => combined.add(hour));
    if (initialReservation) {
      combined.delete(format(new Date(initialReservation.start_time), "HH:mm"));
    }
    return combined;
  }, [localTakenHours, remoteUnavailable, initialReservation]);

  const disabledByTime = useMemo(() => {
    const map = new Map<string, boolean>();
    hourOptions.forEach((hour) => {
      const candidate = selectedDate ? setMinutes(setHours(new Date(selectedDate), Number(hour.split(":")[0])), 0) : null;
      const isPastSlot = !isEdit && candidate !== null && candidate < new Date();
      const isTaken = unavailableHours.has(hour) && hour !== selectedHour;
      map.set(hour, Boolean(isPastSlot || isTaken));
    });
    return map;
  }, [selectedDate, unavailableHours, isEdit, selectedHour, hourOptions]);

  async function handleConfirm() {
    if (!selectedDate || !selectedHour || !selectedCourtId) {
      toast.error("Preencha todos os campos para continuar.");
      return;
    }

    if (isAdmin && !selectedPlayerId) {
      toast.error("Escolha um jogador");
      return;
    }

    const court = courts.find((item) => item.id === Number(selectedCourtId));
    if (!court) {
      toast.error("Selecione uma quadra válida.");
      return;
    }

    const start = new Date(selectedDate);
    const [hour] = selectedHour.split(":").map(Number);
    start.setHours(hour, 0, 0, 0);

    if (!isEdit && start < new Date()) {
      toast.error("Escolha um horário futuro.");
      return;
    }

    const payload = {
      id: initialReservation?.id,
      court: court.id,
      start_time: format(start, "yyyy-MM-dd'T'HH:mm:ss"),
      end_time: format(addHours(start, 1), "yyyy-MM-dd'T'HH:mm:ss"),
      type: initialReservation?.type ?? "treino",
      player: isAdmin ? Number(selectedPlayerId) : undefined,
    };

    try {
      setIsSaving(true);
      await onSubmit(payload);
      toast.success(isEdit ? "Reserva atualizada" : "Reserva criada com sucesso!");
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível salvar a reserva.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar reserva" : "Nova reserva"}</DialogTitle>
          <DialogDescription>Escolha data, horário e quadra para confirmar a partida.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {isAdmin ? (
            <div>
              <Label>Jogador</Label>
              <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {players.map((player) => (
                    <SelectItem key={player.id} value={player.id.toString()}>
                      {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <div>
            <Label>Data</Label>
            {isAdmin ? (
              <div className="rounded-2xl border p-3 flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setSelectedHour("");
                    }
                  }}
                  disabled={(date) => startOfDay(date) < today}
                />
              </div>
            ) : (
              <div className="rounded-2xl border bg-muted/40 px-4 py-3 text-lg font-semibold">
                {selectedDate ? format(selectedDate, "dd/MM/yyyy") : format(today, "dd/MM/yyyy")}
              </div>
            )}
          </div>
          <div>
            <Label>Quadra</Label>
            <Select
              value={selectedCourtId}
              onValueChange={(value) => {
                setSelectedCourtId(value);
                setSelectedHour("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {courts.map((court) => (
                  <SelectItem key={court.id} value={court.id.toString()}>
                    {court.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Horário</Label>
            {isAdmin ? (
              <Select value={selectedHour} onValueChange={setSelectedHour}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {hourOptions.map((hour) => {
                    const disabled = disabledByTime.get(hour) ?? false;
                    return (
                      <SelectItem key={hour} value={hour} disabled={disabled}>
                        {hour}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            ) : (
              <>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {hourOptions.map((hour) => {
                    const disabled = disabledByTime.get(hour) ?? false;
                    return (
                      <Button
                        key={hour}
                        type="button"
                        variant={selectedHour === hour ? "default" : "outline"}
                        disabled={disabled}
                        className="w-full"
                        onClick={() => setSelectedHour(hour)}
                      >
                        {hour}
                      </Button>
                    );
                  })}
                </div>
                {hourOptions.length > 0 && hourOptions.every((hour) => disabledByTime.get(hour)) ? (
                  <p className="mt-2 text-sm text-muted-foreground">Sem horários disponíveis para hoje.</p>
                ) : null}
              </>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isSaving}>
            {isSaving ? "Salvando..." : isEdit ? "Salvar alterações" : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
