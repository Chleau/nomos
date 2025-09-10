import { NextRequest, NextResponse } from 'next/server';

type Props = {
    params: {
        id: string
    }
}

export async function GET(req: NextRequest, { params }: Props) {
    try {
        const { id } = params;
        // Logique pour récupérer les photos d'un signalement
        return NextResponse.json({ message: `Photos du signalement ${id}` });
    } catch (error) {
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest, { params }: Props) {
    try {
        const { id } = params;
        // Logique pour ajouter une photo à un signalement
        return NextResponse.json({ message: `Photo ajoutée au signalement ${id}` }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest, { params }: Props) {
    try {
        const { id } = params;
        // Logique pour supprimer une photo d'un signalement
        return NextResponse.json({ message: `Photo supprimée du signalement ${id}` });
    } catch (error) {
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
