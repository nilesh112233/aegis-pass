type AegisLogoProps = {
    className?: string
    size?: number
}


function AegisPassShield({
    className,
    size = 30
}: AegisLogoProps) {
  return (
    <div className={className}>
            <svg
                className="relative z-10"
                width={size}
                height={size}
                viewBox="0 0 40 44"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
            <path
                d="M20 2.5L4 9V21C4 30.5 11 37.5 20 41C29 37.5 36 30.5 36 21V9L20 2.5Z"
                fill="none"
                stroke="hsl(var(--accent-brand))"
                strokeWidth="4"
                strokeLinejoin="round"
            />
            <circle cx="20" cy="17" r="5" fill="hsl(var(--accent-brand))" />
            <rect
                x="18.2"
                y="21.5"
                width="4"
                height="8.5"
                fill="hsl(var(--accent-brand))"
            />
        </svg>
    </div>
  )
}

export default AegisPassShield