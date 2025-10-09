// Color palette for charts
export const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
];

// Card gradient styles
export const cardGradientStyle = (gradient: string) => ({
  borderRadius: 16,
  background: gradient,
  color: '#fff',
  textAlign: 'center' as const,
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
});

// Gradient presets
export const GRADIENTS = {
  purple: 'linear-gradient(135deg, #667eea, #764ba2)',
  teal: 'linear-gradient(135deg, #43cea2, #185a9d)',
  pink: 'linear-gradient(135deg, #f093fb, #f5576c)',
  orange: 'linear-gradient(135deg, #ff6a00, #ee0979)',
  green: 'linear-gradient(135deg, #11998e, #38ef7d)',
  red: 'linear-gradient(135deg, #ee0979, #ff6a00)',
  yellow: 'linear-gradient(135deg, #fc4a1a, #f7b733)',
  blue: 'linear-gradient(135deg, #4776e6, #8e54e9)',
  // Inventory card gradients
  lightPink: 'linear-gradient(135deg, #c084fc, #60a5fa)', // Purple to Blue for Total Stock Value
  peach: 'linear-gradient(135deg, #fb7185, #fbbf24)', // Pink to Yellow for Dead Stock
  darkBlue: 'linear-gradient(135deg, #0d9488, #7c3aed)', // Teal to Purple for Fast Moving
  pastel: 'linear-gradient(135deg, #60a5fa, #f472b6)', // Blue to Pink for Slow Moving
};

