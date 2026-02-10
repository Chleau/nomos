import { NextRequest, NextResponse } from 'next/server';

type Props = {
    params: {
        id: string
    }
}

export async function GET(_req: NextRequest, { params }: Props) {
    try {
        const { id } = params;
        // Logique pour récupérer un arrêté spécifique
        return NextResponse.json({ message: `Détails de l'arrêté ${id}` });
    } catch {
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest, { params }: Props) {
    try {
        const { id } = params;
        const _body = await req.json();
        // Logique pour mettre à jour un arrêté
        return NextResponse.json({ message: `Arrêté ${id} mis à jour` });
    } catch {
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

export async function DELETE(_req: NextRequest, { params }: Props) {
    try {
        const { id } = params;
        // Logique pour supprimer un arrêté
        return NextResponse.json({ message: `Arrêté ${id} supprimé` });
    } catch {
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
