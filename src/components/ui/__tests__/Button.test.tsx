import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from '../Button'

describe('Button', () => {
    it('devrait afficher le texte du bouton', () => {
        render(<Button>Cliquez-moi</Button>)
        expect(screen.getByRole('button', { name: /cliquez-moi/i })).toBeInTheDocument()
    })

    it('devrait appliquer la taille par défaut (md)', () => {
        render(<Button>Button</Button>)
        const button = screen.getByRole('button')
        expect(button).toHaveClass('btn--md')
    })

    it('devrait appliquer la taille spécifiée', () => {
        render(<Button size="lg">Large Button</Button>)
        const button = screen.getByRole('button')
        expect(button).toHaveClass('btn--lg')
    })

    it('devrait appliquer le variant par défaut (primary)', () => {
        render(<Button>Button</Button>)
        const button = screen.getByRole('button')
        expect(button).toHaveClass('btn-kaki')
    })

    it('devrait appliquer le variant outline', () => {
        render(<Button variant="outline">Outline Button</Button>)
        const button = screen.getByRole('button')
        expect(button).toHaveClass('btn-outline')
    })

    it('devrait appliquer le variant ghost', () => {
        render(<Button variant="ghost">Ghost Button</Button>)
        const button = screen.getByRole('button')
        expect(button).toHaveClass('btn-ghost')
    })

    it('devrait appliquer le variant pill', () => {
        render(<Button variant="pill">Pill Button</Button>)
        const button = screen.getByRole('button')
        expect(button).toHaveClass('btn-pill')
    })

    it('devrait être désactivé avec le variant disabled', () => {
        render(<Button variant="disabled">Disabled Button</Button>)
        const button = screen.getByRole('button')
        expect(button).toBeDisabled()
        expect(button).toHaveClass('btn-disabled')
    })

    it('devrait être désactivé avec la prop disabled', () => {
        render(<Button disabled>Disabled Button</Button>)
        const button = screen.getByRole('button')
        expect(button).toBeDisabled()
    })

    it('devrait gérer les clics', async () => {
        const handleClick = jest.fn()
        const user = userEvent.setup()

        render(<Button onClick={handleClick}>Click Me</Button>)
        const button = screen.getByRole('button')

        await user.click(button)

        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('ne devrait pas gérer les clics quand désactivé', async () => {
        const handleClick = jest.fn()
        const user = userEvent.setup()

        render(<Button onClick={handleClick} disabled>Click Me</Button>)
        const button = screen.getByRole('button')

        await user.click(button)

        expect(handleClick).not.toHaveBeenCalled()
    })

    it('devrait appliquer les classes personnalisées', () => {
        render(<Button className="custom-class">Button</Button>)
        const button = screen.getByRole('button')
        expect(button).toHaveClass('custom-class')
    })

    it('devrait transmettre les props HTML natives', () => {
        render(<Button type="submit" data-testid="submit-button">Submit</Button>)
        const button = screen.getByTestId('submit-button')
        expect(button).toHaveAttribute('type', 'submit')
    })

    it('devrait avoir les classes de base', () => {
        render(<Button>Button</Button>)
        const button = screen.getByRole('button')
        expect(button).toHaveClass('btn')
        expect(button).toHaveClass('inline-flex')
        expect(button).toHaveClass('items-center')
        expect(button).toHaveClass('justify-center')
    })
})
