'use client'

import { useState, useEffect } from 'react'
import { MapPinIcon } from '@heroicons/react/24/outline'
import { logger } from '@/lib/logger'

interface AddressCellProps {
    latitude?: number
    longitude?: number
    fallback: string
}

export function AddressCell({ latitude, longitude, fallback }: AddressCellProps) {
    const [address, setAddress] = useState<string | null>(null)
    const [fullAddress, setFullAddress] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!latitude || !longitude) return

        const reverseGeocode = async (lat: number, lon: number) => {
            setLoading(true)
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
                    {
                        headers: {
                            'User-Agent': 'Nomos-App'
                        }
                    }
                )
                const data = await response.json()

                if (data && data.address) {
                    const houseNumber = data.address.house_number || ''
                    const road = data.address.road || data.address.street || data.address.street_name || ''
                    const city = data.address.city || data.address.town || data.address.village || data.address.municipality || ''
                    const postalCode = data.address.postcode || ''

                    const streetAddr = `${houseNumber} ${road}`.trim()
                    const completeAddr = `${streetAddr}, ${postalCode} ${city}`.trim()

                    setAddress(streetAddr || road || city)
                    setFullAddress(completeAddr)
                }
            } catch (error) {
                logger.error('Erreur de reverse géocodage dans le tableau', error, { context: 'AddressCell' })
            } finally {
                setLoading(false)
            }
        }

        reverseGeocode(latitude, longitude)
    }, [latitude, longitude])

    return (
        <div className="flex items-center gap-2 max-w-[180px]">
            <MapPinIcon className="w-4 h-4 text-gray-400 shrink-0" />
            <span
                className="text-[#242a35] text-sm truncate cursor-pointer"
                title={loading ? 'Recherche d\'adresse...' : (fullAddress || fallback)}
            >
                {loading ? (
                    <span className="text-gray-400 italic">Recherche...</span>
                ) : (
                    address || fallback
                )}
            </span>
        </div>
    )
}
