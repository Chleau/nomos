#!/bin/bash

# Script pour créer un nouveau fichier de test
# Usage: ./scripts/create-test.sh <type> <nom>
# Exemples:
#   ./scripts/create-test.sh service auth
#   ./scripts/create-test.sh hook useAuth
#   ./scripts/create-test.sh component Button

set -e

TYPE=$1
NAME=$2

if [ -z "$TYPE" ] || [ -z "$NAME" ]; then
  echo "Usage: ./scripts/create-test.sh <type> <nom>"
  echo ""
  echo "Types disponibles:"
  echo "  service    - Crée un test de service"
  echo "  hook       - Crée un test de hook"
  echo "  component  - Crée un test de composant"
  echo ""
  echo "Exemples:"
  echo "  ./scripts/create-test.sh service auth"
  echo "  ./scripts/create-test.sh hook useAuth"
  echo "  ./scripts/create-test.sh component Button"
  exit 1
fi

case $TYPE in
  service)
    DIR="src/lib/services/__tests__"
    FILE="${DIR}/${NAME}.service.test.ts"
    TEMPLATE="import { ${NAME}Service } from '../${NAME}.service'
import { supabase } from '../../supabase/client'

jest.mock('../../supabase/client', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

describe('${NAME}Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('methodName', () => {
    it('devrait faire quelque chose', async () => {
      // Arrange
      const mockData = { id: 1 }
      const mockResponse = { data: mockData, error: null }

      // Mock Supabase
      ;(supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockResponse)
      })

      // Act
      const result = await ${NAME}Service.methodName()

      // Assert
      expect(result.data).toEqual(mockData)
      expect(result.error).toBeNull()
    })
  })
})
"
    ;;

  hook)
    DIR="src/lib/hooks/__tests__"
    FILE="${DIR}/${NAME}.test.tsx"
    TEMPLATE="import { renderHook, waitFor } from '@testing-library/react'
import { ${NAME} } from '../${NAME}'
import { createTestWrapper } from '../../test-utils'

// Mock des dépendances
jest.mock('../../services/yourService')

describe('${NAME}', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('devrait initialiser correctement', () => {
    const { result } = renderHook(() => ${NAME}(), {
      wrapper: createTestWrapper()
    })

    expect(result.current).toBeDefined()
  })

  it('devrait gérer les mutations', async () => {
    const { result } = renderHook(() => ${NAME}(), {
      wrapper: createTestWrapper()
    })

    // Act
    result.current.mutation.mutate({ /* data */ })

    // Assert
    await waitFor(() => 
      expect(result.current.mutation.isSuccess).toBe(true)
    )
  })
})
"
    ;;

  component)
    DIR="src/components/__tests__"
    FILE="${DIR}/${NAME}.test.tsx"
    TEMPLATE="import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ${NAME} from '../${NAME}'

describe('${NAME}', () => {
  it('devrait s\\'afficher correctement', () => {
    render(<${NAME} />)
    
    // Vérifier que le composant est rendu
    expect(screen.getByRole('...').toBeInTheDocument()
  })

  it('devrait gérer les interactions utilisateur', async () => {
    const user = userEvent.setup()
    const mockHandler = jest.fn()
    
    render(<${NAME} onClick={mockHandler} />)
    
    // Interaction
    await user.click(screen.getByRole('button'))
    
    // Vérification
    expect(mockHandler).toHaveBeenCalledTimes(1)
  })

  it('devrait afficher les props correctement', () => {
    const props = {
      title: 'Test Title',
      description: 'Test Description'
    }
    
    render(<${NAME} {...props} />)
    
    expect(screen.getByText(props.title)).toBeInTheDocument()
    expect(screen.getByText(props.description)).toBeInTheDocument()
  })
})
"
    ;;

  *)
    echo "Type inconnu: $TYPE"
    echo "Types disponibles: service, hook, component"
    exit 1
    ;;
esac

# Créer le dossier s'il n'existe pas
mkdir -p "$DIR"

# Créer le fichier
if [ -f "$FILE" ]; then
  echo "❌ Le fichier existe déjà: $FILE"
  exit 1
fi

echo "$TEMPLATE" > "$FILE"
echo "✅ Fichier de test créé: $FILE"
echo ""
echo "Pour lancer ce test:"
echo "  npm test $FILE"
