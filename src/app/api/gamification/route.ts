import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        // Logique pour récupérer les statistiques globales de gamification
        return NextResponse.json({ message: 'Statistiques de gamification' });
    } catch (error) {
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
