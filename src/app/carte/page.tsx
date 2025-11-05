"use client";

import React from "react";
import IncidentMap from "../../components/map/IncidentMap";
import { useAllSignalements } from "../../lib/hooks/useSignalements";
import type { Signalement } from "../../types/signalements";

export default function CartePage() {
  const { data: signalements = [], isLoading } = useAllSignalements(undefined);

  const markers = (signalements || []).map((s: Signalement) => ({
    id: String(s.id),
    titre: s.titre ?? "Incident",
    description: s.description ?? "",
    latitude: s.latitude ?? null,
    longitude: s.longitude ?? null,
    imageUrl: s.url ?? null,
    statut: s.statut ?? null,
  }));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Carte des incidents</h1>
      {isLoading ? (
        <div>Chargement des incidents…</div>
      ) : (
        <IncidentMap markers={markers} />
      )}
    </div>
  );
}
