export function RACLogo({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Red circle background */}
      <circle cx="50" cy="50" r="48" fill="#E31837" />
      
      {/* Blue inner circle */}
      <circle cx="50" cy="50" r="40" fill="#0057A0" />
      
      {/* Yellow RAC text - simplified representation */}
      <text
        x="50"
        y="55"
        fontFamily="Arial, sans-serif"
        fontSize="28"
        fontWeight="bold"
        fill="#FFD200"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        RAC
      </text>
      
      {/* Rent-A-Center text */}
      <text
        x="50"
        y="75"
        fontFamily="Arial, sans-serif"
        fontSize="8"
        fill="white"
        textAnchor="middle"
      >
        Rent-A-Center
      </text>
    </svg>
  );
}
