'use client'

import { RoleProtectedPage } from '@/components/auth/RoleProtectedPage';
import { UserRole } from '@/types/auth';

export default function MaMairiePagePage() {
  return (
    <RoleProtectedPage allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MAIRIE]}>
      <div style={{ padding: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px' }}>Ma mairie</h1>
        <div style={{ 
          padding: '40px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '18px', color: '#666' }}>Cette page sera implémentée prochainement</p>
        </div>
      </div>
    </RoleProtectedPage>
  );
}
