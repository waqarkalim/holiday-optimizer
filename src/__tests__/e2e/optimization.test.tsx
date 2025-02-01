import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Home from '@/app/page'

describe('Optimization Flow', () => {
  it('completes the full optimization flow', async () => {
    render(<Home />)
    
    // Check initial render
    expect(screen.getByRole('heading', { name: /cto days optimizer/i })).toBeInTheDocument()
    expect(screen.getByText(/maximize your time off/i)).toBeInTheDocument()
    
    // Results should not be visible initially
    expect(screen.queryByText(/optimization results/i)).not.toBeInTheDocument()
    
    // Enter CTO days
    const input = screen.getByLabelText(/number of cto days/i)
    fireEvent.change(input, { target: { value: '5' } })
    
    // Submit form
    const button = screen.getByRole('button', { name: /optimize schedule/i })
    fireEvent.click(button)
    
    // Wait for results to appear
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /optimization results/i })).toBeInTheDocument()
    })
    
    // Check if calendar is displayed
    const months = screen.getAllByRole('heading', { level: 4 })
    expect(months.some(month => month.textContent?.toLowerCase().includes('january'))).toBe(true)
    expect(months.some(month => month.textContent?.toLowerCase().includes('december'))).toBe(true)
    
    // Check if legend is displayed
    const legend = screen.getByRole('heading', { name: /legend/i }).closest('div')
    expect(legend).toHaveTextContent(/cto day/i)
    expect(legend).toHaveTextContent(/holiday/i)
    expect(legend).toHaveTextContent(/extended weekend/i)
    expect(legend).toHaveTextContent(/regular day/i)
    
    // Verify optimization summary
    const summary = screen.getByRole('heading', { name: /optimization results/i }).closest('div')
    expect(summary).toHaveTextContent(/total consecutive days off/i)
    expect(summary).toHaveTextContent(/5 cto days/i)
  })

  it('handles error cases gracefully', async () => {
    render(<Home />)
    
    // Try submitting with invalid input
    const input = screen.getByLabelText(/number of cto days/i)
    fireEvent.change(input, { target: { value: '0' } })
    
    const button = screen.getByRole('button', { name: /optimize schedule/i })
    fireEvent.click(button)
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/please enter a valid number between 1 and 365/i)
    })
    
    // Results should not be displayed
    expect(screen.queryByText(/optimization results/i)).not.toBeInTheDocument()
  })
}) 