import './globals.css';

export const metadata = {
  title: 'AI Image App',
  description: 'Upload model and clothing images to generate styled outputs',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head><link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" /></head>
      <body>{children}</body>
    </html>
  );
}
