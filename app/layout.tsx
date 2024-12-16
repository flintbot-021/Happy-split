import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="max-w-3xl mx-auto px-4 sm:px-6">
        {children}
      </body>
    </html>
  )
} 