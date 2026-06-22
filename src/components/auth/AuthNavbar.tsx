import { Link } from 'react-router-dom';

export default function AuthNavbar() {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-margin-mobile py-6 md:px-margin-desktop">
      <Link
        to="/"
        className="font-headline-lg text-headline-lg font-bold tracking-tight text-primary transition-all hover:tracking-widest"
      >
        VOLVIQ AI
      </Link>
      <Link
        to="/"
        className="font-label-md text-label-md text-on-surface-variant transition-colors hover:text-primary"
      >
        Back to home
      </Link>
    </nav>
  );
}
