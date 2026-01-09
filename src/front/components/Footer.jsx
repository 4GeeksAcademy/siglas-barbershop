export const Footer = () => {
  return (
    <footer className="bg-white border-top mt-auto">
      <div className="container py-3 text-center text-muted small">
        © {new Date().getFullYear()} BarberSys · Sistema de gestión de barberías
      </div>
    </footer>
  );
};
