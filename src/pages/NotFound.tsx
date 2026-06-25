import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-neutral-50 p-6 text-center">
      <h1 className="text-3xl font-bold text-neutral-900">404</h1>
      <p className="text-neutral-600">This page doesn't exist.</p>
      <Link to="/" className="text-blue-600 underline">
        Back to the console
      </Link>
    </div>
  );
}
