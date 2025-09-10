import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        // Logique pour récupérer la liste des habitants
        return NextResponse.json({ message: 'Liste des habitants' });
    } catch (error) {
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // Logique pour créer un habitant
        return NextResponse.json({ message: 'Habitant créé' }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
