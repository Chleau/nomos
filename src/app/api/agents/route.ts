import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
    try {
        // Logique pour récupérer la liste des agents
        return NextResponse.json({ message: 'Liste des agents' });
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
        // Logique pour créer un agent
        return NextResponse.json({ message: 'Agent créé' }, { status: 201 });
    } catch {
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
