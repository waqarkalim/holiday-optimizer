# Holiday Optimizer

A smart vacation day optimizer that helps you maximize your time off by strategically planning your holidays around weekends and public holidays.

## Features

- 🎯 **Smart Optimization**: Automatically finds the best days to take off based on your preferences
- 📅 **Multiple Strategies**:
  - Balanced Mix: Optimal combination of short and long breaks
  - Long Weekends: Maximize the number of extended weekends
  - Mini Breaks: Spread out into shorter breaks
  - Week-long Breaks: Focus on week-length vacations
  - Extended Vacations: Combine days for longer holidays
- 🌍 **Public Holiday Integration**: Considers public holidays in your planning
- 📊 **Visual Calendar**: See your optimized schedule in an interactive calendar
- 🔄 **Real-time Updates**: Instantly see how changes affect your yearly schedule
- 🌙 **Dark Mode Support**: Comfortable viewing in any lighting condition

## Getting Started

### Prerequisites

- Node.js 20.x or later
- pnpm (recommended) or npm

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/holiday-optimizer.git
cd holiday-optimizer
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) to view the application

## Project Structure

```
holiday-optimizer/
├── src/
│   ├── app/              # Next.js app router
│   ├── components/       # React components
│   ├── contexts/         # React contexts
│   ├── services/         # Business logic
│   └── types/           # TypeScript types
└── public/             # Static assets
```

## How It Works

The optimizer uses sophisticated algorithms to:
1. Analyze your available vacation days
2. Consider public holidays and weekends
3. Apply your chosen strategy
4. Calculate optimal break periods
5. Balance different types of breaks
6. Account for seasonal factors

The optimization strategies include:
- **Balanced Mix**: Optimal distribution of short and long breaks throughout the year
- **Long Weekends**: Maximizes the number of extended weekends by strategically placing days off
- **Mini Breaks**: Creates shorter, more frequent breaks spread throughout the year
- **Week-long Breaks**: Focuses on creating full-week vacation periods
- **Extended Vacations**: Combines days for longer vacation periods, perfect for extensive travel

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Tech Stack

- 🚀 [Next.js](https://nextjs.org) - React framework
- 💅 [Tailwind CSS](https://tailwindcss.com) - Styling
- 📅 [date-fns](https://date-fns.org) - Date manipulation
- 🌙 Dark mode support
- �� Responsive design
