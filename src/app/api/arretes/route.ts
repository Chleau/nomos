import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
    try {
        // Logique pour récupérer la liste des arrêtés
        return NextResponse.json({ message: 'Liste des arrêtés' });
    } catch {
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const _body = await req.json();
        // Logique pour créer un arrêté
        return NextResponse.json({ message: 'Arrêté créé' }, { status: 201 });
    } catch {
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
