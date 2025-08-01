# Mentorscue Accounting Dashboard

A modern, professional accounting dashboard built with Next.js, TypeScript, and Supabase. This application provides comprehensive financial tracking with beautiful charts and analytics.

## 🚀 Features

### 📊 **Advanced Analytics**
- **Monthly Trends Chart** - Track income, expenses, and balance over time
- **Savings Rate Trend** - Monitor your savings percentage monthly
- **Expense vs Income Ratio** - Visualize spending efficiency
- **Category Breakdown** - See spending patterns by category
- **Interactive Charts** - Toggle between different data views

### 💰 **Financial Management**
- **Real-time Data** - Instant updates with Supabase real-time subscriptions
- **Multi-user Support** - Secure user authentication and data isolation
- **Category Management** - Organized income and expense categories
- **Data Export** - Export financial reports (coming soon)

### 🎨 **Professional UI**
- **Modern Design** - Clean, professional interface with Tailwind CSS
- **Responsive Layout** - Works perfectly on desktop, tablet, and mobile
- **Dark/Light Mode** - Theme switching capability
- **Interactive Elements** - Smooth animations and transitions

### 🔒 **Security & Performance**
- **Supabase Authentication** - Secure Google OAuth integration
- **Real-time Updates** - Live data synchronization
- **Optimized Performance** - Fast loading with Next.js
- **Type Safety** - Full TypeScript implementation

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Charts**: Chart.js with React Chart.js 2
- **Backend**: Supabase (PostgreSQL, Real-time, Auth)
- **Deployment**: Vercel (Free tier available)

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone the Repository
```bash
git clone <repository-url>
cd mentorscue-accounting
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Supabase Database Setup

#### Create the Database Table
Run this SQL in your Supabase SQL editor:

```sql
-- Create the accounting_entries table
CREATE TABLE accounting_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Income', 'Expense')),
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE accounting_entries ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their entries
CREATE POLICY "Users can view their own entries" ON accounting_entries
  FOR ALL USING (auth.jwt() ->> 'email' = created_by);

-- Create indexes for better performance
CREATE INDEX idx_accounting_entries_created_by ON accounting_entries(created_by);
CREATE INDEX idx_accounting_entries_date ON accounting_entries(date);
CREATE INDEX idx_accounting_entries_type ON accounting_entries(type);
```

### 5. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Add environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Deploy**
- Vercel will automatically deploy your app
- Get a free custom domain

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 📊 Features Breakdown

### Dashboard Overview
- **Summary Cards**: Total income, expenses, balance, and savings rate
- **Real-time Updates**: Live data synchronization
- **Responsive Design**: Works on all devices

### Chart Analytics
1. **Monthly Trends**
   - Income, expenses, and balance over time
   - Interactive toggle buttons
   - Smooth line charts

2. **Savings Rate Trend**
   - Percentage of income saved monthly
   - Filled area chart with trend line

3. **Expense Ratio**
   - What percentage of income goes to expenses
   - Bar chart visualization

4. **Category Breakdown**
   - Doughnut chart by category
   - Toggle between income, expenses, or all

### Data Management
- **Add Entries**: Quick form with validation
- **Delete Entries**: Secure deletion with confirmation
- **Category Filtering**: Dynamic category options
- **Date Filtering**: Filter by date ranges

## 🔧 Customization

### Adding New Categories
Edit the `getCategoryOptions` function in `src/components/dashboard.tsx`:

```typescript
const getCategoryOptions = (type: 'Income' | 'Expense') => {
  const categories = {
    Income: ['Salary', 'Freelance', 'Investment', 'Business', 'Other'],
    Expense: ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Other']
  }
  return categories[type]
}
```

### Styling Customization
- Modify `src/app/globals.css` for theme changes
- Update component styles in individual files
- Customize chart colors in chart components

## 🚀 Performance Optimizations

- **Server-side Rendering**: Fast initial page loads
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic bundle splitting
- **Caching**: Built-in caching strategies

## 🔒 Security Features

- **Row Level Security**: Database-level security
- **Authentication**: Google OAuth integration
- **Input Validation**: Client and server-side validation
- **SQL Injection Protection**: Supabase built-in protection

## 📱 Mobile Responsiveness

The dashboard is fully responsive with:
- **Mobile-first design**
- **Touch-friendly interactions**
- **Optimized charts for mobile**
- **Responsive tables**

## 🎯 Future Enhancements

- [ ] **PDF Export**: Generate financial reports
- [ ] **Data Import**: CSV/Excel import functionality
- [ ] **Budget Planning**: Set and track budgets
- [ ] **Goal Tracking**: Financial goal setting
- [ ] **Notifications**: Email/SMS alerts
- [ ] **Multi-currency**: Support for different currencies
- [ ] **Advanced Filters**: Date ranges, categories, amounts
- [ ] **Data Backup**: Automatic backup functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ using Next.js, TypeScript, and Supabase**
