'use client';

export default function CarteIncidentsPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ 
        fontSize: '32px', 
        fontWeight: 'bold', 
        color: '#1e293b', 
        marginBottom: '20px' 
      }}>
        Carte des incidents
      </h1>
      <p style={{ 
        fontSize: '16px', 
        color: '#64748b',
        lineHeight: '1.6' 
      }}>
        Cette page affichera une carte interactive des incidents signalés dans votre commune.
      </p>
      
    </div>
  );
}