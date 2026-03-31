/**
 * 3.5" floppy disk icon with animated metal shutter.
 * The shutter slides left on hover to reveal the disk window.
 * Parent element needs the `group` class.
 */
export default function FloppyIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.25}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            {/* Body with chamfered top-right corner */}
            <path d="M4 2h13l5 5v15a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />

            {/* Label area */}
            <rect x="5" y="15" width="14" height="7" rx="0.5" />
            <line x1="7" y1="18" x2="17" y2="18" />
            <line x1="7" y1="20" x2="13" y2="20" />

            {/* Metal shutter - clipped to window area, slides left on hover */}
            <defs>
                <clipPath id="floppy-window">
                    <rect x="6" y="3" width="10" height="6" />
                </clipPath>
            </defs>
            <g
                clipPath="url(#floppy-window)"
                className="transition-transform duration-200 group-hover:-translate-x-0.5 group-active:-translate-x-0.5"
            >
                {/* Shutter plate with cutout notch on the right */}
                <path
                    fillRule="evenodd"
                    fill="currentColor"
                    stroke="none"
                    d="M7 3h10v6H7V3z M13 3.5a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h0a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1z"
                />
            </g>
        </svg>
    );
}