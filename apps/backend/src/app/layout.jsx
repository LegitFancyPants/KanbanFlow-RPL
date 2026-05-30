import './globals.css';

export const metadata = {
  title: 'KanbanFlow',
  description: 'Kanban Flow Project Management',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
