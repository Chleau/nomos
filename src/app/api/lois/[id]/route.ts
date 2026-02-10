import { NextRequest, NextResponse } from 'next/server';

type Props = {
    params: {
        id: string
    }
}

export async function GET(_req: NextRequest, { params }: Props) {
    try {
        const { id } = params;
        // Logique pour récupérer une loi spécifique
        return NextResponse.json({ message: `Détails de la loi ${id}` });
    } catch {
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
