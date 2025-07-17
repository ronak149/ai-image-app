import './globals.css';

export const metadata = {
  title: 'AI Image App',
  description: 'Upload model and clothing images to generate styled outputs',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
