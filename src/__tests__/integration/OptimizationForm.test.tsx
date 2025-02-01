import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { OptimizationForm } from '@/components/features/optimizer/OptimizationForm'

describe('OptimizationForm', () => {
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    mockOnSuccess.mockClear()
  })

  it('renders the form correctly', () => {
    render(<OptimizationForm onSuccess={mockOnSuccess} />)
    
    expect(screen.getByLabelText(/number of cto days/i)).toBeInTheDocument()
    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
  })

  it('shows error for invalid input', async () => {
    render(<OptimizationForm onSuccess={mockOnSuccess} />)
    
    const input = screen.getByLabelText(/number of cto days/i)
    fireEvent.change(input, { target: { value: '0' } })
    
    const button = screen.getByTestId('submit-button')
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/please enter a valid number between 1 and 365/i)
    })
    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('calls onSuccess with optimized days for valid input', async () => {
    render(<OptimizationForm onSuccess={mockOnSuccess} />)
    
    const input = screen.getByLabelText(/number of cto days/i)
    fireEvent.change(input, { target: { value: '5' } })
    
    const button = screen.getByTestId('submit-button')
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
    
    const result = mockOnSuccess.mock.calls[0][0]
    expect(result).toHaveProperty('optimizedDays')
    expect(Array.isArray(result.optimizedDays)).toBe(true)
  })

  it('handles loading state correctly', async () => {
    render(<OptimizationForm onSuccess={mockOnSuccess} />)
    
    const input = screen.getByLabelText(/number of cto days/i)
    fireEvent.change(input, { target: { value: '5' } })
    
    const button = screen.getByTestId('submit-button')
    
    // Mock a delay in the optimization process
    mockOnSuccess.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    fireEvent.click(button)
    
    // Check loading state
    await waitFor(() => {
      expect(button).toBeDisabled()
      expect(button).toHaveTextContent(/optimizing/i)
      expect(input).toBeDisabled()
    }, { timeout: 1000 })
    
    // Check final state
    await waitFor(() => {
      expect(button).not.toBeDisabled()
      expect(button).toHaveTextContent(/optimize schedule/i)
      expect(input).not.toBeDisabled()
    }, { timeout: 1000 })
  })
}) 