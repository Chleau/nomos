import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
    try {
        // Logique pour récupérer la liste des types de signalement
        return NextResponse.json({ message: 'Liste des types de signalement' });
    } catch {
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
