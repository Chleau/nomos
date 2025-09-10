import { NextRequest, NextResponse } from 'next/server';

type Props = {
    params: {
        habitantId: string
    }
}

export async function GET(req: NextRequest, { params }: Props) {
    try {
        const { habitantId } = params;
        // Logique pour récupérer les points et badges d'un habitant
        return NextResponse.json({ message: `Points et badges de l'habitant ${habitantId}` });
    } catch (error) {
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
