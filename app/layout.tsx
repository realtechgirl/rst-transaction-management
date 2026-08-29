import "./globals.css";

export const metadata = { title: "RST Transaction Management", description: "A practical transaction coordinator workspace" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
