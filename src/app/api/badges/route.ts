import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
    try {
        // Logique pour récupérer la liste des badges
        return NextResponse.json({ message: 'Liste des badges disponibles' });
    } catch {
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
