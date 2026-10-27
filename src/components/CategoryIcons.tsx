import React from 'react';

export interface VehicleIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

// 1. Scooter Elétrica / Autopropelido
export const ScooterIcon = ({ className = 'w-6 h-6', ...props }: VehicleIconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Roda traseira */}
    <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <circle cx="6" cy="18" r="1" fill="currentColor" />
    {/* Roda dianteira */}
    <circle cx="18" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <circle cx="18" cy="18" r="1" fill="currentColor" />
    {/* Chassi, assoalho e carenagem */}
    <path
      d="M6 15h4c1 0 1.5-.5 2-2l1-4.5c.3-1.2 1.3-2 2.5-2h1.5M16 6.5h1.5M16.5 5v3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Banco e carenagem traseira */}
    <path
      d="M4.5 13.5c0-1.5 1-2.5 3-2.5h2.5l-.8 4H5.5a1 1 0 01-1-1.5z"
      fill="currentColor"
    />
    <path
      d="M5 11c1-1 3.5-1 4.5 0"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// 2. Bicicleta Elétrica / Bike
export const BikeIcon = ({ className = 'w-6 h-6', ...props }: VehicleIconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Roda traseira */}
    <circle cx="5" cy="17" r="3.5" />
    {/* Roda dianteira */}
    <circle cx="19" cy="17" r="3.5" />
    {/* Quadro / Triângulo */}
    <path d="M5 17l4.5-7h4.5l-4 7H5z" />
    {/* Garfo dianteiro e guidão */}
    <path d="M14 10l5 7M14 10l-1.5-3.5h3" />
    {/* Canote e selim */}
    <path d="M9.5 10l-2-3h3" />
    {/* Bateria central */}
    <rect x="8.5" y="11" width="3" height="1.8" rx="0.5" fill="currentColor" />
  </svg>
);

// 3. Triciclo Elétrico (com baú/assento duplo traseiro)
export const TricycleIcon = ({ className = 'w-6 h-6', ...props }: VehicleIconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Roda traseira */}
    <circle cx="5.5" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <circle cx="5.5" cy="18" r="1" fill="currentColor" />
    {/* Roda dianteira */}
    <circle cx="18.5" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <circle cx="18.5" cy="18" r="1" fill="currentColor" />
    {/* Baú / Cabine de carga traseira */}
    <rect x="3.5" y="10" width="6" height="5" rx="1" fill="currentColor" />
    {/* Chassi e assoalho */}
    <path
      d="M9 15h4c1 0 1.5-.5 2-2l1.2-5c.3-1 1-1.5 2-1.5h1"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Guidão */}
    <path d="M17 6.5h2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* Assento condutor */}
    <path d="M11.5 11.5h2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 4. Patinete Elétrico
export const ScooterKickIcon = ({ className = 'w-6 h-6', ...props }: VehicleIconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Roda traseira */}
    <circle cx="5" cy="18.5" r="2" fill="currentColor" />
    {/* Roda dianteira */}
    <circle cx="19" cy="18.5" r="2" fill="currentColor" />
    {/* Prancha (Deck) */}
    <path d="M5 18.5h10.5" strokeWidth="2.5" />
    {/* Haste de direção e guidão */}
    <path d="M15.5 18.5l2.5-12M16 6.5h4" />
  </svg>
);

// 5. Acessórios / Peças (Chave inglesa + engrenagem)
export const AccessoriesIcon = ({ className = 'w-6 h-6', ...props }: VehicleIconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
  </svg>
);
