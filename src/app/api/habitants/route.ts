import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const authUserId = searchParams.get('auth_user_id');

        let query = supabase
            .from('habitants')
            .select('*, communes(*)');

        if (authUserId) {
            query = query.eq('auth_user_id', authUserId);
        }

        const { data, error } = await query;

        if (error) {
            logger.error('Error fetching habitants', error, { context: 'API.habitants' });
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ data, error: null });
    } catch (error) {
        logger.error('Unexpected error', error, { context: 'API.habitants' });
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const _body = await req.json();
        // Logique pour créer un habitant
        return NextResponse.json({ message: 'Habitant créé' }, { status: 201 });
    } catch {
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
