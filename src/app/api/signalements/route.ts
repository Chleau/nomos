import { NextRequest, NextResponse } from 'next/server';
import { signalementsService } from '@/lib/services/signalements.service';

export async function GET(req: NextRequest) {
    try {
        // Récupérer le paramètre habitant_id si fourni
        const habitantId = req.nextUrl.searchParams.get('habitant_id');

        let data, error;

        if (habitantId) {
            // Si habitant_id est fourni, récupérer seulement ses signalements
            const result = await signalementsService.getByHabitant(parseInt(habitantId));
            data = result.data;
            error = result.error;
        } else {
            // Sinon, récupérer tous les signalements
            const result = await signalementsService.getAll();
            data = result.data;
            error = result.error;
        }

        if (error) {
            return NextResponse.json(
                { data: null, error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json({ data, error: null });
    } catch (err) {
        console.error('Error fetching signalements:', err);
        return NextResponse.json(
            { data: null, error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const _body = await req.json();
        // Logique pour créer un signalement
        return NextResponse.json({ message: 'Signalement créé' }, { status: 201 });
    } catch {
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
